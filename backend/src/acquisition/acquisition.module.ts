import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AcquisitionService } from './acquisition.service';
import { Supplier } from './entities/supplier.entity';
import { Purchase } from './entities/purchase.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Supplier, Purchase])],
  providers: [AcquisitionService],
})
export class AcquisitionModule { }
