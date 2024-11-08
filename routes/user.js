const { user } = require("../controllers");
const { authentication, validation } = require("../middleware");

async function userRoutes(fastify, options) {
  // Define user routes
  fastify.get(
    "/get-users",
    { preHandler: [authentication, validation] },
    user.getUsers
  );
  fastify.post("/login", user.loginUser);
  fastify.post(
    "/get-otp",
    { preHandler: [authentication, validation] },
    user.sendOtp
  );
  fastify.post(
    "/verify-otp",
    { preHandler: [authentication, validation] },
    user.verifyOtp
  );
  fastify.post("/change-password", user.changePassword);
  fastify.post(
    "/upload-file",
    { preHandler: [authentication, validation] },
    user.uploadFile // Controller function for file upload
  );
  fastify.get(
    "/download-file",
    { preHandler: [authentication, validation] },
    user.downloadFile
  );
}

module.exports = userRoutes;
