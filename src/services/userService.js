import { response } from "express";
import db from "../models";

// Module GetOne with Bcryptjs
export const getOne = (userId) =>
  new Promise(async (resolve, reject) => {
    try {
      const response = await db.User.findOne({
        where: { id: userId },
        // Bỏ dữ liệu: không muốn đẩy ra ngoài API
        attributes: {
          exclude: ["password", "role_code"],
        },
        // Thêm dữ liệu mới từ bảng khác.
        include: [
          {
            model: db.Role,
            as: "roleData",
            attributes: ["id", "code", "value"],
          },
        ],
      });
      resolve({
        error: response ? 0 : 1,
        message: response ? "Got" : "User not found!",
        userData: response,
      });
      console.log("GET USER BY ID IN SERVICE");
    } catch (error) {
      console.error("Registration Error: ", error); // Log the error for debugging
      reject(error);
    }
  });

// Module GetAllofUsers
export const getAll = () =>
  new Promise(async (resolve, reject) => {
    try {
      const response = await db.User.findAll({
        attributes: { exclude: ["role_code"] },
        include: [
          {
            model: db.Role,
            as: "roleData",
            attributes: ["id", "code", "value"],
          },
        ],
      }); // Await the response from the database
      resolve({
        error: response ? 0 : 1,
        message: response
          ? "Get the list of users successfully"
          : "Not successfully!",
        usersData: response,
      });
      console.log("GET ALL USERS IN SERVICE");
    } catch (error) {
      reject(error);
    }
  });

//Module DELETE User
export const deleteUserById = (userId) =>
  new Promise(async (resolve, reject) => {
    try {
      const response = await db.User.destroy({
        where: { id: userId },
      });
      resolve({
        error: response ? 0 : 1,
        message: response ? "Delete user successfully!" : "Delete user Fail",
      });
      console.log("DELETE USER IN SERVICE");
    } catch (error) {
      console.error(error);
      reject(error);
    }
  });

// Moudle EDIT User
export const editUserById = (userId, userData) =>
  new Promise(async (resolve, reject) => {
    try {
      const response = await db.User.update(userData, {
        where: { id: userId },
      });
      if (response) {
        const updateUser = await db.User.findByPk(userId);
        resolve({
          error: updateUser ? 0 : 1,
          message: updateUser
            ? "Update user successfully!"
            : "Update user fail",
          user: updateUser,
        });
        console.log("UPDATE USER IN SERVICE");
      }
    } catch (error) {
      console.error(error);
      reject(error);
    }
  });
