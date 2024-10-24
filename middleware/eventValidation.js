const routeValues = require("../config/routesValues");
const { validation } = require("../db");
const {uniqueString} = require("../utils");
async function eventValidation(request, reply) {
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
  request.isValid = isValid[0];
  request.isValid["idevent_transaction"] = uniqueString();
  console.log("request.isValid", request.isValid);
  if (!isValid.length) {
    return reply
      .status(403)
      .send({ message: "You do not have permission to access this route." });
  }
}

module.exports =  eventValidation ;
