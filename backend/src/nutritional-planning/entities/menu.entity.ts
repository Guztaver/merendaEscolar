import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable } from 'typeorm';
import { Dish } from './dish.entity';

@Entity()
export class Menu {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'date' })
    date: string;

    @ManyToMany(() => Dish)
    @JoinTable()
    dishes: Dish[];

    // This hook or service method will validate the 10% ultraprocessed limit
    // across all dishes in the menu.
}
