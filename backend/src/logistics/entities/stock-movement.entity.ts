import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { StockItem } from './stock-item.entity';

export enum MovementType {
    IN = 'IN',           // Entrada (compra, doação, produção)
    OUT = 'OUT',         // Saída (uso, perda, venda)
    TRANSFER = 'TRANSFER', // Transferência entre escolas
    ADJUSTMENT = 'ADJUSTMENT', // Ajuste de inventário
}

export enum MovementReason {
    PURCHASE = 'PURCHASE',           // Compra
    DONATION = 'DONATION',           // Doação
    PRODUCTION = 'PRODUCTION',       // Produção própria
    USAGE = 'USAGE',                 // Uso em preparações
    LOSS = 'LOSS',                   // Perda/dano
    EXPIRED = 'EXPIRED',             // Vencido
    TRANSFER_IN = 'TRANSFER_IN',     // Transferência recebida
    TRANSFER_OUT = 'TRANSFER_OUT',   // Transferência enviada
    COUNT_ADJUSTMENT = 'COUNT_ADJUSTMENT', // Ajuste de contagem
    OTHER = 'OTHER',                 // Outro motivo
}

@Entity('stock_movements')
export class StockMovement {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    stockItemId: string;

    @ManyToOne(() => StockItem)
    @JoinColumn({ name: 'stockItemId' })
    stockItem: StockItem;

    @Column({
        type: 'enum',
        enum: MovementType
    })
    movementType: MovementType;

    @Column({
        type: 'enum',
        enum: MovementReason
    })
    reason: MovementReason;

    @Column('float')
    quantity: number; // Quantidade movimentada (sempre positiva)

    @Column('float')
    previousBalance: number; // Saldo antes do movimento

    @Column('float')
    newBalance: number; // Saldo após o movimento

    @Column({ nullable: true })
    batchNumber: string; // Número do lote

    @Column({ type: 'date', nullable: true })
    expiryDate: Date; // Data de validade (se aplicável)

    @Column({ nullable: true })
    supplierId: string; // Fornecedor (para entradas)

    @Column({ nullable: true })
    schoolId: string; // Escola (para particionamento)

    @Column({ nullable: true })
    notes: string; // Observações

    @Column({ nullable: true })
    documentNumber: string; // Número do documento (nota fiscal, etc)

    @CreateDateColumn()
    createdAt: Date;

    @Column()
    createdBy: string; // Usuário que realizou o movimento
}