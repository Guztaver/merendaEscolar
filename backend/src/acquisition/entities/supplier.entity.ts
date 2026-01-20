import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Purchase } from './purchase.entity';

export enum SupplierType {
    REGULAR = 'regular',
    FAMILY_FARMING = 'family_farming',
}

@Entity()
export class Supplier {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column()
    document: string; // CNPJ/CPF

    @Column({
        type: 'enum',
        enum: SupplierType,
        default: SupplierType.REGULAR,
    })
    type: SupplierType;

    @OneToMany(() => Purchase, (purchase) => purchase.supplier)
    purchases: Purchase[];
}
