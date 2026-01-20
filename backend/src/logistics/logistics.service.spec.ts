import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { LogisticsService } from './logistics.service';
import { InventoryBatch } from './entities/inventory-batch.entity';

describe('LogisticsService', () => {
  let service: LogisticsService;
  let mockBatchRepository;

  beforeEach(async () => {
    mockBatchRepository = {
      find: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LogisticsService,
        {
          provide: getRepositoryToken(InventoryBatch),
          useValue: mockBatchRepository,
        },
      ],
    }).compile();

    service = module.get<LogisticsService>(LogisticsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findNearExpiry', () => {
    it('should find batches expiring within threshold', async () => {
      // Mock result
      const mockBatches = [new InventoryBatch()];
      mockBatchRepository.find.mockResolvedValue(mockBatches);

      const result = await service.findNearExpiry(30);

      expect(mockBatchRepository.find).toHaveBeenCalled();
      expect(result).toHaveLength(1);
    });
  });
});
