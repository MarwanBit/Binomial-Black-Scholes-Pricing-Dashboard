const KAFKA_BROKER = 'localhost:9092';
const TOPIC = 'stock-prices';
const { Kafka } = require('kafkajs');
const { Polygon } = require('polygon.io');
const axios = require('axios');

async function fetchStockPrice(symbol) {
    const apiKey = process.env.POLYGON_API_KEY;
    const url = `https://api.polygon.io/v2/last/trade/${symbol}?apiKey=${apiKey}`;
    try {
        const response = await axios.get(url);
        return response.data.last.price;
    } catch (error) {
        console.error(`Error fetching stock price for ${symbol}:`, error);
        throw error;
    }
}
async function run() {
    const kafka = new Kafka({ clientId: 'producer', brokers: ['localhost:9092'] });
    const producer = kafka.producer();

    await producer.connect();
    await producer.send({
    topic: 'stock-ticker',
    messages: [
        { value: JSON.stringify({ symbol: 'AAPL', price: 187.45, timestamp: new Date().toISOString() }) },
    ],
    });
    await producer.disconnect();
}

run().catch(console.error);
