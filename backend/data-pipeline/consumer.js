const { Kafka } = require('kafkajs');

// Create Kafka client
const kafka = new Kafka({
  clientId: 'my-app',
  brokers: ['localhost:9092'], // Change to your Kafka broker(s)
});

// Create consumer
const consumer = kafka.consumer({ groupId: 'stock-group' });

const run = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: 'stock-ticker', fromBeginning: false });

  console.log('✅ Kafka listener started...');

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const value = message.value.toString();
      console.log(`🟡 Received [${topic}]: ${value}`);

      // Parse and handle the message (example: save to Redis)
      const stockData = JSON.parse(value);
      // Your logic here
    },
  });
};

run().catch(console.error);