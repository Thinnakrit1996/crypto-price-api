import {Controller, Get, Query, UseInterceptors} from '@nestjs/common';
import {ApiOperation, ApiResponse, ApiTags} from "@nestjs/swagger";
import {CacheInterceptor} from "@nestjs/cache-manager";
import {PriceService} from "./price.service";
import {GetPriceDto} from "./dto/get-price.dto";
import {GetTopAssetsDto} from "./dto/get-top-assets.dto";
import {StockAsset} from "./interfaces/response-asset.interface";

@ApiTags('prices')
@Controller('prices')
@UseInterceptors(CacheInterceptor)
export class PriceController {
    constructor(private readonly priceService: PriceService) {}

    /**
     * Handles the GET request to retrieve the top 10 stocks based on the specified criteria.
     *
     * @param {GetTopAssetsDto} getTopAssetsDto - The DTO containing the sorting criteria and currency.
     * @returns {Promise<any>} - A promise that resolves to the top 10 stocks.
     */
    @Get('top/stocks')
    @ApiOperation({ summary: 'Get top 10 stocks' })
    @ApiResponse({
        status: 200,
        description: 'Returns the top 10 stocks by selected criteria'
    })
    async getTopStocks(@Query() getTopAssetsDto: GetTopAssetsDto): Promise<StockAsset[]> {
        return this.priceService.getTopStocks(getTopAssetsDto.sortBy, getTopAssetsDto.currency);
    }

    /**
     * Handles the GET request to retrieve the top 10 cryptocurrencies based on the specified criteria.
     *
     * @param {GetTopAssetsDto} getTopAssetsDto - The DTO containing the sorting criteria and currency.
     * @returns {Promise<any>} - A promise that resolves to the top 10 cryptocurrencies.
     */
    @Get('top/crypto')
    @ApiOperation({ summary: 'Get top 10 cryptocurrencies' })
    @ApiResponse({
        status: 200,
        description: 'Returns the top 10 cryptocurrencies by selected criteria'
    })
    async getTopCrypto(@Query() getTopAssetsDto: GetTopAssetsDto): Promise<StockAsset[]> {
        return this.priceService.getTopCrypto(getTopAssetsDto.sortBy, getTopAssetsDto.currency);
    }

    /**
     * Handles the GET request to retrieve the current price of the specified asset.
     *
     * @param {GetPriceDto} getPriceDto - The DTO containing the asset type, symbol, and currency.
     * @returns {Promise<GetPriceDto>} - A promise that resolves to the current price of the specified asset.
     */
    @Get()
    @ApiOperation({ summary: 'Get asset price' })
    @ApiResponse({
        status: 200,
        description: 'Returns the current price of the specified asset',
        type: GetPriceDto
    })
    async getPrice(@Query() getPriceDto: GetPriceDto): Promise<GetPriceDto> {
        return this.priceService.getPrice(
            getPriceDto.assetType,
            getPriceDto.symbol,
            getPriceDto.currency
        );
    }
}
