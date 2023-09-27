"use strict";

const queueMixin = require("../mixins/queue.mixin");


let set_var = null;
let count = 1;

const PQueue = require("p-queue");
const queue = new PQueue({ concurrency: 1 });
const puppeteer = require("puppeteer");
async function scrape(url) {
	const browser = await puppeteer.launch();
	const page = await browser.newPage();
	await page.goto(url);
	const title = await page.title();
	await browser.close();
	return title;
}

async function queueScraper(url) {
	return queue.add(() => scrape(url));
}


module.exports = {
	name: "bav",
	mixins: [
		queueMixin
	],
	metadata: {
		Timeout: 1000
	},
	settings: {
	},
	dependencies: [],
	actions: {
		task: {
			rest: {
				method: "GET",
				path: "/job"
			},
			params: {
				request: { type: "string", min: 4 }
			},
			async handler(ctx) {
				const request = ctx.params.request;
				if (this.getQueue()) {
					this.sendTask(request);
					const delay = request === "task1" ? 7000 : 2000;
					return await new Promise((resolve) => setTimeout(resolve, delay)).then(() => {
						this.nextQueue();
						return "CLIENT ONE";
					});
				} else {
					return this.waitForChange().then(() => {
						return "CLIENT TWO";
					});
				}
			}
		},
		action1: {
			rest: {
				method: "GET",
				path: "/action1"
			},
			params: {
				request: { type: "string", min: 4 }
			},
			async handler(ctx) {
				const request = ctx.params.request;
				if (request == "task1") {
					return await latest_value;
				} else {
					count = count++;
					set_var(count);
					return "TASK 2";
				}
			},
		},
		action2: {
			rest: {
				method: "GET",
				path: "/action2"
			},

			async handler(ctx) {
				count = count++;
				set_var(count);
				return "ACTIONS TWO";
			},
		},
		action3: {
			rest: {
				method: "GET",
				path: "/action3"
			},

			async handler(ctx) {
				const result = await queueScraper("https://650a615adfd73d1fab08505a.mockapi.io/book");
				return new Promise((resolve, reject) =>
					setTimeout(resolve, 5000)).then(() => {
					return "RESPONESE:"+result;
				});
			},
		}
	},

	/**
	 * Events
	 */
	events: {

	},

	/**
	 * Methods
	 */
	methods: {

	},

	/**
	 * Service created lifecycle event handler
	 */
	created() {
	},

	/**
	 * Service started lifecycle event handler
	 */
	async started() {

	},

	/**
	 * Service stopped lifecycle event handler
	 */
	async stopped() {

	}
};
