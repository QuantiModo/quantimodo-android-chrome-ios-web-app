/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import { request as __request } from '../core/request';
export class AuthenticationService {
    /**
     * Post GoogleIdToken
     * Post GoogleIdToken
     * @returns any Successful operation
     * @throws ApiError
     */
    static async postGoogleIdToken() {
        const result = await __request({
            method: 'POST',
            path: `/v3/googleIdToken`,
            errors: {
                401: `Not authenticated`,
                404: `Not found`,
                500: `Internal server error`,
            },
        });
        return result.body;
    }
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
    static async getOauthAuthorizationCode(responseType, scope, clientId, clientSecret, redirectUri, state) {
        const result = await __request({
            method: 'GET',
            path: `/v3/oauth2/authorize`,
            query: {
                'response_type': responseType,
                'scope': scope,
                'clientId': clientId,
                'client_secret': clientSecret,
                'redirect_uri': redirectUri,
                'state': state,
            },
            errors: {
                401: `Not Authenticated`,
            },
        });
        return result.body;
    }
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
    static async getAccessToken(grantType, code, responseType, scope, clientId, clientSecret, redirectUri, state) {
        const result = await __request({
            method: 'GET',
            path: `/v3/oauth2/token`,
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
                401: `Not Authenticated`,
            },
        });
        return result.body;
    }
}
