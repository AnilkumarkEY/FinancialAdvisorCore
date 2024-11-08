const {
  BlobServiceClient,
  StorageSharedKeyCredential,
  generateBlobSASQueryParameters,
} = require("@azure/storage-blob");
require("dotenv").config();

const blobServiceClient = BlobServiceClient.fromConnectionString(
  process.env.AZURE_STORAGE_CONNECTION_STRING
);

const containerName = "advisor-storage";

async function uploadFileToBlob(fileName, fileBuffer) {
  try {
    const containerClient = blobServiceClient.getContainerClient(containerName);
    await containerClient.createIfNotExists();
    const blobClient = containerClient.getBlockBlobClient(fileName);
    await blobClient.upload(fileBuffer, fileBuffer.length);
    console.log(`${fileName} uploaded to ${containerName}`);
    const fileUrl = blobClient.url;
    console.log(`File available at: ${fileUrl}`);
    return fileUrl;
  } catch (error) {
    console.log("Error while uploading file", error);
    throw error;
  }
}

async function downloadFileFromBlob(fileName) {
  try {
    const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME; // Your storage account name
    const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY; // Your storage account key
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blobClient = containerClient.getBlockBlobClient(fileName);
    const sharedKeyCredential = new StorageSharedKeyCredential(
      accountName,
      accountKey
    );
    // Set expiry date for the SAS token
    const expiryDate = new Date();
    expiryDate.setMinutes(expiryDate.getMinutes() + 30); // Expires in 30 minutes
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

module.exports = {
  uploadFileToBlob,
  downloadFileFromBlob,
};
