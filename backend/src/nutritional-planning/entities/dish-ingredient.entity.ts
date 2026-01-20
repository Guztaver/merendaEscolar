import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Dish } from './dish.entity';
import { Ingredient } from './ingredient.entity';

@Entity()
export class DishIngredient {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('float')
    quantityGrams: number;

    @ManyToOne(() => Dish, (dish) => dish.ingredients)
    dish: Dish;

    @ManyToOne(() => Ingredient, (ingredient) => ingredient.dishIngredients)
    ingredient: Ingredient;
}
