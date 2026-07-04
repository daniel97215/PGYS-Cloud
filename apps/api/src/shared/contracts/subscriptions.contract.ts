export interface PublicSubscription {
  id: string;
  workspaceId: string;
  offerId: string;
  priceId: string | null;
  status: string;
  startedAt: Date;
  endsAt: Date | null;
  cancelledAt: Date | null;
  renewalDate: Date | null;
}

export interface SubscriptionsContract {
  findById(id: string): Promise<PublicSubscription | null>;
  findActiveByWorkspaceId(
    workspaceId: string,
  ): Promise<PublicSubscription | null>;
  listByWorkspaceId(workspaceId: string): Promise<PublicSubscription[]>;
}

