// Initialize the chart
const chart = LightweightCharts.createChart(document.getElementById('chart'), {
    width: window.innerWidth,
    height: 500,
    timeScale: { timeVisible: true, secondsVisible: false },
});

const candleSeries = chart.addCandlestickSeries({ title: 'BTC Price' });
const oiSeries = chart.addLineSeries({ color: 'blue', lineWidth: 2, title: 'Open Interest' });
const liqSeries = chart.addLineSeries({ color: 'red', lineWidth: 2, title: 'Liquidations' });

// Bybit WebSocket URLs
const wsPrice = new WebSocket('wss://stream.bybit.com/v5/public/spot');
const wsOi = new WebSocket('wss://stream.bybit.com/v5/public/linear');
const wsLiq = new WebSocket('wss://stream.bybit.com/v5/public/linear');

// Debugging logs
wsPrice.onopen = () => {
    console.log('Price WebSocket connected');
    wsPrice.send(JSON.stringify({
        op: 'subscribe',
        args: ['kline.1m.BTCUSDT'],
    }));
};

wsPrice.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log('Price data:', data);
    if (data.topic && data.topic.startsWith('kline')) {
        const kline = data.data[0];
        const candle = {
            time: kline.start / 1000,
            open: parseFloat(kline.open),
            high: parseFloat(kline.high),
            low: parseFloat(kline.low),
            close: parseFloat(kline.close),
        };
        candleSeries.update(candle);
    }
};

wsPrice.onerror = (error) => console.error('Price WebSocket error:', error);

wsOi.onopen = () => {
    console.log('OI WebSocket connected');
    wsOi.send(JSON.stringify({
        op: 'subscribe',
        args: ['publicTrade.BTCUSD'],
    }));
};

wsOi.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log('OI data:', data);
    if (data.topic && data.topic.startsWith('publicTrade')) {
        const trade = data.data[0];
        const oiPoint = {
            time: trade.timestamp / 1000,
            value: parseFloat(trade.size),
        };
        oiSeries.update(oiPoint);
    }
};

wsOi.onerror = (error) => console.error('OI WebSocket error:', error);

wsLiq.onopen = () => {
    console.log('Liquidation WebSocket connected');
    wsLiq.send(JSON.stringify({
        op: 'subscribe',
        args: ['liquidation.BTCUSD'],
    }));
};

wsLiq.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log('Liquidation data:', data);
    if (data.topic && data.topic.startsWith('liquidation')) {
        const liq = data.data;
        const liqPoint = {
            time: liq.updatedTime / 1000,
            value: parseFloat(liq.size),
        };
        liqSeries.update(liqPoint);
    }
};

wsLiq.onerror = (error) => console.error('Liquidation WebSocket error:', error);

// Resize handler
window.addEventListener('resize', () => chart.resize(window.innerWidth, 500));
