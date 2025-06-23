require('dotenv').config();
const KAFKA_BROKER = 'localhost:9092';
const TOPIC = 'stock-prices';
const { Kafka } = require('kafkajs');
const { restClient } = require('@polygon.io/client-js');
const axios = require('axios');

async function fetchStockPrice(symbol) {
    const apiKey = "bYx0g7_YgYXQsq1msFy5zo8KmEAXpc1y";
    console.log("API KEY: ", apiKey);
    if (!apiKey) {
        throw new Error('Polygon API key is not set in environment variables');
    }
    const rest = restClient(apiKey);

    try {
        const response = await rest.reference.tickerDetails(
            symbol,
            {}
        )
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
