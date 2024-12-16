const { responseFormatter, statusCodes } = require("../utils");
const { tokenService, otpService, azureBlob } = require("../services");
const { search } = require("../db");

exports.globalsearch = async (request, reply) => {
  try {
    const { ntid, userType, searchText } = request.body;
    const searchKey = searchText.trim();
    const searchWords = searchText.split(' ');
    let globalSearch = [];
    let keyManagerCodeList = [];

    if (searchKey) {
      // Get the list of key values
      keyManagerCodeList = await search.functionalitySearchKey();
      for (const searchWord of searchWords) {

        let wordFound = false;
        for (const dbResponse of keyManagerCodeList) {
          console.log(dbResponse.keyword)
          if (dbResponse.keyword.includes(searchWord)) {
            console.log(searchWord)
            console.log("Abhishek")
            wordFound = true;
            break;
          }
        }

        if (wordFound) {
          // Get global search results for the word
          console.log("Word Found")
          console.log(ntid)
          console.log(userType)
          console.log(searchWord)
          globalSearch = await search.functionalityMasterSearchGlobalSearch(userType, searchWord);
          break;
        }
      }
    } else {
      globalSearch = await search.functionalityMasterSearchGlobalSearch(userType, searchKey);
    }

    reply.status(200).send(globalSearch);
  } catch (error) {
    // Handle unexpected errors
    console.error(error);
    return reply
      .status(statusCodes.INTERNAL_SERVER_ERROR)
      .send(
        responseFormatter(
          statusCodes.INTERNAL_SERVER_ERROR,
          "An unexpected error occurred"
        )
      );
  }
};