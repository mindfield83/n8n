import {
	OptionsWithUri,
} from 'request';

import {
	IExecuteFunctions,
	ILoadOptionsFunctions,
} from 'n8n-core';

import {
	IDataObject,
	IHookFunctions,
	IWebhookFunctions,
} from 'n8n-workflow';

const BEEMINDER_URI = 'https://www.beeminder.com/api/v1';

export async function beeminderApiRequest(this: IExecuteFunctions | IWebhookFunctions | IHookFunctions | ILoadOptionsFunctions, method: string, endpoint: string, body: any = {}, query: IDataObject = {}): Promise<any> { // tslint:disable-line:no-any

	const credentials = this.getCredentials('beeminderApi') as IDataObject;

	Object.assign(body, { auth_token: credentials.authToken });

	const options: OptionsWithUri = {
		method,
		body,
		qs: query,
		uri: `${BEEMINDER_URI}${endpoint}`,
		json: true,
	};

	if (!Object.keys(body).length) {
		delete options.body;
	}

	if (!Object.keys(query).length) {
		delete options.qs;
	}

	try {
		return await this.helpers.request!(options);
	} catch (error) {
		if (error?.message) {
			throw new Error(`Beeminder error response [${error.statusCode}]: ${error.message}`);
		}
		throw error;
	}
}

export async function beeminderpiRequestAllItems(this: IExecuteFunctions | ILoadOptionsFunctions | IHookFunctions, method: string, endpoint: string, body: any = {}, query: IDataObject = {}): Promise<any> { // tslint:disable-line:no-any

	const returnData: IDataObject[] = [];

	let responseData;
	query.page = 1;
	do {
		responseData = await beeminderApiRequest.call(this, method, endpoint, body, query);
		query.page++;
		returnData.push.apply(returnData, responseData);
	} while (
		responseData.length !== 0
	);

	return returnData;
}
