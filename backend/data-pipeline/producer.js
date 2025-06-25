require('dotenv').config({ path: '../../.env' });
const KAFKA_BROKER = 'localhost:9092';
const TOPIC = 'stock-prices';
const { Kafka } = require('kafkajs');
const { restClient } = require('@polygon.io/client-js');
const axios = require('axios');

async function fetchStockPrice(symbol) {
    const apiKey = process.env.POLYGON_API_KEY;
    const rest = restClient(apiKey);
    try {
        const response = await rest.stocks.aggregates(symbol, 1, 'minute', '2025-01-09', '2025-01-10');
        console.log(`Fetched stock price for ${symbol}:`, response);
        return response;
    } catch (error) {
        console.error(`Error fetching stock price for ${symbol}:`, error);
        throw error;
    }
}
async function run() {
    try {
        const kafka = new Kafka({ clientId: 'producer', brokers: ['localhost:9092'] });
        const producer = kafka.producer();
        await producer.connect();
        const response = await fetchStockPrice('AAPL'); // Example stock symbol
        console.log('Fetched stock price:', response);
        await producer.send({
            topic: 'stock-ticker',
            messages: [
                {key: response.results.ticker, value: response.results.description}
            ],
        });
    await producer.disconnect();
    } catch (error) {   
        console.error('Error in run function:', error);
        throw error;
    }

}
run().catch(console.error);
