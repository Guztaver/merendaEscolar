import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class InventoryBatch {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    ingredientId: string; // Linking loosely for now to avoid circular deps hell in this demo

    @Column()
    batchNumber: string;

    @Column({ type: 'date' })
    expiryDate: string;

    @Column('float')
    quantity: number;

    @Column()
    schoolId: string; // Partition by school
}
