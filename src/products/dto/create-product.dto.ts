import { 
    IsArray, 
    IsIn, 
    IsInt, 
    IsNotEmpty, 
    IsNumber, 
    IsOptional, 
    IsPositive, 
    IsString, 
    MinLength 
} from "class-validator";


export class CreateProductDto {

    @IsNotEmpty()
    @IsString()
    @MinLength(1)
    title:string;

    @IsOptional()
    @IsNumber()
    @IsPositive()
    price?:number;

    @IsOptional()
    @IsString()
    description?:string;

    @IsOptional()
    @IsString()
    slug?:string;

    @IsOptional()
    @IsInt()
    @IsPositive()
    stock?:number;

    @IsArray()
    @IsString({ each: true })
    sizes:string[];

    @IsIn(['men','women','kid','unisex'])
    @IsString()
    gender:string;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    images?:string[];

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    tags?:string[];
}
