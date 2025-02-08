import {IsString, IsNotEmpty, IsEnum} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum AssetType {
    STOCK = 'stock',
    CRYPTO = 'crypto',
}

export class GetPriceDto {
    @ApiProperty({
        description: 'Asset type (stock or crypto)',
        enum: AssetType,
        example: 'stock',
    })
    @IsEnum(AssetType)
    @IsNotEmpty()
    assetType: AssetType;

    @ApiProperty({
        description: 'Asset symbol (e.g., AAPL for stocks, bitcoin for crypto)',
        example: 'AAPL',
    })
    @IsString()
    @IsNotEmpty()
    symbol: string;

    @ApiProperty({
        description: 'Currency for price (e.g., USD, EUR)',
        example: 'USD',
    })
    @IsString()
    @IsNotEmpty()
    currency: string;
}