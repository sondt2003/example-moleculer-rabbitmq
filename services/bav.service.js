"use strict";

const queueMixin = require("../mixins/queue.mixin");

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
