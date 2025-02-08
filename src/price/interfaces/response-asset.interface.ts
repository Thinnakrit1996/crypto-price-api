import {AssetType} from "../dto/get-price.dto";

export interface StockAsset {
    symbol: string;
    name?: string;
    price?: number;
    currency: string;
    marketCap?: number;
    volume?: number;
    change?: number;
    changePercent?: number;
    timestamp?: string;
}

export interface CryptoPriceResponse {
    symbol: string;
    assetType: AssetType;
    currency: string;
    price: number;
    change: number;
    volume: number;
    timestamp: string;
}

export interface StockPriceResponse {
    symbol: string;
    assetType: AssetType;
    currency: string;
    price: number;
    change?: number;
    changePercent?: number;
    volume?: number;
    previousClose?: number;
    open?: number;
    dayHigh?: number;
    dayLow?: number;
    timestamp?: Date;
    marketState: string;
    tradingSessionLow?: number;
    tradingSessionHigh?: number;
    exchange: string;
    shortName?: string;
    longName?: string;
}

