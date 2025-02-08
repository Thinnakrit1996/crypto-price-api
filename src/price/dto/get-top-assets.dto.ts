import {ApiProperty} from "@nestjs/swagger";
import {IsEnum, IsOptional, IsString} from "class-validator";

export enum SortBy {
    MARKET_CAP = 'marketCap',
    VOLUME = 'volume',
    PRICE_CHANGE = 'priceChange'
}

export class GetTopAssetsDto {
    @ApiProperty({
        description: 'Sort criteria',
        enum: SortBy,
        default: SortBy.MARKET_CAP
    })
    @IsEnum(SortBy)
    @IsOptional()
    sortBy?: SortBy = SortBy.MARKET_CAP;

    @ApiProperty({
        description: 'Currency for prices',
        example: 'USD',
        default: 'USD'
    })
    @IsString()
    @IsOptional()
    currency?: string = 'USD';
}