const responseFormatter = require("../utils/responseFormatter");
const STATUS_CODES = require("../utils/statusCodes");
const loginData = require("../dummyData/login");
const { tokenService } = require("../services");
const {userProfile} = require("../db")

exports.getUsers = async (request, reply) => {
  try {
    // Respond with the list of users
    const user = await userProfile.getUsers();
    if(user){
        await userProfile.insertEventTransaction(request.isValid);
        return reply
        .status(STATUS_CODES.OK)
        .send(
          responseFormatter(
            STATUS_CODES.OK,
            "User list retrieved successfully",
            user
          )
        );
    }else{
        return reply
        .status(STATUS_CODES.OK)
        .send(
          responseFormatter(
            STATUS_CODES.OK,
            "no data found",
            {}
          )
        );
    }

  } catch (error) {
    // Handle unexpected errors
    console.error(error);
    return reply
      .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
      .send(
        responseFormatter(
          STATUS_CODES.INTERNAL_SERVER_ERROR,
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
        .status(STATUS_CODES.BAD_REQUEST)
        .send(
          responseFormatter(
            STATUS_CODES.BAD_REQUEST,
            "userName and password are required"
          )
        );
    }

    // Find user based on email and password
    const user = loginData.find(
      (user) => user.userName === userName && user.password === password
    );

    if (user) {
      // Successful login
      const getUserAccessToken = await tokenService.getUserAccessToken({
        userName,
        password,
      });
      if (!getUserAccessToken.hasOwnProperty("token_type")) {
        return reply
          .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
          .send(
            responseFormatter(
              STATUS_CODES.INTERNAL_SERVER_ERROR,
              "An unexpected error occurred"
            )
          );
      } else {
        return reply
          .status(STATUS_CODES.OK)
          .send(
            responseFormatter(
              STATUS_CODES.OK,
              "Login successful",
              getUserAccessToken
            )
          );
      }
    } else {
      // User not found
      return reply
        .status(STATUS_CODES.UNAUTHORIZED)
        .send(
          responseFormatter(
            STATUS_CODES.UNAUTHORIZED,
            "Invalid email or password"
          )
        );
    }
  } catch (error) {
    // Handle unexpected errors
    console.log(error);
    return reply
      .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
      .send(
        responseFormatter(
          STATUS_CODES.INTERNAL_SERVER_ERROR,
          "An unexpected error occurred"
        )
      );
  }
};

exports.sendOtp = async (request, reply) => {
  try {
    const { email } = request.body;

    // Validate request body
    if (!email) {
      return reply
        .status(STATUS_CODES.BAD_REQUEST)
        .send(responseFormatter(STATUS_CODES.BAD_REQUEST, "Email is required"));
    }

    // Find user based on email
    const user = loginData.find((user) => user.email === email);

    if (user) {
      // Simulate sending OTP (in a real scenario, you would send the OTP via email/SMS)
      return reply.status(STATUS_CODES.OK).send(
        responseFormatter(STATUS_CODES.OK, "OTP sent successfully", {
          otp: user.otp,
        })
      );
    } else {
      return reply
        .status(STATUS_CODES.NOT_FOUND)
        .send(responseFormatter(STATUS_CODES.NOT_FOUND, "User not found"));
    }
  } catch (error) {
    console.error(error);
    return reply
      .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
      .send(
        responseFormatter(
          STATUS_CODES.INTERNAL_SERVER_ERROR,
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
        .status(STATUS_CODES.BAD_REQUEST)
        .send(
          responseFormatter(
            STATUS_CODES.BAD_REQUEST,
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
          .status(STATUS_CODES.OK)
          .send(
            responseFormatter(STATUS_CODES.OK, "Password changed successfully")
          );
      } else {
        return reply
          .status(STATUS_CODES.UNAUTHORIZED)
          .send(responseFormatter(STATUS_CODES.UNAUTHORIZED, "Invalid OTP"));
      }
    } else {
      return reply
        .status(STATUS_CODES.NOT_FOUND)
        .send(responseFormatter(STATUS_CODES.NOT_FOUND, "User not found"));
    }
  } catch (error) {
    console.error(error);
    return reply
      .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
      .send(
        responseFormatter(
          STATUS_CODES.INTERNAL_SERVER_ERROR,
          "An unexpected error occurred"
        )
      );
  }
};
