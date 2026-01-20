import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { DishIngredient } from './dish-ingredient.entity';

export enum NovaClassification {
    UNPROCESSED = 'unprocessed',
    PROCESSED_CULINARY_INGREDIENT = 'processed_culinary_ingredient',
    PROCESSED = 'processed',
    ULTRAPROCESSED = 'ultraprocessed',
}

@Entity()
export class Ingredient {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({
        type: 'enum',
        enum: NovaClassification,
        default: NovaClassification.UNPROCESSED,
    })
    novaClassification: NovaClassification;

    // Nutritional info per 100g
    @Column('float')
    calories: number; // kcal

    @Column('float')
    carbohydrates: number; // g

    @Column('float')
    protein: number; // g

    @Column('float')
    fat: number; // g

    @Column('float')
    sodium: number; // mg

    @OneToMany(() => DishIngredient, (dishIngredient) => dishIngredient.ingredient)
    dishIngredients: DishIngredient[];
}
