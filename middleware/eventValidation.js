const routeValues = require("../config/routesValues");
const { userProfile } = require("../db");
const generateUniqueString = require("../utils/generateUniqueString");
async function eventValidation(request, reply) {
    let eventDefination = routeValues.routeValues[request.url]!==undefined?routeValues.routeValues[request.url]:
    routeValues.routeValues[makeUrl(request.url)];
    console.log("eventDefination", eventDefination)
    const isValid = await userProfile.checkValidRoute(request.user.oid,eventDefination);
    request.isValid = isValid[0];
    console.log("request", request);
    request.isValid["idevent_transaction"] = generateUniqueString();
    console.log("request.isValid", request.isValid)
    if(!isValid.length){
        return reply.status(403).send({ message: 'You do not have permission to access this route.' });
    }
  }

  function makeUrl(urls) {
    const url = urls;
    const segments = url.split("/");
    const desiredSegment = `/${segments[1]}/${segments[2]}`;
    console.log(desiredSegment);
    return desiredSegment;
  }
  
module.exports = { eventValidation };
