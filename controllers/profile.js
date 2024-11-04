const { responseFormatter, statusCodes, uniqueString } = require("../utils");
const { event, entity, lead, profile} = require("../db");
const { entityService, entityContact } = require("../services");

exports.getNomineeDetails = async (request, reply) => {
    try {
      // const leadId = request.params.leadId;
      const identity = request.isValid.identity;
      const data = await profile.getNomineeDetailsByIdentity(identity);
      if (data) {
        const filteredData = data.map((record) => {
          // Filter out any null values
          return Object.fromEntries(
            Object.entries(record).filter(([_, value]) => value !== null)
          );
        });
        await event.insertEventTransaction(request.isValid);
        return reply
          .status(statusCodes.OK)
          .send(
            responseFormatter(
              statusCodes.OK,
              "fetched Nominee details successfully",
              filteredData
            )
          );
      } else {
        return reply
          .status(statusCodes.INTERNAL_SERVER_ERROR)
          .send(
            responseFormatter(
              statusCodes.INTERNAL_SERVER_ERROR,
              "An unexpected error occurred",
              data
            )
          );
      }
    } catch (error) {
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