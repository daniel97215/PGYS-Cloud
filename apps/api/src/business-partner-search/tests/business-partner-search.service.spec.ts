import { BusinessPartnerSearchRepository } from "../business-partner-search.repository";
import { BusinessPartnerSearchService } from "../business-partner-search.service";

describe("BusinessPartnerSearchService", () => {
  let repository: jest.Mocked<BusinessPartnerSearchRepository>;
  let service: BusinessPartnerSearchService;

  const workspaceId = "10000000-0000-4000-8000-000000000001";
  const searchResult = {
    items: [],
    total: 0,
    page: 1,
    pageSize: 25,
  };

  beforeEach(() => {
    repository = {
      search: jest.fn().mockResolvedValue(searchResult),
    } as unknown as jest.Mocked<BusinessPartnerSearchRepository>;

    service = new BusinessPartnerSearchService(repository);
  });

  it("searches business partners through the repository", async () => {
    const query = {
      code: "CUST-001",
      name: "Acme",
      role: "CUSTOMER",
      tag: "VIP",
      city: "Paris",
      email: "contact@example.com",
      phone: "+33102030405",
      status: "active",
      page: 2,
      pageSize: 10,
      sort: "createdAt" as const,
      order: "desc" as const,
    };

    const result = await service.searchBusinessPartners(workspaceId, query);

    expect(result).toEqual(searchResult);
    expect(repository.search).toHaveBeenCalledWith(workspaceId, query);
  });
});
