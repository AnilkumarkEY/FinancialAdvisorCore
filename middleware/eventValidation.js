const routeValues = require("../config/routesValues");
const { validation } = require("../db");
const { uniqueString, statusCodes, responseFormatter } = require("../utils");
async function eventValidation(request, reply) {
  try {
    let route = request.url;
    if (route.includes("?")) {
      route = route.split("?")[0];
    } else {
      route;
    }
    console.log(route, "req-url");
    let eventDefination = routeValues.routeValues[route];
    const isValid = await validation.checkValidRoute(
      request.user.oid,
      eventDefination
    );
    if (!isValid.length) {
      return reply
        .status(statusCodes.FORBIDDEN)
        .send(
          responseFormatter(
            statusCodes.FORBIDDEN,
            "You do not have permission to access this route."
          )
        );
    } else {
      request.isValid = isValid[0];
      request.isValid["idevent_transaction"] = uniqueString();
    }
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
}

module.exports = eventValidation;
