import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThan } from 'typeorm';
import { InventoryBatch } from './entities/inventory-batch.entity';

@Injectable()
export class LogisticsService {
    constructor(
        @InjectRepository(InventoryBatch)
        private batchRepository: Repository<InventoryBatch>,
    ) { }

    async findNearExpiry(daysThreshold: number): Promise<InventoryBatch[]> {
        const today = new Date();
        const thresholdDate = new Date();
        thresholdDate.setDate(today.getDate() + daysThreshold);

        // Find batches where expiryDate <= thresholdDate AND expiryDate >= today
        return this.batchRepository.find({
            where: {
                expiryDate: LessThanOrEqual(thresholdDate.toISOString().split('T')[0]),
                // We might want to filter out already expired ones or include them?
                // Let's assume we want to catch things *about* to expire or just expired.
            },
        });
    }
}
