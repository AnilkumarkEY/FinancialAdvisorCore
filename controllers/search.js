const { responseFormatter, statusCodes } = require("../utils");
const { tokenService, otpService, azureBlob } = require("../services");
const { event, search } = require("../db");
require("dotenv").config();

exports.globalsearch = async (request, reply) => {
  try {
    const { userType, searchText } = request.body;
    if (!searchText) {
      return reply.status(statusCodes.OK).send("No Data Found");
    }
    if (!userType) {
      return reply
        .status(statusCodes.OK)
        .send("Missing required parameter:userType");
    }
    const searchKey = searchText.trim();
    const searchWords = searchText.split(" ");
    let globalSearch = [];
    let keyManagerCodeList = [];
    if (searchKey) {
      // Get the list of key values
      keyManagerCodeList = await search.functionalitySearchKey();
      for (let searchWord of searchWords) {
        let wordFound = false;
        searchWord = searchWord.toLowerCase();
        for (const dbResponse of keyManagerCodeList) {
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

exports.topcategories = async (request, reply) => {
  try {
    const { userType } = request.body;
    if (!userType) {
      return reply
        .status(statusCodes.OK)
        .send("Missing required parameter: userType");
    }
    const topcategoriesList = await search.getTopCategoriesList(userType);

    return reply
      .status(statusCodes.OK)
      .send(
        responseFormatter(
          statusCodes.OK,
          "Global Search successfull",
          topcategoriesList
        )
      );
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

exports.getfavourite = async (request, reply) => {
  try {
    const { ntId, userType } = request.body;
    if (!ntId || !userType) {
      return reply
        .status(statusCodes.OK)
        .send("Missing required parameter: ntId, userType");
    }

    const favList = await search.getFavouriteEventByUser(userType);
    const listByNtId = await search.getAllFavouriteByntId(ntId);

    // Iterate through favList to match and adjust as per NTID
    favList.forEach((userFavouriteEventMasterDto) => {
      let isMatch = false;

      // Set the eventMasterId from the id
      userFavouriteEventMasterDto["eventMasterId"] =
        userFavouriteEventMasterDto.idfunctionality;

      // Loop through listByNtId to find the match
      listByNtId.forEach((favouriteEventMasterManage) => {
        if (
          String(userFavouriteEventMasterDto.idfunctionality) ===
          String(favouriteEventMasterManage.functionality_master_id)
        ) {
          // Match found
          console.log(favouriteEventMasterManage);
          isMatch = true;
          userFavouriteEventMasterDto.display_order =
            favouriteEventMasterManage.display_order;
          userFavouriteEventMasterDto["enabled"] = true;
          userFavouriteEventMasterDto["nt_id"] = ntId;
          userFavouriteEventMasterDto.idfunctionality =
            favouriteEventMasterManage.idfavoritefunc;
          return; // exit the loop after a match is found
        }
      });

      // If no match was found, set enabled to false and id to null
      if (!isMatch) {
        userFavouriteEventMasterDto["enabled"] = false;
        // userFavouriteEventMasterDto.idfunctionality = null;
      }
    });

    const favManageMasterList = favList.filter(
      (fav) => fav.display_order !== null
    );

    favList.forEach((fav) => {
      if (!favManageMasterList || favManageMasterList.length === 0) {
        fav.enabled = fav.default_functionality;
        if (fav.default_functionality === true) {
          fav.display_order = fav.display_order;
        }
      }
      if (fav.display_order !== null) {
        fav.enabled = true;
      }
    });

    const returnFavList = [];

    // Sort favList by displayOrder where displayOrder is not null
    const favListDisplayOrderSorted = favList
      .filter((fav) => fav.display_order !== null)
      .sort((a, b) => a.display_order - b.display_order); // Sorting by displayOrder

    console.log(favListDisplayOrderSorted);

    // Filter favList where displayOrder is null
    const favListDisplayOrderNull = favList.filter(
      (fav) => fav.display_order === null
    );

    // Combine both lists
    returnFavList.push(...favListDisplayOrderSorted);
    returnFavList.push(...favListDisplayOrderNull);
    return reply
      .status(statusCodes.OK)
      .send(
        responseFormatter(
          statusCodes.OK,
          "Favourite list fetched successfully",
          returnFavList
        )
      );
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

exports.addfavourite = async (request, reply) => {
  try {
    const { favouriteManageDto } = request.body; // The array of objects you received

    if (!favouriteManageDto.length) {
      return reply.status(statusCodes.OK).send("Missing required parameter");
    }

    const responseData = {
      alreadyPresent: [],
      newlyAdded: [],
      alreadyDeleted: [],
      newlyDeleted: [],
    };
    const promises = favouriteManageDto.map(async (favourite) => {
      // Validate that all required parameters are present and valid
      if (
        !favourite.idfunctionality ||
        !favourite.eventMasterId ||
        !favourite.nt_id
      ) {
        const missingFields = [];
        if (!favourite.idfunctionality) missingFields.push("idfunctionality");
        if (!favourite.eventMasterId) missingFields.push("eventMasterId");
        if (!favourite.nt_id) missingFields.push("nt_id");

        // Throw error if any parameter is missing
        const errorMessage = `Missing required parameter(s): ${missingFields.join(
          ", "
        )}`;
        console.error(errorMessage);
        throw new Error(errorMessage); // Immediately reject the promise
      }

      // Create the object for insertion (map properties as necessary)
      const target = {
        idfavoritefunc: favourite.idfunctionality,
        display_order: favourite.display_order,
        functionality_master_id: favourite.eventMasterId,
        nt_id: favourite.nt_id,
      };

      console.log(target);

      if (favourite.enabled == true) {
        try {
          const favlength = await search.findfav(target);
          if (favlength.length) {
            responseData.alreadyPresent.push(target);
          } else {
            await search.addfav(target);
            responseData.newlyAdded.push(target);
          }
        } catch (error) {
          console.error(
            `Error inserting favourite: ${favourite.nt_id}, with ${favourite.idfunctionality}`,
            error
          );
          throw new Error(
            `Error inserting favourite: ${favourite.nt_id}, with ${favourite.idfunctionality}`,
            error
          );
        }
      } else if (favourite.enabled == false) {
        try {
          const favlength = await search.findfav(target);
          if (!favlength.length) {
            responseData.alreadyDeleted.push(target);
          } else {
            await search.deletefav(target);
            responseData.newlyDeleted.push(target);
          }
        } catch (error) {
          console.error(
            `Error deleting favourite: ${favourite.nt_id}, with ${favourite.idfunctionality}`,
            error
          );
          throw new Error(
            `Error deleting favourite: ${favourite.nt_id}, with ${favourite.idfunctionality}`,
            error
          );
        }
      }
    });

    // Wait for all promises to resolve
    await Promise.all(promises);

    // Send a success response
    return reply
      .status(200)
      .send(
        responseFormatter(
          statusCodes.OK,
          "Favourites added/deleted successfully",
          responseData
        )
      );
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
