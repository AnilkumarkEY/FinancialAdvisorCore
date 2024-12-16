const { responseFormatter, statusCodes } = require("../utils");
const { tokenService, otpService, azureBlob } = require("../services");
const { event, search } = require("../db");

exports.globalsearch = async (request, reply) => {
  try {
    const { ntid, userType, searchText } = request.body;
    const searchKey = searchText.trim();
    const searchWords = searchText.split(" ");
    let globalSearch = [];
    let keyManagerCodeList = [];
    if (searchKey) {
      // Get the list of key values
      keyManagerCodeList = await search.functionalitySearchKey();
      for (const searchWord of searchWords) {
        let wordFound = false;
        for (const dbResponse of keyManagerCodeList) {
          console.log(dbResponse.keyword);
          if (dbResponse.keyword.includes(searchWord)) {
            wordFound = true;
            break;
          }
        }
        if (wordFound) {
          globalSearch = await search.functionalityMasterSearchGlobalSearch(
            userType,
            searchWord
          );
          break;
        }
      }
    } else {
      globalSearch = await search.functionalityMasterSearchGlobalSearch(
        userType,
        searchKey
      );
    }
    if (globalSearch.length) {
      await event.insertEventTransaction(request.isValid);
      return reply
        .status(statusCodes.OK)
        .send(
          responseFormatter(
            statusCodes.OK,
            "Global Search successfull",
            globalSearch
          )
        );
    } else {
      return reply
        .status(statusCodes.OK)
        .send(responseFormatter(statusCodes.OK, "No data found", globalSearch));
    }
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
