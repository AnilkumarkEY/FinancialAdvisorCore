const {responseFormatter, statusCodes} = require("../utils");
const loginData = require("../dummyData/login");
const { tokenService } = require("../services");
const {user, event} = require("../db")

exports.getUsers = async (request, reply) => {
  try {
    // Respond with the list of users
    const userData = await user.getUsers();
    if(userData){
        await event.insertEventTransaction(request.isValid);
        return reply
        .status(statusCodes.OK)
        .send(
          responseFormatter(
            statusCodes.OK,
            "User list retrieved successfully",
            userData
          )
        );
    }else{
        return reply
        .status(statusCodes.OK)
        .send(
          responseFormatter(
            statusCodes.OK,
            "no data found",
            {}
          )
        );
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

exports.loginUser = async (request, reply) => {
  try {
    const { userName, password } = request.body;
    // Validate request body
    if (!userName || !password) {
      return reply
        .status(statusCodes.BAD_REQUEST)
        .send(
          responseFormatter(
            statusCodes.BAD_REQUEST,
            "userName and password are required"
          )
        );
    }

    const validUser =  await user.checkValidUser(userName);

    if (validUser[0].user_exists) {
      // Successful login
      const getUserAccessToken = await tokenService.getUserAccessToken({
        userName,
        password,
      });
      if (!getUserAccessToken.hasOwnProperty("token_type")) {
        return reply
          .status(statusCodes.INTERNAL_SERVER_ERROR)
          .send(
            responseFormatter(
              statusCodes.INTERNAL_SERVER_ERROR,
              "An unexpected error occurred"
            )
          );
      } else {
        return reply
          .status(statusCodes.OK)
          .send(
            responseFormatter(
              statusCodes.OK,
              "Login successful",
              getUserAccessToken
            )
          );
      }
    } else {
      // User not found
      return reply
        .status(statusCodes.UNAUTHORIZED)
        .send(
          responseFormatter(
            statusCodes.UNAUTHORIZED,
            "Invalid email or password"
          )
        );
    }
  } catch (error) {
    // Handle unexpected errors
    console.log(error);
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

exports.sendOtp = async (request, reply) => {
  try {
    const { agent_code } = request.body;

    // Validate request body
    if (!agent_code) {
      return reply
        .status(statusCodes.BAD_REQUEST)
        .send(responseFormatter(statusCodes.BAD_REQUEST, "Agent code is required"));
    }

    // Find user based on agent code
    const user = await userProfile.getUserDataForOtp(request.isValid.identity,agent_code);
    if (user) {
      // Simulate sending OTP (in a real scenario, you would send the OTP via email/SMS)
      return reply.status(statusCodes.OK).send(
        responseFormatter(statusCodes.OK, "OTP sent successfully", {
          otp: user.otp,
        })
      );
    } else {
      return reply
        .status(statusCodes.NOT_FOUND)
        .send(responseFormatter(statusCodes.NOT_FOUND, "User not found"));
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

exports.changePassword = async (request, reply) => {
  try {
    const { email, otp, newPassword } = request.body;

    // Validate request body
    if (!email || !otp || !newPassword) {
      return reply
        .status(statusCodes.BAD_REQUEST)
        .send(
          responseFormatter(
            statusCodes.BAD_REQUEST,
            "Email, OTP, and new password are required"
          )
        );
    }

    // Find user based on email
    const user = loginData.find((user) => user.email === email);

    if (user) {
      // Check if OTP matches
      if (user.otp === otp) {
        // Update password
        user.password = newPassword; // Update the password
        return reply
          .status(statusCodes.OK)
          .send(
            responseFormatter(statusCodes.OK, "Password changed successfully")
          );
      } else {
        return reply
          .status(statusCodes.UNAUTHORIZED)
          .send(responseFormatter(statusCodes.UNAUTHORIZED, "Invalid OTP"));
      }
    } else {
      return reply
        .status(statusCodes.NOT_FOUND)
        .send(responseFormatter(statusCodes.NOT_FOUND, "User not found"));
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
