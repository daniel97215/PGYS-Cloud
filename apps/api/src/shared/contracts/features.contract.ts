export interface PublicFeature {
  id: string;
  key: string;
  name: string;
  category: string | null;
  status: string;
}

export interface FeaturesContract {
  findById(id: string): Promise<PublicFeature | null>;
  findByKey(key: string): Promise<PublicFeature | null>;
  findByKeys(keys: string[]): Promise<PublicFeature[]>;
}

