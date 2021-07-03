/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import { ApiError } from './ApiError';
import { OpenAPI } from './OpenAPI';
function isDefined(value) {
    return value !== undefined && value !== null;
}
function isString(value) {
    return typeof value === 'string';
}
function isStringWithValue(value) {
    return isString(value) && value !== '';
}
function isBlob(value) {
    return value instanceof Blob;
}
function getQueryString(params) {
    const qs = [];
    Object.keys(params).forEach(key => {
        const value = params[key];
        if (isDefined(value)) {
            if (Array.isArray(value)) {
                value.forEach(value => {
                    qs.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
                });
            }
            else {
                qs.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
            }
        }
    });
    if (qs.length > 0) {
        return `?${qs.join('&')}`;
    }
    return '';
}
function getUrl(options) {
    const path = options.path.replace(/[:]/g, '_');
    const url = `${OpenAPI.BASE}${path}`;
    if (options.query) {
        return `${url}${getQueryString(options.query)}`;
    }
    return url;
}
function getFormData(params) {
    const formData = new FormData();
    Object.keys(params).forEach(key => {
        const value = params[key];
        if (isDefined(value)) {
            formData.append(key, value);
        }
    });
    return formData;
}
async function resolve(options, resolver) {
    if (typeof resolver === 'function') {
        return resolver(options);
    }
    return resolver;
}
async function getHeaders(options) {
    const token = await resolve(options, OpenAPI.TOKEN);
    const username = await resolve(options, OpenAPI.USERNAME);
    const password = await resolve(options, OpenAPI.PASSWORD);
    const defaultHeaders = await resolve(options, OpenAPI.HEADERS);
    const headers = new Headers(Object.assign(Object.assign({ Accept: 'application/json' }, defaultHeaders), options.headers));
    if (isStringWithValue(token)) {
        headers.append('Authorization', `Bearer ${token}`);
    }
    if (isStringWithValue(username) && isStringWithValue(password)) {
        const credentials = btoa(`${username}:${password}`);
        headers.append('Authorization', `Basic ${credentials}`);
    }
    if (options.body) {
        if (isBlob(options.body)) {
            headers.append('Content-Type', options.body.type || 'application/octet-stream');
        }
        else if (isString(options.body)) {
            headers.append('Content-Type', 'text/plain');
        }
        else {
            headers.append('Content-Type', 'application/json');
        }
    }
    return headers;
}
function getRequestBody(options) {
    if (options.formData) {
        return getFormData(options.formData);
    }
    if (options.body) {
        if (isString(options.body) || isBlob(options.body)) {
            return options.body;
        }
        else {
            return JSON.stringify(options.body);
        }
    }
    return undefined;
}
async function sendRequest(options, url) {
    const request = {
        method: options.method,
        headers: await getHeaders(options),
        body: getRequestBody(options),
    };
    if (OpenAPI.WITH_CREDENTIALS) {
        request.credentials = 'include';
    }
    return await fetch(url, request);
}
function getResponseHeader(response, responseHeader) {
    if (responseHeader) {
        const content = response.headers.get(responseHeader);
        if (isString(content)) {
            return content;
        }
    }
    return null;
}
async function getResponseBody(response) {
    try {
        const contentType = response.headers.get('Content-Type');
        if (contentType) {
            const isJSON = contentType.toLowerCase().startsWith('application/json');
            if (isJSON) {
                return await response.json();
            }
            else {
                return await response.text();
            }
        }
    }
    catch (error) {
        console.error(error);
    }
    return null;
}
function catchErrors(options, result) {
    const errors = Object.assign({ 400: 'Bad Request', 401: 'Unauthorized', 403: 'Forbidden', 404: 'Not Found', 500: 'Internal Server Error', 502: 'Bad Gateway', 503: 'Service Unavailable' }, options.errors);
    const error = errors[result.status];
    if (error) {
        throw new ApiError(result, error);
    }
    if (!result.ok) {
        throw new ApiError(result, 'Generic Error');
    }
}
/**
 * Request using fetch client
 * @param options The request options from the the service
 * @returns ApiResult
 * @throws ApiError
 */
export async function request(options) {
    const url = getUrl(options);
    const response = await sendRequest(options, url);
    const responseBody = await getResponseBody(response);
    const responseHeader = getResponseHeader(response, options.responseHeader);
    const result = {
        url,
        ok: response.ok,
        status: response.status,
        statusText: response.statusText,
        body: responseHeader || responseBody,
    };
    catchErrors(options, result);
    return result;
}
