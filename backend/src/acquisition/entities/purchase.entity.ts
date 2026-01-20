import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Supplier } from './supplier.entity';

@Entity()
export class Purchase {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('float')
    amount: number;

    @Column({ type: 'date' })
    date: string;

    @ManyToOne(() => Supplier, (supplier) => supplier.purchases)
    supplier: Supplier;
}
