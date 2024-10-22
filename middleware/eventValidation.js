const routeValues = require("../config/routesValues");
const { userProfile } = require("../db");
const generateUniqueString = require("../utils/generateUniqueString");
async function eventValidation(request, reply) {
    let eventDefination = routeValues.routeValues[request.url];
    const isValid = await userProfile.checkValidRoute(request.user.oid,eventDefination);
    request.isValid = isValid[0];
    request.isValid["idevent_transaction"] = generateUniqueString();
    console.log(request.isValid)
    if(!isValid.length){
        return reply.status(403).send({ message: 'You do not have permission to access this route.' });
    }
  }
  
module.exports = { eventValidation };
