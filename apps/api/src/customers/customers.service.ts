import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreateCustomerDto } from "./dto/create-customer.dto";
import { UpdateCustomerDto } from "./dto/update-customer.dto";
import {
  CustomerRecord,
  CustomersRepository,
} from "./customers.repository";
import { CustomerStatus } from "./enums/customer-status.enum";
import { CustomerType } from "./enums/customer-type.enum";

@Injectable()
export class CustomersService {
  constructor(private readonly customersRepository: CustomersRepository) {}

  createCustomer(
    workspaceId: string,
    data: CreateCustomerDto,
  ): Promise<CustomerRecord> {
    return this.customersRepository.create({
      ...data,
      workspaceId,
      code: this.normalizeCode(data.code),
      type: data.type as CustomerType,
      status: data.status as CustomerStatus | undefined,
    });
  }

  listWorkspaceCustomers(workspaceId: string): Promise<CustomerRecord[]> {
    return this.customersRepository.findByWorkspace(workspaceId);
  }

  async getCustomer(
    workspaceId: string,
    code: string,
  ): Promise<CustomerRecord> {
    return this.requireCustomer(workspaceId, code);
  }

  async updateCustomer(
    workspaceId: string,
    code: string,
    data: UpdateCustomerDto,
  ): Promise<CustomerRecord> {
    const normalizedCode = this.normalizeCode(code);
    await this.requireCustomer(workspaceId, normalizedCode);

    return this.customersRepository.update(workspaceId, normalizedCode, {
      ...data,
      type: data.type as CustomerType | undefined,
      status: data.status as CustomerStatus | undefined,
    });
  }

  async archiveCustomer(
    workspaceId: string,
    code: string,
  ): Promise<CustomerRecord> {
    const normalizedCode = this.normalizeCode(code);
    await this.requireCustomer(workspaceId, normalizedCode);

    return this.customersRepository.archive(workspaceId, normalizedCode);
  }

  private async requireCustomer(
    workspaceId: string,
    code: string,
  ): Promise<CustomerRecord> {
    const normalizedCode = this.normalizeCode(code);
    const customer = await this.customersRepository.findByWorkspaceAndCode(
      workspaceId,
      normalizedCode,
    );

    if (!customer) {
      throw new NotFoundException(`Customer "${code}" not found`);
    }

    return customer;
  }

  private normalizeCode(code: string): string {
    const normalizedCode = code.trim().toUpperCase();

    if (normalizedCode.length === 0) {
      throw new BadRequestException("Customer code is required");
    }

    return normalizedCode;
  }
}
