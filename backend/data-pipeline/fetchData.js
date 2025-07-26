const { restClient } = require('@polygon.io/client-js');
const redisClient = require('./redisClient'); // Assuming you have a redisClient.js file
async function fetchStockPrice(symbol, multiplier, timespan, startDate, endDate) {
    const apiKey = process.env.POLYGON_API_KEY;
    const rest = restClient(apiKey);
    try {
        const response = await rest.stocks.aggregates(symbol, multiplier, timespan, startDate, endDate);
        let dates = [];
        for (const object of response.results) {
            const date = new Date(object.t).toISOString();
            await redisClient.hset(`${symbol}:${multiplier}:${timespan}:${date}`, object);
            dates.push(date);
        }
        return { symbol: symbol, multiplier: multiplier, timespan: timespan, startDate: startDate, endDate: endDate, dates: dates };
    } catch (error) {
        console.error(`Error fetching stock price for ${symbol}:`, error);
        throw error;
    }
}