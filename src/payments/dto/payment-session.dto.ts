import { Type } from "class-transformer";
import { ArrayMinSize, IsArray, IsNumber, IsPositive, IsString, Validate, ValidateNested } from "class-validator";
import { number } from "joi";


export class PaymenSessionDto{

    @IsString()
    currency : string
    
    @IsString()
    orderId : string

    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({each:true})
    @Type(() => PaymentSessiontItemDto)
    items:[]

}


export class PaymentSessiontItemDto{

    @IsString()
    name : string
    
    @IsNumber()
    @IsPositive()
    price: number

    @IsNumber()
    @IsPositive()
    quantity: number    
}