import os
import json
import asyncio
from aiokafka import AIOKafkaConsumer
import logging

class KafkaService:
    def __init__(self, detector):
        self.detector = detector
        self.bootstrap_servers = os.getenv("KAFKA_BROKERS", "localhost:9092")
        self.topic = "simulation_metrics"
        self.consumer = None
        self.active = False
        
    async def start(self):
        logging.info("Starting AIOKafkaConsumer...")
        
        loop = asyncio.get_event_loop()
        self.consumer = AIOKafkaConsumer(
            self.topic,
            bootstrap_servers=self.bootstrap_servers,
            group_id="ai-insight-engine",
            auto_offset_reset="latest",
            value_deserializer=lambda v: json.loads(v.decode('utf-8'))
        )
        await self.consumer.start()
        self.active = True
        logging.info(f"Connected to Kafka topic: {self.topic}")
        asyncio.create_task(self.consume())

    async def stop(self):
        self.active = False
        if self.consumer:
            await self.consumer.stop()
            logging.info("Kafka Consumer gracefully shut down.")

    async def consume(self):
        try:
            async for msg in self.consumer:
                if not self.active:
                    break
                payload = msg.value
                sim_id = payload.get("simulation_id")
                
                # Push into the Memory buffer for analysis
                if sim_id:
                    self.detector.push_metric(sim_id, payload)
                    
        except Exception as e:
            logging.error(f"Kafka consumer stream broke: {e}")
            if self.active:
                await asyncio.sleep(5)
                asyncio.create_task(self.consume())
