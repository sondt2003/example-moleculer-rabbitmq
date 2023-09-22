"use strict";

const { ServiceBroker } = require("moleculer");
const { ValidationError } = require("moleculer").Errors;
const TestService = require("../../../services/bav.service");

describe("Test 'bav' service", () => {
	let broker = new ServiceBroker({ logger: false });
	broker.createService(TestService);
	beforeAll(() => broker.start());
	afterAll(() => broker.stop());

	describe("Test 'bav.task' action", () => {
		it("should return", async () => {
			const res = await broker.call("bav.task",{request:"task1"});
			expect(res).toBe(res);
		},10000);

	});
});

