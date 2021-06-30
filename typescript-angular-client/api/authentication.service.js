"use strict";
/**
 * quantimodo
 * We make it easy to retrieve and analyze normalized user data from a wide array of devices and applications. Check out our [docs and sdk's](https://github.com/QuantiModo/docs) or [contact us](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.112511
 *
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */
/* tslint:disable:no-unused-variable member-ordering */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var http_1 = require("@angular/common/http");
var encoder_1 = require("../encoder");
var variables_1 = require("../variables");
var configuration_1 = require("../configuration");
var AuthenticationService = /** @class */ (function () {
    function AuthenticationService(httpClient, basePath, configuration) {
        this.httpClient = httpClient;
        this.basePath = 'https://app.quantimo.do/api';
        this.defaultHeaders = new http_1.HttpHeaders();
        this.configuration = new configuration_1.Configuration();
        if (basePath) {
            this.basePath = basePath;
        }
        if (configuration) {
            this.configuration = configuration;
            this.basePath = basePath || configuration.basePath || this.basePath;
        }
    }
    /**
     * @param consumes string[] mime-types
     * @return true: consumes contains 'multipart/form-data', false: otherwise
     */
    AuthenticationService.prototype.canConsumeForm = function (consumes) {
        var form = 'multipart/form-data';
        for (var _i = 0, consumes_1 = consumes; _i < consumes_1.length; _i++) {
            var consume = consumes_1[_i];
            if (form === consume) {
                return true;
            }
        }
        return false;
    };
    AuthenticationService.prototype.getAccessToken = function (grantType, code, responseType, scope, clientId, clientSecret, redirectUri, state, observe, reportProgress) {
        if (observe === void 0) { observe = 'body'; }
        if (reportProgress === void 0) { reportProgress = false; }
        if (grantType === null || grantType === undefined) {
            throw new Error('Required parameter grantType was null or undefined when calling getAccessToken.');
        }
        if (code === null || code === undefined) {
            throw new Error('Required parameter code was null or undefined when calling getAccessToken.');
        }
        if (responseType === null || responseType === undefined) {
            throw new Error('Required parameter responseType was null or undefined when calling getAccessToken.');
        }
        if (scope === null || scope === undefined) {
            throw new Error('Required parameter scope was null or undefined when calling getAccessToken.');
        }
        var queryParameters = new http_1.HttpParams({ encoder: new encoder_1.CustomHttpUrlEncodingCodec() });
        if (clientId !== undefined && clientId !== null) {
            queryParameters = queryParameters.set('clientId', clientId);
        }
        if (clientSecret !== undefined && clientSecret !== null) {
            queryParameters = queryParameters.set('client_secret', clientSecret);
        }
        if (grantType !== undefined && grantType !== null) {
            queryParameters = queryParameters.set('grant_type', grantType);
        }
        if (code !== undefined && code !== null) {
            queryParameters = queryParameters.set('code', code);
        }
        if (responseType !== undefined && responseType !== null) {
            queryParameters = queryParameters.set('response_type', responseType);
        }
        if (scope !== undefined && scope !== null) {
            queryParameters = queryParameters.set('scope', scope);
        }
        if (redirectUri !== undefined && redirectUri !== null) {
            queryParameters = queryParameters.set('redirect_uri', redirectUri);
        }
        if (state !== undefined && state !== null) {
            queryParameters = queryParameters.set('state', state);
        }
        var headers = this.defaultHeaders;
        // authentication (access_token) required
        if (this.configuration.apiKeys["access_token"]) {
            queryParameters = queryParameters.set('access_token', this.configuration.apiKeys["access_token"]);
        }
        // authentication (quantimodo_oauth2) required
        if (this.configuration.accessToken) {
            var accessToken = typeof this.configuration.accessToken === 'function'
                ? this.configuration.accessToken()
                : this.configuration.accessToken;
            headers = headers.set('Authorization', 'Bearer ' + accessToken);
        }
        // to determine the Accept header
        var httpHeaderAccepts = [
            'application/json'
        ];
        var httpHeaderAcceptSelected = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        if (httpHeaderAcceptSelected != undefined) {
            headers = headers.set('Accept', httpHeaderAcceptSelected);
        }
        // to determine the Content-Type header
        var consumes = [
            'application/json'
        ];
        return this.httpClient.get(this.basePath + "/v3/oauth2/token", {
            params: queryParameters,
            withCredentials: this.configuration.withCredentials,
            headers: headers,
            observe: observe,
            reportProgress: reportProgress
        });
    };
    AuthenticationService.prototype.getOauthAuthorizationCode = function (responseType, scope, clientId, clientSecret, redirectUri, state, observe, reportProgress) {
        if (observe === void 0) { observe = 'body'; }
        if (reportProgress === void 0) { reportProgress = false; }
        if (responseType === null || responseType === undefined) {
            throw new Error('Required parameter responseType was null or undefined when calling getOauthAuthorizationCode.');
        }
        if (scope === null || scope === undefined) {
            throw new Error('Required parameter scope was null or undefined when calling getOauthAuthorizationCode.');
        }
        var queryParameters = new http_1.HttpParams({ encoder: new encoder_1.CustomHttpUrlEncodingCodec() });
        if (clientId !== undefined && clientId !== null) {
            queryParameters = queryParameters.set('clientId', clientId);
        }
        if (clientSecret !== undefined && clientSecret !== null) {
            queryParameters = queryParameters.set('client_secret', clientSecret);
        }
        if (responseType !== undefined && responseType !== null) {
            queryParameters = queryParameters.set('response_type', responseType);
        }
        if (scope !== undefined && scope !== null) {
            queryParameters = queryParameters.set('scope', scope);
        }
        if (redirectUri !== undefined && redirectUri !== null) {
            queryParameters = queryParameters.set('redirect_uri', redirectUri);
        }
        if (state !== undefined && state !== null) {
            queryParameters = queryParameters.set('state', state);
        }
        var headers = this.defaultHeaders;
        // authentication (access_token) required
        if (this.configuration.apiKeys["access_token"]) {
            queryParameters = queryParameters.set('access_token', this.configuration.apiKeys["access_token"]);
        }
        // authentication (quantimodo_oauth2) required
        if (this.configuration.accessToken) {
            var accessToken = typeof this.configuration.accessToken === 'function'
                ? this.configuration.accessToken()
                : this.configuration.accessToken;
            headers = headers.set('Authorization', 'Bearer ' + accessToken);
        }
        // to determine the Accept header
        var httpHeaderAccepts = [
            'application/json'
        ];
        var httpHeaderAcceptSelected = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        if (httpHeaderAcceptSelected != undefined) {
            headers = headers.set('Accept', httpHeaderAcceptSelected);
        }
        // to determine the Content-Type header
        var consumes = [
            'application/json'
        ];
        return this.httpClient.get(this.basePath + "/v3/oauth2/authorize", {
            params: queryParameters,
            withCredentials: this.configuration.withCredentials,
            headers: headers,
            observe: observe,
            reportProgress: reportProgress
        });
    };
    AuthenticationService.prototype.postGoogleIdToken = function (observe, reportProgress) {
        if (observe === void 0) { observe = 'body'; }
        if (reportProgress === void 0) { reportProgress = false; }
        var headers = this.defaultHeaders;
        // to determine the Accept header
        var httpHeaderAccepts = [
            'application/json'
        ];
        var httpHeaderAcceptSelected = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        if (httpHeaderAcceptSelected != undefined) {
            headers = headers.set('Accept', httpHeaderAcceptSelected);
        }
        // to determine the Content-Type header
        var consumes = [
            'application/json'
        ];
        return this.httpClient.post(this.basePath + "/v3/googleIdToken", null, {
            withCredentials: this.configuration.withCredentials,
            headers: headers,
            observe: observe,
            reportProgress: reportProgress
        });
    };
    AuthenticationService = __decorate([
        core_1.Injectable(),
        __param(1, core_1.Optional()), __param(1, core_1.Inject(variables_1.BASE_PATH)), __param(2, core_1.Optional())
    ], AuthenticationService);
    return AuthenticationService;
}());
exports.AuthenticationService = AuthenticationService;
