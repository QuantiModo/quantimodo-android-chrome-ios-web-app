"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthenticationService = void 0;
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
var request_1 = require("../core/request");
var AuthenticationService = /** @class */ (function () {
    function AuthenticationService() {
    }
    /**
     * Post GoogleIdToken
     * Post GoogleIdToken
     * @returns any Successful operation
     * @throws ApiError
     */
    AuthenticationService.postGoogleIdToken = function () {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, request_1.request({
                            method: 'POST',
                            path: "/v3/googleIdToken",
                            errors: {
                                401: "Not authenticated",
                                404: "Not found",
                                500: "Internal server error",
                            },
                        })];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result.body];
                }
            });
        });
    };
    /**
     * Request Authorization Code
     * You can implement OAuth2 authentication to your application using our **OAuth2** endpoints.  You need to redirect users to `/api/v3/oauth2/authorize` endpoint to get an authorization code and include the parameters below.   This page will ask the user if they want to allow a client's application to submit or obtain data from their QM account. It will redirect the user to the url provided by the client application with the code as a query parameter or error in case of an error. See the /api/v1/oauth/access_token endpoint for the next steps.
     * @param responseType If the value is code, launches a Basic flow, requiring a POST to the token endpoint to obtain the tokens. If the value is token id_token or id_token token, launches an Implicit flow, requiring the use of Javascript at the redirect URI to retrieve tokens from the URI #fragment.
     * @param scope Scopes include basic, readmeasurements, and writemeasurements. The `basic` scope allows you to read user info (displayName, email, etc). The `readmeasurements` scope allows one to read a user's data. The `writemeasurements` scope allows you to write user data. Separate multiple scopes by a space.
     * @param clientId Your QuantiModo client id can be obtained by creating an app at https://builder.quantimo.do
     * @param clientSecret This is the secret for your obtained clientId. We use this to ensure that only your application uses the clientId.  Obtain this by creating a free application at [https://builder.quantimo.do](https://builder.quantimo.do).
     * @param redirectUri The redirect URI is the URL within your client application that will receive the OAuth2 credentials.
     * @param state An opaque string that is round-tripped in the protocol; that is to say, it is returned as a URI parameter in the Basic flow, and in the URI
     * @returns any Successful Operation
     * @throws ApiError
     */
    AuthenticationService.getOauthAuthorizationCode = function (responseType, scope, clientId, clientSecret, redirectUri, state) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, request_1.request({
                            method: 'GET',
                            path: "/v3/oauth2/authorize",
                            query: {
                                'response_type': responseType,
                                'scope': scope,
                                'clientId': clientId,
                                'client_secret': clientSecret,
                                'redirect_uri': redirectUri,
                                'state': state,
                            },
                            errors: {
                                401: "Not Authenticated",
                            },
                        })];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result.body];
                }
            });
        });
    };
    /**
     * Get a user access token
     * Client provides authorization token obtained from /api/v3/oauth2/authorize to this endpoint and receives an access token. Access token can then be used to query API endpoints. ### Request Access Token After user approves your access to the given scope form the https:/app.quantimo.do/v1/oauth2/authorize endpoint, you'll receive an authorization code to request an access token. This time make a `POST` request to `/api/v1/oauth/access_token` with parameters including: * `grant_type` Can be `authorization_code` or `refresh_token` since we are getting the `access_token` for the first time we don't have a `refresh_token` so this must be `authorization_code`. * `code` Authorization code you received with the previous request. * `redirect_uri` Your application's redirect url. ### Refreshing Access Token Access tokens expire at some point, to continue using our api you need to refresh them with `refresh_token` you received along with the `access_token`. To do this make a `POST` request to `/api/v1/oauth/access_token` with correct parameters, which are: * `grant_type` This time grant type must be `refresh_token` since we have it. * `clientId` Your application's client id. * `client_secret` Your application's client secret. * `refresh_token` The refresh token you received with the `access_token`. Every request you make to this endpoint will give you a new refresh token and make the old one expired. So you can keep getting new access tokens with new refresh tokens. ### Using Access Token Currently we support 2 ways for this, you can't use both at the same time. * Adding access token to the request header as `Authorization: Bearer {access_token}` * Adding to the url as a query parameter `?access_token={access_token}` You can read more about OAuth2 from [here](http://oauth.net/2/)
     * @param grantType Grant Type can be 'authorization_code' or 'refresh_token'
     * @param code Authorization code you received with the previous request.
     * @param responseType If the value is code, launches a Basic flow, requiring a POST to the token endpoint to obtain the tokens. If the value is token id_token or id_token token, launches an Implicit flow, requiring the use of Javascript at the redirect URI to retrieve tokens from the URI #fragment.
     * @param scope Scopes include basic, readmeasurements, and writemeasurements. The `basic` scope allows you to read user info (displayName, email, etc). The `readmeasurements` scope allows one to read a user's data. The `writemeasurements` scope allows you to write user data. Separate multiple scopes by a space.
     * @param clientId Your QuantiModo client id can be obtained by creating an app at https://builder.quantimo.do
     * @param clientSecret This is the secret for your obtained clientId. We use this to ensure that only your application uses the clientId.  Obtain this by creating a free application at [https://builder.quantimo.do](https://builder.quantimo.do).
     * @param redirectUri The redirect URI is the URL within your client application that will receive the OAuth2 credentials.
     * @param state An opaque string that is round-tripped in the protocol; that is to say, it is returned as a URI parameter in the Basic flow, and in the URI
     * @returns any Successful Operation
     * @throws ApiError
     */
    AuthenticationService.getAccessToken = function (grantType, code, responseType, scope, clientId, clientSecret, redirectUri, state) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, request_1.request({
                            method: 'GET',
                            path: "/v3/oauth2/token",
                            query: {
                                'grant_type': grantType,
                                'code': code,
                                'response_type': responseType,
                                'scope': scope,
                                'clientId': clientId,
                                'client_secret': clientSecret,
                                'redirect_uri': redirectUri,
                                'state': state,
                            },
                            errors: {
                                401: "Not Authenticated",
                            },
                        })];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result.body];
                }
            });
        });
    };
    return AuthenticationService;
}());
exports.AuthenticationService = AuthenticationService;
//# sourceMappingURL=AuthenticationService.js.map