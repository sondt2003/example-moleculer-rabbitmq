"use strict";
const amqplib = require("amqplib");
const queueName = "task";
module.exports = {
	methods: {
		async consumeTask() {
			try {
				const connection = await amqplib.connect("amqp://localhost");
				this.check = true;
				this.channel = await connection.createChannel();
				await this.channel.assertQueue(queueName, { durable: true });
				this.channel.prefetch(1);
				this.logger.warn(`Waiting for messages in queue: ${queueName}`);
			} catch (error) {
				this.check = true;
				this.channel = null;
			}
		},
		checkState() {
			if (this.check == false) {
				this.channel.consume(queueName, async (msg) => {
					console.log("[X] checkState:", msg.content.toString(), "\ncheck", this.check);
					if (!this.check) {
						console.log("Accept Message");
						this.channel.ack(msg);
					}
				}, { noAck: false });
			}
		},
		waitForChange(time) {
			return new Promise((resolve) => {
				let intervalId = setInterval(() => {
					if (this.check === true) {
						clearInterval(intervalId); // Ngừng lặp
						console.log("Đã ngừng lặp:", this.check);
						resolve();
					} else if (this.check === false) {
						console.log("Kiểm tra điều kiện", this.check);
					}
				}, time);
			});
		},
		async sendTask(msg) {
			this.channel.sendToQueue(queueName, Buffer.from(msg), { persistent: true });
			this.check = false;
			this.checkState();
			console.log("Sent: ", msg);
		},
		async acceptMessage(message, ...args) {
			return this.channel.ack(message, ...args);
		},
		nextQueue() {
			return this.check = true;
		},
		getQueue() {
			return this.check;
		},
	},
	async started() {
		await this.consumeTask();
		await this.checkState();
	}
};
