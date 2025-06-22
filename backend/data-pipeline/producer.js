const KAFKA_BROKER = 'localhost:9092';
const TOPIC = 'stock-prices';
const { Kafka } = require('kafkajs');
const { Polygon } = require('polygon.io');

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
