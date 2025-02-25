// Initialize the chart
const chart = LightweightCharts.createChart(document.getElementById('chart'), {
    width: window.innerWidth,
    height: 500,
    timeScale: { timeVisible: true, secondsVisible: false },
});

// Add series
const candleSeries = chart.addCandlestickSeries({ title: 'BTC Price' });
const oiSeries = chart.addLineSeries({ color: 'blue', lineWidth: 2, title: 'Open Interest' });
const liqSeries = chart.addLineSeries({ color: 'red', lineWidth: 2, title: 'Liquidations' });

// Bybit WebSocket URLs (public endpoints)
const wsPrice = new WebSocket('wss://stream.bybit.com/v5/public/spot');
const wsOi = new WebSocket('wss://stream.bybit.com/v5/public/linear');
const wsLiq = new WebSocket('wss://stream.bybit.com/v5/public/linear');

// Store initial data
let priceData = [];
let oiData = [];
let liqData = [];

// Subscribe to BTC/USDT spot price (candlestick)
wsPrice.onopen = () => {
    wsPrice.send(JSON.stringify({
        op: 'subscribe',
        args: ['kline.1m.BTCUSDT'], // 1-minute candlestick for BTC/USDT
    }));
};

wsPrice.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.topic && data.topic.startsWith('kline')) {
        const kline = data.data[0];
        const candle = {
            time: kline.start / 1000, // Convert ms to seconds
            open: parseFloat(kline.open),
            high: parseFloat(kline.high),
            low: parseFloat(kline.low),
            close: parseFloat(kline.close),
        };
        priceData.push(candle);
        candleSeries.update(candle);
    }
};

// Subscribe to BTC/USD perpetual open interest
wsOi.onopen = () => {
    wsOi.send(JSON.stringify({
        op: 'subscribe',
        args: ['publicTrade.BTCUSD'], // Trades for OI calculation
    }));
};

wsOi.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.topic && data.topic.startsWith('publicTrade')) {
        const trade = data.data[0];
        const oiPoint = {
            time: trade.timestamp / 1000,
            value: parseFloat(trade.size), // Simplified OI proxy (trade size)
        };
        oiData.push(oiPoint);
        oiSeries.update(oiPoint);
    }
};

// Subscribe to liquidation data
wsLiq.onopen = () => {
    wsLiq.send(JSON.stringify({
        op: 'subscribe',
        args: ['liquidation.BTCUSD'], // Liquidation stream
    }));
};

wsLiq.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.topic && data.topic.startsWith('liquidation')) {
        const liq = data.data;
        const liqPoint = {
            time: liq.updatedTime / 1000,
            value: parseFloat(liq.size),
        };
        liqData.push(liqPoint);
        liqSeries.update(liqPoint);
    }
};

// Handle window resize
window.addEventListener('resize', () => {
    chart.resize(window.innerWidth, 500);
});