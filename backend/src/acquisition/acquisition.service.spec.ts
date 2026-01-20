import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AcquisitionService } from './acquisition.service';
import { Purchase } from './entities/purchase.entity';
import { SupplierType } from './entities/supplier.entity';

describe('AcquisitionService', () => {
  let service: AcquisitionService;
  let mockPurchaseRepository;

  beforeEach(async () => {
    mockPurchaseRepository = {
      find: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AcquisitionService,
        {
          provide: getRepositoryToken(Purchase),
          useValue: mockPurchaseRepository,
        },
      ],
    }).compile();

    service = module.get<AcquisitionService>(AcquisitionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculateFamilyFarmingPercentage', () => {
    it('should return correct percentage and compliance', async () => {
      // Mock Data: Total 200. Family Farming 100. % = 50% (>45% Compliant)
      const mockPurchases = [
        {
          amount: 100,
          supplier: { type: SupplierType.FAMILY_FARMING },
        },
        {
          amount: 100,
          supplier: { type: SupplierType.REGULAR },
        },
      ];

      mockPurchaseRepository.find.mockResolvedValue(mockPurchases);

      const result = await service.calculateFamilyFarmingPercentage(2026);

      expect(result.total).toBe(200);
      expect(result.familyFarming).toBe(100);
      expect(result.percentage).toBe(50);
      expect(result.isCompliant).toBe(true);
    });

    it('should return false compliance if < 45%', async () => {
      // Mock Data: Total 200. Family Farming 50. % = 25% (<45% Non-Compliant)
      const mockPurchases = [
        {
          amount: 50,
          supplier: { type: SupplierType.FAMILY_FARMING },
        },
        {
          amount: 150,
          supplier: { type: SupplierType.REGULAR },
        },
      ];

      mockPurchaseRepository.find.mockResolvedValue(mockPurchases);

      const result = await service.calculateFamilyFarmingPercentage(2026);

      expect(result.percentage).toBe(25);
      expect(result.isCompliant).toBe(false);
    });
  });
});
