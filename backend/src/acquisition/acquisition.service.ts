import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Purchase } from './entities/purchase.entity';
import { SupplierType } from './entities/supplier.entity';

@Injectable()
export class AcquisitionService {
    constructor(
        @InjectRepository(Purchase)
        private purchaseRepository: Repository<Purchase>,
    ) { }

    async calculateFamilyFarmingPercentage(year: number): Promise<{
        total: number;
        familyFarming: number;
        percentage: number;
        isCompliant: boolean;
    }> {
        const startDate = new Date(`${year}-01-01`);
        const endDate = new Date(`${year}-12-31`);

        const purchases = await this.purchaseRepository.find({
            where: {
                date: Between(startDate.toISOString(), endDate.toISOString()),
            },
            relations: ['supplier'],
        });

        let totalAmount = 0;
        let familyFarmingAmount = 0;

        for (const purchase of purchases) {
            const amount = Number(purchase.amount); // Ensure number
            totalAmount += amount;
            if (purchase.supplier && purchase.supplier.type === SupplierType.FAMILY_FARMING) {
                familyFarmingAmount += amount;
            }
        }

        const percentage = totalAmount > 0 ? (familyFarmingAmount / totalAmount) * 100 : 0;

        return {
            total: totalAmount,
            familyFarming: familyFarmingAmount,
            percentage: Number(percentage.toFixed(2)),
            isCompliant: percentage >= 45,
        };
    }
}
