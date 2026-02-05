import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogisticsService } from './logistics.service';
import { LogisticsController } from './logistics.controller';
import { InventoryBatch } from './entities/inventory-batch.entity';
import { StockItem } from './entities/stock-item.entity';
import { StockMovement } from './entities/stock-movement.entity';
import { StockAlert } from './entities/stock-alert.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      InventoryBatch,
      StockItem,
      StockMovement,
      StockAlert,
    ])
  ],
  controllers: [LogisticsController],
  providers: [LogisticsService],
  exports: [LogisticsService],
})
export class LogisticsModule { }
