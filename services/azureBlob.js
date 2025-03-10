const {
  BlobServiceClient,
  StorageSharedKeyCredential,
  generateBlobSASQueryParameters,
} = require("@azure/storage-blob");
require("dotenv").config();

const blobServiceClient = BlobServiceClient.fromConnectionString(
  process.env.AZURE_STORAGE_CONNECTION_STRING
);

const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME; // Your storage account name
const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY; // Your storage account key
const containerName = process.env.AZURE_CONTAINERNAME;

async function uploadFileToBlob(fileName, fileBuffer) {
  try {
    // Get container client and create container if it does not exist
    const containerClient = blobServiceClient.getContainerClient(containerName);
    await containerClient.createIfNotExists();

    // Upload the file to Azure Blob Storage
    const blobClient = containerClient.getBlockBlobClient(fileName);
    await blobClient.upload(fileBuffer, fileBuffer.length);
    console.log(`${fileName} uploaded to ${containerName}`);

    // Generate SAS token for the file with 100-year expiry for download access
    const sharedKeyCredential = new StorageSharedKeyCredential(
      accountName,
      accountKey
    );
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 100); // Set expiry date to 100 years in the future

    const sasToken = generateBlobSASQueryParameters(
      {
        containerName,
        blobName: fileName,
        permissions: "r", // read permission
        expiresOn: expiryDate,
      },
      sharedKeyCredential
    ).toString();

    // Construct the file URL with the SAS token
    const fileUrlWithSAS = `${blobClient.url}?${sasToken}`;
    console.log(`File available at: ${fileUrlWithSAS}`);

    return fileUrlWithSAS; // Return the file download link with SAS token
  } catch (error) {
    console.log("Error while uploading file", error);
    throw error;
  }
}

async function downloadFileFromBlob(fileName) {
  try {
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blobClient = containerClient.getBlockBlobClient(fileName);
    const sharedKeyCredential = new StorageSharedKeyCredential(
      accountName,
      accountKey
    );
    // Set expiry date for the SAS token
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 100);
    // Generate the SAS token
    const sasToken = generateBlobSASQueryParameters(
      {
        containerName,
        blobName: fileName,
        permissions: "r", // read permission
        expiresOn: expiryDate,
      },
      sharedKeyCredential
    ).toString();
    const fileUrlWithSAS = `${blobClient.url}?${sasToken}`;
    console.log("SAS URL: ", fileUrlWithSAS);
    return fileUrlWithSAS;
  } catch (error) {
    throw error;
  }
}


async function getSasToken() {
  try {
    const sharedKeyCredential = new StorageSharedKeyCredential(
      accountName,
      accountKey
    );

    const containerClient = blobServiceClient.getContainerClient(containerName);
    await containerClient.createIfNotExists();

    // Set the expiration date for the SAS token (100 years from now)
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 100); // Set expiry date to 100 years in the future


    // const sasToken = containerClient.generateSasUrl({
    //   permissions: 'r', // Read permission
    //   expiresOn: expiryDate,
    // });

    // Generate the SAS token with read permissions
    const sasToken = generateBlobSASQueryParameters(
      {
        // containerName,
        permissions: "r", // read permission
        expiresOn: expiryDate,
      },
      sharedKeyCredential
    ).toString();

    // Return the SAS token
    return "?" + sasToken;
  } catch (error) {
    console.error('Error generating SAS token:', error);
    throw new Error('Failed to generate SAS token.');
  }
}

module.exports = {
  uploadFileToBlob,
  downloadFileFromBlob,
  getSasToken
};
