import { Injectable } from "@nestjs/common";
import { Prisma, PurchaseReturnStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { PurchaseReceiptsRepository } from "../purchase-receipts/purchase-receipts.repository";
import {
  StockMovementsRepository,
  StockUpdateRejectedError,
} from "../stock-movements/stock-movements.repository";

export type PurchaseReturnRecord = Prisma.PurchaseReturnGetPayload<object>;
export type PurchaseReturnWithLines = Prisma.PurchaseReturnGetPayload<{
  include: { lines: true };
}>;

export interface CreatePurchaseReturnData {
  workspaceId: string;
  number: string;
  purchaseReceiptId: string;
  reason?: string;
  notes?: string;
}

export interface UpdatePurchaseReturnData {
  number?: string;
  reason?: string;
  notes?: string;
}

export interface PurchaseReturnLineData {
  workspaceId: string;
  purchaseReturnId: string;
  purchaseReceiptLineId: string;
  inventoryItemId: string;
  quantity: Prisma.Decimal;
  reason?: string;
}

export class PurchaseReturnReceiptUnavailableError extends Error {
  constructor() {
    super("Purchase receipt is not available for return");
    this.name = "PurchaseReturnReceiptUnavailableError";
  }
}

export class PurchaseReturnStateConflictError extends Error {
  constructor() {
    super("Purchase return state changed concurrently");
    this.name = "PurchaseReturnStateConflictError";
  }
}

export class PurchaseReturnLineReferenceError extends Error {
  constructor() {
    super("Purchase return line references are inconsistent");
    this.name = "PurchaseReturnLineReferenceError";
  }
}

export class PurchaseReturnOverQuantityError extends Error {
  constructor() {
    super("Returned quantity would exceed received quantity");
    this.name = "PurchaseReturnOverQuantityError";
  }
}

export class PurchaseReturnLineNotFoundError extends Error {
  constructor() {
    super("Purchase return line was not found");
    this.name = "PurchaseReturnLineNotFoundError";
  }
}

export class PurchaseReturnEmptyError extends Error {
  constructor() {
    super("Purchase return has no lines");
    this.name = "PurchaseReturnEmptyError";
  }
}

export class PurchaseReturnStockRejectedError extends Error {
  constructor() {
    super("Purchase return stock update was rejected");
    this.name = "PurchaseReturnStockRejectedError";
  }
}

@Injectable()
export class PurchaseReturnsRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly purchaseReceiptsRepository: PurchaseReceiptsRepository,
    private readonly stockMovementsRepository: StockMovementsRepository,
  ) {}

  create(data: CreatePurchaseReturnData): Promise<PurchaseReturnWithLines> {
    return this.prisma.$transaction(
      async (transaction) => {
        await this.requireReceivedReceipt(
          transaction,
          data.workspaceId,
          data.purchaseReceiptId,
        );

        return transaction.purchaseReturn.create({
          data,
          include: { lines: { orderBy: this.lineOrder } },
        });
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  update(
    workspaceId: string,
    id: string,
    data: UpdatePurchaseReturnData,
  ): Promise<PurchaseReturnWithLines> {
    return this.prisma.$transaction(
      async (transaction) => {
        const returns = await transaction.purchaseReturn.updateManyAndReturn({
          where: { id, workspaceId, status: PurchaseReturnStatus.DRAFT },
          data,
          select: { id: true },
        });

        if (!returns[0]) {
          throw new PurchaseReturnStateConflictError();
        }

        return this.findByIdOrThrow(transaction, workspaceId, id);
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  findById(
    workspaceId: string,
    id: string,
  ): Promise<PurchaseReturnWithLines | null> {
    return this.prisma.purchaseReturn.findFirst({
      where: { id, workspaceId },
      include: { lines: { orderBy: this.lineOrder } },
    });
  }

  findByWorkspace(workspaceId: string): Promise<PurchaseReturnRecord[]> {
    return this.prisma.purchaseReturn.findMany({
      where: { workspaceId },
      orderBy: [{ createdAt: "desc" }, { number: "asc" }],
    });
  }

  addLine(data: PurchaseReturnLineData): Promise<PurchaseReturnWithLines> {
    return this.prisma.$transaction(
      async (transaction) => {
        const purchaseReceiptId = await this.requireDraftContext(
          transaction,
          data.workspaceId,
          data.purchaseReturnId,
        );
        const receiptLine = await this.requireReceivedLine(
          transaction,
          data.workspaceId,
          purchaseReceiptId,
          data.purchaseReceiptLineId,
          data.inventoryItemId,
        );
        await this.validateDraftQuantity(
          transaction,
          data,
          receiptLine.quantity,
        );

        await transaction.purchaseReturnLine.create({ data });
        return this.findByIdOrThrow(
          transaction,
          data.workspaceId,
          data.purchaseReturnId,
        );
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  updateLine(
    workspaceId: string,
    purchaseReturnId: string,
    lineId: string,
    data: Omit<PurchaseReturnLineData, "workspaceId" | "purchaseReturnId">,
  ): Promise<PurchaseReturnWithLines> {
    return this.prisma.$transaction(
      async (transaction) => {
        const purchaseReceiptId = await this.requireDraftContext(
          transaction,
          workspaceId,
          purchaseReturnId,
        );
        const existing = await transaction.purchaseReturnLine.findFirst({
          where: { id: lineId, workspaceId, purchaseReturnId },
          select: { id: true },
        });

        if (!existing) {
          throw new PurchaseReturnLineNotFoundError();
        }

        const receiptLine = await this.requireReceivedLine(
          transaction,
          workspaceId,
          purchaseReceiptId,
          data.purchaseReceiptLineId,
          data.inventoryItemId,
        );
        await this.validateDraftQuantity(
          transaction,
          { workspaceId, purchaseReturnId, ...data },
          receiptLine.quantity,
          lineId,
        );

        await transaction.purchaseReturnLine.update({
          where: { id: lineId, workspaceId, purchaseReturnId },
          data,
        });
        return this.findByIdOrThrow(transaction, workspaceId, purchaseReturnId);
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  confirm(workspaceId: string, id: string): Promise<PurchaseReturnWithLines> {
    return this.prisma.$transaction(
      async (transaction) => {
        const returnedAt = new Date();
        const returns = await transaction.purchaseReturn.updateManyAndReturn({
          where: {
            id,
            workspaceId,
            status: {
              in: [PurchaseReturnStatus.DRAFT, PurchaseReturnStatus.READY],
            },
            lines: { some: {} },
          },
          data: { status: PurchaseReturnStatus.RETURNED, returnedAt },
          select: { id: true, purchaseReceiptId: true, reason: true },
        });
        const purchaseReturn = returns[0];

        if (!purchaseReturn) {
          throw new PurchaseReturnStateConflictError();
        }

        await this.requireReceivedReceipt(
          transaction,
          workspaceId,
          purchaseReturn.purchaseReceiptId,
        );
        const lines = await transaction.purchaseReturnLine.findMany({
          where: { workspaceId, purchaseReturnId: id },
          orderBy: { id: "asc" },
        });

        if (lines.length === 0) {
          throw new PurchaseReturnEmptyError();
        }

        const grouped = new Map<string, Prisma.Decimal>();
        const received = new Map<string, Prisma.Decimal>();

        for (const line of lines) {
          if (line.quantity.lessThanOrEqualTo(0)) {
            throw new PurchaseReturnOverQuantityError();
          }

          const receiptLine = await this.requireReceivedLine(
            transaction,
            workspaceId,
            purchaseReturn.purchaseReceiptId,
            line.purchaseReceiptLineId,
            line.inventoryItemId,
          );
          grouped.set(
            line.purchaseReceiptLineId,
            (grouped.get(line.purchaseReceiptLineId) ?? new Prisma.Decimal(0)).plus(
              line.quantity,
            ),
          );
          received.set(line.purchaseReceiptLineId, receiptLine.quantity);
        }

        for (const [receiptLineId, currentQuantity] of grouped) {
          const previous = await this.returnedQuantity(
            transaction,
            workspaceId,
            receiptLineId,
            id,
          );
          const receivedQuantity = received.get(receiptLineId);

          if (
            receivedQuantity === undefined ||
            previous.plus(currentQuantity).greaterThan(receivedQuantity)
          ) {
            throw new PurchaseReturnOverQuantityError();
          }
        }

        for (const line of lines) {
          try {
            await this.stockMovementsRepository.createOutboundMovementInTransaction(
              transaction,
              {
                workspaceId,
                inventoryItemId: line.inventoryItemId,
                quantity: line.quantity,
                referenceType: "PURCHASE_RETURN",
                referenceId: id,
                occurredAt: returnedAt,
                ...(line.reason === null && purchaseReturn.reason === null
                  ? {}
                  : { reason: line.reason ?? purchaseReturn.reason ?? undefined }),
              },
            );
          } catch (error) {
            if (error instanceof StockUpdateRejectedError) {
              throw new PurchaseReturnStockRejectedError();
            }

            throw error;
          }
        }

        return this.findByIdOrThrow(transaction, workspaceId, id);
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  cancel(
    workspaceId: string,
    id: string,
  ): Promise<PurchaseReturnWithLines | null> {
    return this.prisma.$transaction(
      async (transaction) => {
        const returns = await transaction.purchaseReturn.updateManyAndReturn({
          where: {
            id,
            workspaceId,
            status: {
              in: [PurchaseReturnStatus.DRAFT, PurchaseReturnStatus.READY],
            },
          },
          data: { status: PurchaseReturnStatus.CANCELLED },
          select: { id: true },
        });

        if (!returns[0]) {
          return null;
        }

        return this.findByIdOrThrow(transaction, workspaceId, id);
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  private async requireDraftContext(
    transaction: Prisma.TransactionClient,
    workspaceId: string,
    id: string,
  ): Promise<string> {
    const purchaseReturn = await transaction.purchaseReturn.findFirst({
      where: { id, workspaceId, status: PurchaseReturnStatus.DRAFT },
      select: { purchaseReceiptId: true },
    });

    if (!purchaseReturn) {
      throw new PurchaseReturnStateConflictError();
    }

    await this.requireReceivedReceipt(
      transaction,
      workspaceId,
      purchaseReturn.purchaseReceiptId,
    );
    return purchaseReturn.purchaseReceiptId;
  }

  private async requireReceivedReceipt(
    transaction: Prisma.TransactionClient,
    workspaceId: string,
    purchaseReceiptId: string,
  ) {
    const receipt =
      await this.purchaseReceiptsRepository.findReceivedInTransaction(
        transaction,
        workspaceId,
        purchaseReceiptId,
      );

    if (!receipt) {
      throw new PurchaseReturnReceiptUnavailableError();
    }

    return receipt;
  }

  private async requireReceivedLine(
    transaction: Prisma.TransactionClient,
    workspaceId: string,
    purchaseReceiptId: string,
    purchaseReceiptLineId: string,
    inventoryItemId: string,
  ) {
    const line =
      await this.purchaseReceiptsRepository.findReceivedLineInTransaction(
        transaction,
        workspaceId,
        purchaseReceiptId,
        purchaseReceiptLineId,
        inventoryItemId,
      );

    if (!line) {
      throw new PurchaseReturnLineReferenceError();
    }

    return line;
  }

  private async validateDraftQuantity(
    transaction: Prisma.TransactionClient,
    data: PurchaseReturnLineData,
    receivedQuantity: Prisma.Decimal,
    excludedLineId?: string,
  ): Promise<void> {
    if (data.quantity.lessThanOrEqualTo(0)) {
      throw new PurchaseReturnOverQuantityError();
    }

    const previous = await this.returnedQuantity(
      transaction,
      data.workspaceId,
      data.purchaseReceiptLineId,
    );
    const current = await transaction.purchaseReturnLine.aggregate({
      where: {
        workspaceId: data.workspaceId,
        purchaseReturnId: data.purchaseReturnId,
        purchaseReceiptLineId: data.purchaseReceiptLineId,
        ...(excludedLineId === undefined ? {} : { id: { not: excludedLineId } }),
      },
      _sum: { quantity: true },
    });
    const currentQuantity = current._sum.quantity ?? new Prisma.Decimal(0);

    if (
      previous
        .plus(currentQuantity)
        .plus(data.quantity)
        .greaterThan(receivedQuantity)
    ) {
      throw new PurchaseReturnOverQuantityError();
    }
  }

  private async returnedQuantity(
    transaction: Prisma.TransactionClient,
    workspaceId: string,
    purchaseReceiptLineId: string,
    excludedReturnId?: string,
  ): Promise<Prisma.Decimal> {
    const returned = await transaction.purchaseReturnLine.aggregate({
      where: {
        workspaceId,
        purchaseReceiptLineId,
        purchaseReturn: {
          status: PurchaseReturnStatus.RETURNED,
          ...(excludedReturnId === undefined
            ? {}
            : { id: { not: excludedReturnId } }),
        },
      },
      _sum: { quantity: true },
    });

    return returned._sum.quantity ?? new Prisma.Decimal(0);
  }

  private findByIdOrThrow(
    transaction: Prisma.TransactionClient,
    workspaceId: string,
    id: string,
  ): Promise<PurchaseReturnWithLines> {
    return transaction.purchaseReturn.findUniqueOrThrow({
      where: { id, workspaceId },
      include: { lines: { orderBy: this.lineOrder } },
    });
  }

  private readonly lineOrder = [
    { createdAt: "asc" as const },
    { id: "asc" as const },
  ];
}
