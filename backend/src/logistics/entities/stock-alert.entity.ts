import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { StockItem } from './stock-item.entity';

export enum AlertType {
    LOW_STOCK = 'LOW_STOCK',         // Estoque baixo
    OVERSTOCK = 'OVERSTOCK',         // Estoque excessivo
    EXPIRY_SOON = 'EXPIRY_SOON',     // Vencendo em breve
    EXPIRED = 'EXPIRED',             // Vencido
    OUT_OF_STOCK = 'OUT_OF_STOCK',   // Esgotado
}

export enum AlertSeverity {
    LOW = 'LOW',       // Baixa gravidade
    MEDIUM = 'MEDIUM', // Média gravidade
    HIGH = 'HIGH',     // Alta gravidade
    CRITICAL = 'CRITICAL', // Crítico
}

export enum AlertStatus {
    OPEN = 'OPEN',         // Aberto
    ACKNOWLEDGED = 'ACKNOWLEDGED', // Reconhecido
    RESOLVED = 'RESOLVED', // Resolvido
    DISMISSED = 'DISMISSED', // Dispensado
}

@Entity('stock_alerts')
export class StockAlert {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    stockItemId: string;

    @ManyToOne(() => StockItem)
    @JoinColumn({ name: 'stockItemId' })
    stockItem: StockItem;

    @Column({
        type: 'enum',
        enum: AlertType
    })
    type: AlertType;

    @Column({
        type: 'enum',
        enum: AlertSeverity
    })
    severity: AlertSeverity;

    @Column({
        type: 'enum',
        enum: AlertStatus,
        default: AlertStatus.OPEN
    })
    status: AlertStatus;

    @Column('text')
    message: string; // Mensagem do alerta

    @Column('float', { nullable: true })
    currentQuantity: number; // Quantidade atual no momento do alerta

    @Column('float', { nullable: true })
    threshold: number; // Limiar que disparou o alerta

    @Column({ type: 'date', nullable: true })
    expiryDate: Date; // Data de validade (se aplicável)

    @Column({ nullable: true })
    batchNumber: string; // Número do lote (se aplicável)

    @Column({ nullable: true })
    schoolId: string; // Escola (para particionamento)

    @CreateDateColumn()
    createdAt: Date;

    @Column({ nullable: true })
    resolvedAt: Date; // Data de resolução

    @Column({ nullable: true })
    resolvedBy: string; // Usuário que resolveu

    @Column({ nullable: true })
    resolutionNotes: string; // Notas sobre a resolução
}
