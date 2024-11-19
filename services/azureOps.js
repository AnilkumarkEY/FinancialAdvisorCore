
const AzureGraphClient = require('./AzureGraphClient');

const getUserByEmail = async (userEmail) => {
    try {
        const azureGraphClient = new AzureGraphClient(); // Create an instance of AzureGraphClient
        const graphClient = await azureGraphClient.getGraphClient();
        const res = await graphClient.api(`/users`).filter(`mail eq '${userEmail}'`).get();
        if (res) {
            return {
                status: 'ok',
                res
            };
        } else {
            return null
        }
    } catch (error) {
        return {
            status: 'error',
            error
        };
    }
}

const resetchangeUserPassword = async (userId, newPassword) => {
    try {
        const azureGraphClient = new AzureGraphClient(); // Create an instance of the AzureGraphClient class
        const graphClient = await azureGraphClient.getGraphClient();

        // Payload for changing password (we don't need currentPassword in this case)
        const user = {
            passwordProfile: {
                password: newPassword,
                forceChangePasswordNextSignIn: false // Optional: set this to true if you want the user to change password at next login
            }
        };

        // Make the request to Microsoft Graph API to change the password
        const response = await graphClient.api(`/users/${userId}`).patch(user);
        console.log("Password reset successfully:", response);
        return {
            status: 'ok'
        }

    } catch (error) {
        console.error('Error during password change:', error);
        return {
            status: 'error',
            error: error.response ? error.response.data : error.message
        };
    }
}


module.exports = {
    getUserByEmail,
    resetchangeUserPassword
}