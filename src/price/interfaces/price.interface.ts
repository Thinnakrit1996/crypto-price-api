import {AssetType} from "../dto/get-price.dto";

export interface PriceResponse {
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
    timestamp: string;
    marketState?: string;
    tradingSessionLow?: number;
    tradingSessionHigh?: number;
    exchange?: string;
    shortName?: string;
    longName?: string;
}