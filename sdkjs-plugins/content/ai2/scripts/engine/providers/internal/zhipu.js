"use strict";

export default class Provider extends AI.Provider {
	constructor(options) {
		super("ZhiPu-GLM", "https://open.bigmodel.cn", options.key, "/api/paas/v4");
	}

	correctModelInfo(model) {
		model.id = model.name = model.id || model.name;
	}

	checkExcludeModel(model) {
		return false; // keep all models visible
	}

	checkModelCapability(model) {
		if (model.id === "glm-4") {
			model.endpoints = [AI.Endpoints.Types.v1.Chat_Completions];
			return AI.CapabilitiesUI.Chat;
		} else if (model.id === "cogview-3") {
			model.endpoints = [AI.Endpoints.Types.v1.Images_Generations];
			return AI.CapabilitiesUI.Image;
		}
		return AI.CapabilitiesUI.All;
	}

	getRequestHeaderOptions(stream = false) {
		const headers = {
			"Authorization": `Bearer ${this.key}`,
			"Content-Type": "application/json"
		};
		if (stream) headers["Accept"] = "text/event-stream";
		return headers;
	}

	getChatCompletions(message, model) {
		const messages = message.messages.map(m => ({
			role: m.role,
			content: m.content
		}));

		const system = this.getSystemMessage(message, true);
		if (system) {
			messages.unshift({ role: "system", content: system });
		}

		return {
			model: model.id,
			messages,
			stream: true
		};
	}

	getChatCompletionsResult(message, model) {
		const result = { content: [] };
		const choices = message?.data?.choices;
		if (!choices || !choices[0]) return result;

		if (choices[0].delta?.content) result.content.push(choices[0].delta.content);
		else if (choices[0].message?.content) result.content.push(choices[0].message.content);

		return result;
	}

	getImageGeneration(message, model) {
		return {
			model: model.id,
			prompt: message.prompt
		};
	}

	async getImageGenerationResult(message, model) {
		const data = message?.data;
		if (data && data?.data?.[0]?.url) {
			return await AI.ImageEngine.getBase64FromUrl(data.data[0].url);
		}
		return "";
	}
}
