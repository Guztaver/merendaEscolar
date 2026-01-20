import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { DishIngredient } from './dish-ingredient.entity';

@Entity()
export class Dish {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column('text')
    preparationMethod: string;

    @OneToMany(() => DishIngredient, (dishIngredient) => dishIngredient.dish, {
        cascade: true,
    })
    ingredients: DishIngredient[];

    // Computed nutritional info will be handled by service logic, 
    // but we can cache it here if needed.
}
