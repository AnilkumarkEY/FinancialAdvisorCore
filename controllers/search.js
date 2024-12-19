const { responseFormatter, statusCodes } = require("../utils");
const { tokenService, otpService, azureBlob } = require("../services");
const { event, search } = require("../db");

exports.globalsearch = async (request, reply) => {
  try {
    const { userType, searchText } = request.body;
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
      return reply.status(statusCodes.BAD_REQUEST).send("Missing required headers: ntId, userType");
    }

    const favList = await search.getFavouriteEventByUser(userType);
    const listByNtId = await search.getAllFavouriteByntId(ntId);


    // Iterate through favList to match and adjust as per NTID
    favList.forEach(userFavouriteEventMasterDto => {
      let isMatch = false;

      // Set the eventMasterId from the id
      userFavouriteEventMasterDto['eventMasterId'] = userFavouriteEventMasterDto.idfunctionality;

      // Loop through listByNtId to find the match
      listByNtId.forEach(favouriteEventMasterManage => {
        if (String(userFavouriteEventMasterDto.idfunctionality) === String(favouriteEventMasterManage.functionality_master_id)) {
          // Match found
          console.log(favouriteEventMasterManage)
          isMatch = true;
          userFavouriteEventMasterDto.display_order = favouriteEventMasterManage.display_order;
          userFavouriteEventMasterDto['enabled'] = true;
          userFavouriteEventMasterDto['nt_id'] = favouriteEventMasterManage.nt_id;
          userFavouriteEventMasterDto.idfunctionality = favouriteEventMasterManage.idfavoritefunc;
          return; // exit the loop after a match is found
        }
      });

      // If no match was found, set enabled to false and id to null
      if (!isMatch) {
        userFavouriteEventMasterDto['enabled'] = false;
        userFavouriteEventMasterDto['id'] = null;

      }
    });

    const favManageMasterList = favList.filter(fav => fav.displayOrder !== null);
    const sasToken = azureBlob.

      favList.forEach(fav => {
        const iconUrl = "endpoinUrl" + "containerName" + fav.iconUrl + sasToken;
        // const iconUrl = "https://tcnpsidhsa01.blob.core.windows.net"+"siddhi-prod"+fav.iconUrl +sasToken;

        fav.icon_url = iconUrl;

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
      .filter(fav => fav.display_order !== null)
      .sort((a, b) => a.display_order - b.display_order);  // Sorting by displayOrder


    console.log(favListDisplayOrderSorted);

    // Filter favList where displayOrder is null
    const favListDisplayOrderNull = favList.filter(fav => fav.display_order === null);

    // Combine both lists
    returnFavList.push(...favListDisplayOrderSorted);
    returnFavList.push(...favListDisplayOrderNull);

    return returnFavList;



    return reply.status(200).send(returnFavList);
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

    // Use Promise.all to handle multiple promises concurrently
    const promises = favouriteManageDto.map(async (favourite) => {
      // Create the object for insertion (map properties as necessary)

      const target = {
        idfavoritefunc: favourite.idfunctionality,
        display_order: favourite.display_order,
        functionality_master_id: favourite.eventMasterId,
        nt_id: favourite.nt_id,
      };

      console.log(target);
      // Insert into the database, assuming 'FavouriteEventMasterManage' is your Sequelize model
      if (favourite.enabled == true) {
        try {
          await search.addfav(target);
        } catch (error) {
          console.error(`Error inserting favourite: ${favourite.nt_id}, with ${favourite.idfunctionality}`, error);
          throw new Error(`Error inserting favourite: ${favourite.nt_id}, with ${favourite.idfunctionality}`, error);
        }
      } else if (favourite.enabled == false) {
        try {
          await search.deletefav(target);
        } catch (error) {
          console.error(`Error deleting favourite: ${favourite.nt_id}, with ${favourite.idfunctionality}`, error);
          throw new Error(`Error deleting favourite: ${favourite.nt_id}, with ${favourite.idfunctionality}`, error);
        }
      }
    });

    // Wait for all promises to resolve
    await Promise.all(promises);

    // Send a success response
    return reply
      .status(200)
      .send(
        responseFormatter(statusCodes.OK, "Favourites added/deleted successfully")
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