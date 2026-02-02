import { IsNotEmpty, IsArray, IsDateString } from 'class-validator';

export class CreateMenuDto {
    @IsDateString()
    @IsNotEmpty()
    date: string;

    @IsArray()
    @IsNotEmpty()
    dishIds: string[];
}
