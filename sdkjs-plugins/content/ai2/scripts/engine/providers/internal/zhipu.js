"use strict";

class Provider extends AI.Provider {

	constructor() {
		super("ZhiPu", "https://open.bigmodel.cn/api/paas/v4", "");
	}

	getModels() {
		return [
			{
				id: "glm-4",
				name: "glm-4",
				provider: "ZhiPu",
				endpoints: [AI.Endpoints.Types.v1.Chat_Completions],
				options: {
					max_input_tokens: 8192
				}
			},
			{
				id: "cogview-3",
				name: "cogview-3",
				provider: "ZhiPu",
				endpoints: [AI.Endpoints.Types.v1.Images_Generations],
				options: {}
			}
		];
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

	getRequestHeaderOptions() {
		return {
			"Authorization": `Bearer ${this.key}`,
			"Content-Type": "application/json"
		};
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
			stream: false
		};
	}

	getChatCompletionsResult(message, model) {
		const result = { content: [] };
		const choices = message?.data?.choices;
		if (!choices || !choices[0]) return result;

		if (choices[0].message?.content) result.content.push(choices[0].message.content);
		else if (choices[0].delta?.content) result.content.push(choices[0].delta.content);

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
			const url = data.data[0].url;
			const width = 256 * (25.4 / 96.0) * 36000;
			const height = 256 * (25.4 / 96.0) * 36000;
			Asc.plugin.callCommand(function () {
                let oDocument = Api.GetDocument();
                let oParagraph = Api.CreateParagraph();
                let oDrawing = Api.CreateImage(url, width, height);
                oParagraph.AddDrawing(oDrawing);

                // insert picture and replace the selecting word
                oDocument.InsertContent([oParagraph]);
            })
		}
		return "";
	}
}