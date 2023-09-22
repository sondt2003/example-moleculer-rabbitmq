"use strict";

const ApiGateway = require("moleculer-web");
require("dotenv").config();
const { UnAuthorizedError } = ApiGateway.Errors;
const _ = require("lodash");
module.exports = {
	name: "api",
	mixins: [ApiGateway,
	],

	settings: {
		port: process.env.PORT || 3000,
		ip: "0.0.0.0",
		use: [],
		routes: [
			{
				path: "/api",
				whitelist: [
					"**"
				],
				use: [],

				// Enable/disable parameter merging method. More info: https://moleculer.services/docs/0.14/moleculer-web.html#Disable-merging
				mergeParams: true,

				authorization: true,

				autoAliases: true,

				aliases: {
					"GET greeter": "greeter.task1",
				},
				callingOptions: {},

				bodyParsers: {
					json: {
						strict: false,
						limit: "1MB"
					},
					urlencoded: {
						extended: true,
						limit: "1MB"
					}
				},
				mappingPolicy: "all",
				logging: true
			}
		],

		// Do not log client side errors (does not log an error response when the error.code is 400<=X<500)
		log4XXResponses: false,
		// Logging the request parameters. Set to any log level to enable it. E.g. "info"
		logRequestParams: null,
		// Logging the response data. Set to any log level to enable it. E.g. "info"
		logResponseData: null,


		// Serve assets from "public" folder. More info: https://moleculer.services/docs/0.14/moleculer-web.html#Serve-static-files
		assets: {
			folder: "public",

			// Options to `server-static` module
			options: {}
		}
	},
	// actions: {
	// 	rest: {
	// 		method: "GET",
	// 		path: "/process"
	// 	},
	// 	async processRequest(ctx) {
	// 		console.log("Doing processRequest");
	// 		const request = ctx.params.request;
	// 		// Xử lý yêu cầu tại đây
	// 		const response = await ctx.broker.call("greeter.task1",{request});
	// 		return response;
	// 	},
	// },
	methods: {
		async authenticate(ctx, route, req) {
			// Read the token from header
			const auth = req.headers["authorization"];

			if (auth && auth.startsWith("Bearer")) {
				const token = auth.slice(7);
				console.log("TOKEN::::::::::::::::::::::::::" + token);

				// Check the token. Tip: call a service which verify the token. E.g. `accounts.resolveToken`
				if (token == "123456") {
					// Returns the resolved user. It will be set to the `ctx.meta.user`
					return { id: 1, name: "John Doe" };

				} else {
					// Invalid token
					throw new ApiGateway.Errors.UnAuthorizedError(ApiGateway.Errors.ERR_INVALID_TOKEN);
				}

			} else {
				// No token. Throw an error or do nothing if anonymous access is allowed.
				// throw new E.UnAuthorizedError(E.ERR_NO_TOKEN);
				return null;
			}
		},
		async authorize(ctx, route, req) {
			let token;
			if (req.headers.authorization) {
				let type = req.headers.authorization.split(" ")[0];
				if (type === "Token" || type === "Bearer")
					token = req.headers.authorization.split(" ")[1];
			}
			console.log("================================" + token);
			let user;
			if (token) {
				// Verify JWT token
				try {
					user = await ctx.call("users.resolveToken", { token });
					if (user) {
						this.logger.info("Authenticated via JWT: ", user.username);
						// Reduce user fields (it will be transferred to other nodes)
						ctx.meta.user = _.pick(user, ["_id", "username", "email", "image"]);
						ctx.meta.token = token;
						ctx.meta.userID = user._id;
					}
				} catch (err) {
					// Ignored because we continue processing if user doesn't exists
				}
			}

			if (req.$action.auth == "required" && !user)
				throw new UnAuthorizedError();
		}

	}
};
