"use strict";

class Provider extends AI.Provider {

	constructor() {
		super("ZhiPu-GLM", "https://open.bigmodel.cn", "/api/paas/v4", "");
	}

	correctModelInfo(model) {
		model.id = model.name;
	}

	checkModelCapability(model) {
		// ZhiPu GLM-4 supports chat completions only
		model.options.max_input_tokens = 8192; // Adjust based on model limits
		model.endpoints.push(AI.Endpoints.Types.v1.Chat_Completions);
		return AI.CapabilitiesUI.Chat;
	}

	getEndpointUrl(endpoint, model) {
		let Types = AI.Endpoints.Types;
		let url = "";

		switch (endpoint) {
			case Types.v1.Models:
				url = "/models"; // ZhiPu doesn't expose model listing, mock it if needed
				break;
			default:
				url = "/chat/completions"; // ZhiPu GLM endpoint
				break;
		}

		if (this.key)
			url = this.path + url + "?api_key=" + this.key;
		else
			url = this.path + url;

		return url;
	}

	getRequestHeaderOptions() {
		return {
			"Content-Type": "application/json",
			"Authorization": `Bearer ${this.key}`
		};
	}

	getChatCompletions(message, model) {
		let messages = [];
		for (let i = 0, len = message.messages.length; i < len; i++) {
			let m = message.messages[i];
			messages.push({ role: m.role, content: m.content });
		}

		return {
			model: model.id,
			messages: messages
		};
	}
}