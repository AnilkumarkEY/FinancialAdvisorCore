const { ClientSecretCredential } = require('@azure/identity');
const axios = require('axios');
const { Client } = require('@microsoft/microsoft-graph-client');
require("dotenv").config();

const axiosHttpProvider = {
    sendRequest: async (graphRequest) => {
        try {
            // Get the access token from the auth provider
            const token = await graphRequest.authProvider.getAccessToken();
            const url = graphRequest.url;
            const method = graphRequest.method || 'GET';
            const headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            };

            const options = {
                method,
                url,
                headers,
                data: graphRequest.body,
            };

            // Make the actual API request
            const response = await axios(options);

            // Return the response in a standard format
            return {
                status: response.status,
                headers: response.headers,
                body: response.data,
            };
        } catch (error) {
            // Enhanced error handling for HTTP errors (like 401 or 403)
            console.error('Error during HTTP request:', error);

            if (error.response) {
                // Log detailed error response from the Graph API
                console.error('Response error:', error.response.data);
            }

            throw error;  // Rethrow the error to be handled further up the stack
        }
    },
};

class AzureGraphClient {
    constructor() {
        this.tenantId = process.env.TENANT_ID;
        this.clientId = process.env.CLIENT_ID;
        this.clientSecret = process.env.CLIENT_SECRET;
    }

    async getGraphClient() {
        const scopes = ["https://graph.microsoft.com/.default"]; // Scopes required by Microsoft Graph API (application permissions)

        const credential = new ClientSecretCredential(this.tenantId, this.clientId, this.clientSecret); // Create the ClientSecretCredential for Azure AD authentication

        if (!scopes || !credential) {
            throw new Error("Unexpected error: Missing scopes or credential.");
        }

        // Authentication provider that retrieves the access token
        const authProvider = {
            getAccessToken: async () => {
                const tokenResponse = await credential.getToken(scopes);
                return tokenResponse.token;
            },
        };

        // Build the Microsoft Graph client using the custom axios HTTP provider
        const graphClient = Client.initWithMiddleware({
            authProvider: authProvider,
            httpProvider: axiosHttpProvider,  // Use custom axios HTTP provider
        });

        return graphClient;
    }
}

module.exports = AzureGraphClient;

