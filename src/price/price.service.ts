import {Injectable, NotFoundException} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import {AssetType} from "./dto/get-price.dto";
import yahooFinance from 'yahoo-finance2';
import {firstValueFrom} from "rxjs";
import {SortBy} from "./dto/get-top-assets.dto";
import {CryptoPriceResponse, StockAsset, StockPriceResponse} from "./interfaces/response-asset.interface";
import {YahooScreenerId} from "./enums/yahoo-screener-id.enum";

@Injectable()
export class PriceService {
    constructor(private readonly httpService: HttpService) {}

    /**
     * Retrieves the top 10 stocks based on the specified sorting criteria and currency.
     *
     * @param {SortBy} [sortBy=SortBy.MARKET_CAP] - The criteria to sort the stocks by.
     * @param {string} [currency='USD'] - The currency to display the stock prices in.
     * @returns {Promise<any[]>} - A promise that resolves to an array of the top 10 stocks.
     * @throws Will throw an error if there is an issue fetching the top stocks.
     */
    async getTopStocks(sortBy: SortBy = SortBy.MARKET_CAP, currency: string = 'USD'): Promise<StockAsset[]> {
        try {
            // Using Yahoo Finance's built-in screener for top stocks
            const screenerResult = await yahooFinance.screener(
                {
                    scrIds: this.getYahooScreenerId(sortBy),
                    count: 10,
                }
            );


            const quotes = await Promise.all(
                screenerResult.quotes.map(async (quote) => {
                    const detailedQuote = await yahooFinance.quote(quote.symbol);
                    return {
                        symbol: detailedQuote.symbol,
                        name: detailedQuote.longName || detailedQuote.shortName,
                        price: detailedQuote.regularMarketPrice,
                        currency: detailedQuote.currency || currency,
                        marketCap: detailedQuote.marketCap,
                        volume: detailedQuote.regularMarketVolume,
                        change: detailedQuote.regularMarketChange,
                        changePercent: detailedQuote.regularMarketChangePercent,
                        timestamp: detailedQuote.regularMarketTime?.toISOString(),
                    };
                })
            );

            return quotes;
        } catch (error) {
            console.error('Error fetching top stocks:', error);
            throw error;
        }
    }

    /**
     * Returns the Yahoo Finance screener ID based on the specified sorting criteria.
     *
     * @param {SortBy} sortBy - The criteria to sort the stocks by.
     * @returns {"day_gainers" | "day_losers" | "most_actives" | "undervalued_growth_stocks"} - The corresponding Yahoo Finance screener ID.
     */
    private getYahooScreenerId(sortBy: SortBy): YahooScreenerId {
        switch (sortBy) {
            case SortBy.MARKET_CAP:
                return YahooScreenerId.UNDERVALUED_GROWTH_STOCKS;
            case SortBy.VOLUME:
                return YahooScreenerId.MOST_ACTIVES;
            case SortBy.PRICE_CHANGE:
                return YahooScreenerId.DAY_GAINERS;
            default:
                return YahooScreenerId.MOST_ACTIVES;
        }
    }

    /**
     * Retrieves the top 10 cryptocurrencies based on the specified sorting criteria and currency.
     *
     * @param {SortBy} [sortBy=SortBy.MARKET_CAP] - The criteria to sort the cryptocurrencies by.
     * @param {string} [currency='USD'] - The currency to display the cryptocurrency prices in.
     * @returns {Promise<any[]>} - A promise that resolves to an array of the top 10 cryptocurrencies.
     * @throws Will throw an error if there is an issue fetching the top cryptocurrencies.
     */
    async getTopCrypto(sortBy: SortBy = SortBy.MARKET_CAP, currency: string = 'USD'): Promise<StockAsset[]> {
        try {
            const response = await firstValueFrom(
                this.httpService.get(
                    `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${currency.toLowerCase()}&order=${this.getCoinGeckoSortField(sortBy)}&per_page=10&page=1&sparkline=false`
                )
            );

            return response.data.map(coin => ({
                symbol: coin.symbol.toUpperCase(),
                name: coin.name,
                price: coin.current_price,
                currency: currency.toLowerCase(),
                marketCap: coin.market_cap,
                volume: coin.total_volume,
                change: coin.price_change_24h,
                changePercent: coin.price_change_percentage_24h,
                timestamp: coin.last_updated,
            }));
        } catch (error) {
            console.error('Error fetching top cryptocurrencies:', error);
            throw error;
        }
    }

    /**
     * Returns the CoinGecko sort field based on the specified sorting criteria.
     *
     * @param {SortBy} sortBy - The criteria to sort the cryptocurrencies by.
     * @returns {string} - The corresponding CoinGecko sort field.
     */
    private getCoinGeckoSortField(sortBy: SortBy): string {
        switch (sortBy) {
            case SortBy.MARKET_CAP:
                return 'market_cap_desc';
            case SortBy.VOLUME:
                return 'volume_desc';
            case SortBy.PRICE_CHANGE:
                return 'price_change_24h_desc';
            default:
                return 'market_cap_desc';
        }
    }

    /**
     * Retrieves the price of the specified asset based on its type.
     *
     * @param {AssetType} assetType - The type of the asset (e.g., STOCK or CRYPTO).
     * @param {string} symbol - The symbol of the asset.
     * @param {string} currency - The currency to display the asset price in.
     * @returns {Promise<any>} - A promise that resolves to the price of the specified asset.
     * @throws {NotFoundException} - Throws an exception if the asset is not found.
     */
    async getPrice(assetType: AssetType, symbol: string, currency: string): Promise<StockPriceResponse|CryptoPriceResponse> {
        if (assetType === AssetType.STOCK) {
            return this.getStockPrice(symbol, currency);
        } else {
            return this.getCryptoPrice(symbol, currency);
        }
    }

    /**
     * Retrieves the price of a stock based on its symbol and currency.
     *
     * @param {string} symbol - The symbol of the stock.
     * @param {string} currency - The currency to display the stock price in.
     * @returns {Promise<any>} - A promise that resolves to the price details of the specified stock.
     * @throws {NotFoundException} - Throws an exception if the stock is not found.
     */
    private async getStockPrice(symbol: string, currency: string): Promise<StockPriceResponse> {
        try {
            const quote = await yahooFinance.quote(symbol);

            if (!quote || !quote.regularMarketPrice) {
                throw new NotFoundException(`Stock ${symbol} not found`);
            }

            // For simplicity, we're not handling currency conversion here
            // In a production environment, you'd want to implement proper currency conversion
            return {
                symbol: quote.symbol,
                assetType: AssetType.STOCK,
                currency: quote.currency || currency.toUpperCase(),
                price: quote.regularMarketPrice,
                change: quote.regularMarketChange || 0,
                changePercent: quote.regularMarketChangePercent || 0,
                volume: quote.regularMarketVolume || 0,
                previousClose: quote.regularMarketPreviousClose || 0,
                open: quote.regularMarketOpen || 0,
                dayHigh: quote.regularMarketDayHigh || 0,
                dayLow: quote.regularMarketDayLow || 0,
                timestamp: quote.regularMarketTime,
                marketState: quote.marketState,
                tradingSessionLow: quote.regularMarketDayLow || 0,
                tradingSessionHigh: quote.regularMarketDayHigh || 0,
                exchange: quote.exchange,
                shortName: quote.shortName,
                longName: quote.longName
            };
        } catch (error) {
            if (error.message.includes('not found')) {
                throw new NotFoundException(`Stock ${symbol} not found`);
            }
            throw error;
        }
    }

    /**
     * Retrieves the price of a cryptocurrency based on its coin ID and currency.
     *
     * @param {string} coinId - The ID of the cryptocurrency.
     * @param {string} currency - The currency to display the cryptocurrency price in.
     * @returns {Promise<any>} - A promise that resolves to the price details of the specified cryptocurrency.
     * @throws {NotFoundException} - Throws an exception if the cryptocurrency is not found.
     */
    private async getCryptoPrice(coinId: string, currency: string): Promise<CryptoPriceResponse> {
        try {
            const response = await firstValueFrom(
                this.httpService.get(
                    `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=${currency}&include_24hr_vol=true&include_24hr_change=true&include_last_updated_at=true`
                )
            );

            if (!response.data[coinId]) {
                throw new NotFoundException(`Cryptocurrency ${coinId} not found`);
            }

            return {
                symbol: coinId,
                assetType: AssetType.CRYPTO,
                currency: currency.toLowerCase(),
                price: response.data[coinId][currency.toLowerCase()],
                change: response.data[coinId][currency.toLowerCase() + '_24h_change'],
                volume: response.data[coinId][currency.toLowerCase() + '_24h_vol'],
                timestamp: new Date(response.data[coinId]['last_updated_at'] * 1000).toISOString(),
            };
        } catch (error) {
            if (error.response?.status === 404) {
                throw new NotFoundException(`Cryptocurrency ${coinId} not found`);
            }
            throw error;
        }
    }
}
