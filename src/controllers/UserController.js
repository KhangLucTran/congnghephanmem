import * as services from "../services";
import { internalServerError, badRequest } from "../middlewares/handle_errors";
import joi from "joi";

// GET USER BY ID
export const getCurrent = async (req, res) => {
  try {
    const { id } = req.user;
    const response = await services.getOne(id);
    return res.status(200).json(response);
  } catch (error) {
    console.error(error); // Log the error for debugging
    return internalServerError(res, "An unexpected error occurred");
  }
};

// GET ALL OF USERS
export const getAllOfUsers = async (req, res) => {
  try {
    const response = await services.getAll();
    return res.status(200).json(response);
  } catch (error) {
    console.error(error);
    return internalServerError(res, "An unexpected error occurred");
  }
};

// DELETE USER BY ID
export const deteleUserById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("DELETE USER IN CONTROLLER");
    const response = await services.deleteUserById(id);
    return res.status(200).json(response);
  } catch (error) {
    console.error(error);
    return internalServerError(res, "An unexpected error occurred");
  }
};

// UPDATE USER BY ID
export const updateUserById = async (req, res) => {
  try {
    const { id } = req.params;
    // Check Validation
    // const { error } = joi.object({ email, username }).validate(req.body);
    // if (error) return badRequest(error.details[0]?.message, res);
    console.log("UPDATE USER IN CONTROLLER");
    const response = await services.editUserById(id, req.body);
    return res.status(200).json(response);
  } catch (error) {
    console.error(error);
    return internalServerError(res, "An unexpected error occurred");
  }
};
