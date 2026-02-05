import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum StockItemType {
    INGREDIENT = 'INGREDIENT',
    DISH = 'DISH',
    SUPPLY = 'SUPPLY',
}

@Entity('stock_items')
export class StockItem {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({
        type: 'enum',
        enum: StockItemType,
        default: StockItemType.SUPPLY
    })
    type: StockItemType;

    @Column({ nullable: true })
    ingredientId: string; // Reference to nutritional-planning ingredient

    @Column({ nullable: true })
    code: string; // Código de barras ou código interno

    @Column({ type: 'float', default: 0 })
    currentQuantity: number; // Quantidade atual em estoque

    @Column({ type: 'float', default: 0 })
    minQuantity: number; // Quantidade mínima para alerta

    @Column({ type: 'float', default: 0 })
    maxCapacity: number; // Capacidade máxima de armazenamento

    @Column()
    unit: string; // Unidade de medida (kg, L, un, cx, etc)

    @Column({ type: 'float', default: 0 })
    unitCost: number; // Custo unitário para valorização do estoque

    @Column()
    location: string; // Localização no armazém (ex: "A1-03", "Geladeira 2")

    @Column({ default: true })
    isActive: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}