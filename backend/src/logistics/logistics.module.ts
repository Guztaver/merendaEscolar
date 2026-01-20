import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogisticsService } from './logistics.service';
import { InventoryBatch } from './entities/inventory-batch.entity';

@Module({
  imports: [TypeOrmModule.forFeature([InventoryBatch])],
  providers: [LogisticsService],
})
export class LogisticsModule { }
