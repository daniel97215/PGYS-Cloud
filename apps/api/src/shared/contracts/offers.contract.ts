export interface PublicOffer {
  id: string;
  key: string;
  name: string;
  status: string;
  visibility: string;
}

export interface OffersContract {
  findById(id: string): Promise<PublicOffer | null>;
  findByKey(key: string): Promise<PublicOffer | null>;
}

