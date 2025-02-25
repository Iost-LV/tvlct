console.log('Script loaded');
console.log('LightweightCharts:', typeof LightweightCharts);

const chart = LightweightCharts.createChart(document.getElementById('chart'), {
    width: window.innerWidth,
    height: 500,
    timeScale: { timeVisible: true, secondsVisible: false },
});

console.log('Chart created:', chart);

const candleSeries = chart.addCandlestickSeries({ title: 'BTC Price' });
candleSeries.setData([
    { time: Math.floor(Date.now() / 1000) - 60, open: 50000, high: 50100, low: 49900, close: 50050 },
    { time: Math.floor(Date.now() / 1000), open: 50050, high: 50200, low: 50000, close: 50150 },
]);

console.log('Candlestick series added');
