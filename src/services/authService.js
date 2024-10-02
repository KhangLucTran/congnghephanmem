import { where } from "sequelize";
import db from "../models";
import bcrypt from "bcryptjs";
import jwt, { verify } from "jsonwebtoken";
import { response } from "express";
import { raw } from "mysql2";
import { password } from "../helpers/joi_schema";
require("dotenv").config();

// Hash Password
const hashPassword = (password) =>
  bcrypt.hashSync(password, bcrypt.genSaltSync(10));

// Module Register with Bcryptjs
export const register = ({ email, password }) =>
  new Promise(async (resolve, reject) => {
    try {
      const response = await db.User.findOrCreate({
        where: { email },
        defaults: {
          email,
          password: hashPassword(password),
        },
      });
      // Create token
      const token = response[1]
        ? jwt.sign(
            {
              id: response[0].id,
              email: response[0].email,
              role_code: response[0].role_code,
            },
            process.env.JWT_SECRET,
            {
              expiresIn: "5d",
            }
          )
        : null;
      resolve({
        error: response[1] ? 0 : 1,
        message: response[1]
          ? "Register is successful!"
          : "Email already exists",
        access_token: token ? `Bearer ${token}` : "null",
      });
      console.log("REIGSTER IN SERVICE");
    } catch (error) {
      console.error("Registration Error: ", error); // Log the error for debugging
      reject(error);
    }
  });

// Module Login with BcryptJs
export const login = ({ email, password }) =>
  new Promise(async (resolve, reject) => {
    try {
      const response = await db.User.findOne({
        where: { email },
        raw: true,
      });

      // Check if user exists
      if (!response) {
        return resolve({
          error: 1,
          message: "Email hasn't been registered",
          access_token: null,
        });
      }
      // Check password
      const isChecked = bcrypt.compareSync(password, response.password);

      // Check verifyState
      if (response.verifyState === "false") {
        return resolve({
          error: 1,
          message: "Account not verified. Please verify your email.",
          access_token: null,
        });
      }

      const token = isChecked
        ? jwt.sign(
            {
              id: response.id,
              email: response.email,
              role_code: response.role_code,
            },
            process.env.JWT_SECRET,
            {
              expiresIn: "5d",
            }
          )
        : null;

      // Resolve with the appropriate message and token
      resolve({
        error: token ? 0 : 1,
        message: token ? "Login is successful" : "Password Invalid",
        access_token: token ? `${token}` : null,
      });
      console.log("LOGIN IN SERVICE");
    } catch (error) {
      reject(error);
    }
  });

// Module VerifyAccount
export const verifyAccount = (email) =>
  new Promise(async (resolve, reject) => {
    try {
      // Update the user's verifyState to "true"
      const [updatedCount] = await db.User.update(
        { verifyState: "true" },
        {
          where: {
            email,
            verifyState: "false",
          },
        }
      );

      // Check if the update was successful
      if (updatedCount === 1) {
        resolve({
          error: 0,
          message: "Verify Account Successfully!",
        });
      } else {
        resolve({
          error: 1,
          message:
            "Verify Account Fail. No matching user found or already verified.",
        });
      }
      console.log("VERIFY ACCOUNT IN SERVICE");
    } catch (error) {
      reject(error);
    }
  });

// Module Forgot Password
export const forgotPassword = (email) =>
  new Promise(async (resolve, reject) => {
    try {
      const otp = generatedOTP();
      const [response] = await db.User.update(
        { password: hashPassword(otp) },
        {
          where: { email },
        }
      );
      console.log("New Password: " + otp);
      if (response === 1) {
        resolve({
          error: 0,
          message: "Reset Password Successfull wtih OTP: " + otp,
          otp,
        });
      } else {
        resolve({
          error: 1,
          message:
            "Forgot Password Fail. No matching user found or already verified.",
        });
      }
    } catch (error) {
      console.log(error);
      reject(error);
    }
  });

// Function generatedOTP
function generatedOTP(length = 6) {
  const characters = "0123456789"; // Numeric OTP
  let otp = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    otp += characters[randomIndex];
  }
  return otp;
}
