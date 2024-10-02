import { register as registerService } from "../services";
import { login as loginService } from "../services";
import { verifyAccount as verifyService } from "../services";
import { forgotPassword as forgotService } from "../services";
import { internalServerError, badRequest } from "../middlewares/handle_errors";
import { email, password } from "../helpers/joi_schema";
import joi from "joi";
import verifyToken from "../middlewares/verify_token";
import nodemailer from "nodemailer";
import flash from "connect-flash";
import path from "path";
import fs from "fs";

export const register = async (req, res) => {
  try {
    // Kiểm tra email, password
    const { error } = joi.object({ email, password }).validate(req.body);
    if (error) return badRequest(error.details[0]?.message, res);
    // Gọi hàm registerService và truyền re.body: {email, password}
    console.log("REGISTER IN CONTROLLER");
    const response = await registerService(req.body);
    return res.status(200).json(response);
  } catch (error) {
    // If there's an error, return a JSON response with status 500
    return internalServerError();
  }
};

export const login = async (req, res) => {
  try {
    // Khai báo biến email, password láy từ req.body (người dùng nhập vào)
    const { email, password } = req.body;
    console.log("email:" + email + " password:" + password);
    // Kiểm tra email, password
    if (!email || !password)
      return res.status(400).json({
        err: 1,
        mess: "Invalid email or password",
      });
    console.log("LOGIN IN CONTROLLER");
    const response = await loginService(req.body);
    return res.status(200).json(response);
  } catch (error) {
    // If there's an error, return a JSON response with status 500
    return internalServerError();
  }
};

export const verifyAccount = async (req, res) => {
  try {
    const { email } = req.params;
    console.log("Email need verify: " + email);
    console.log("VERIFY IN CONTROLLER");
    const response = await verifyService(email);
    return res.status(200).json(response);
  } catch (error) {
    // If there's an error, return a JSON response with status 500
    return internalServerError();
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.params;
    console.log("Email need forgot Password: " + email);
    console.log("FORGOT PASSWORD IN CONTROLLER");
    const response = await forgotService(email);
    return res.status(200).json(response);
  } catch (error) {
    // If there's an error, return a JSON response with status 500
    return internalServerError();
  }
};
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for port 465, false for other ports
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// async..await is not allowed in global scope, must use a wrapper
export async function sendMail(req, res) {
  try {
    // Read the HTML file
    const templatePath = path.join(
      __dirname,
      "..",
      "view",
      "emailContent.html"
    );
    let htmlContent = fs.readFileSync(templatePath, "utf-8");
    const verifyAccountLink = `http://localhost:5000/api/v1/auth/verify/${req.params.email}`;
    // Correct the placeholder syntax
    htmlContent = htmlContent.replace(
      "{{verifyAccountLink}}",
      verifyAccountLink
    );

    const info = await transporter.sendMail({
      from: '"KhangCoder 👻" <khangluctran@gmail.com>',
      to: req.params.email, // Ensure this is a valid email address
      subject: "Hello ✔",
      text: "Hello world?",
      html: htmlContent,
    });
    console.log("Message sent: %s", info.messageId);
    res.send("Verification email sent.");
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).send("Failed to send email");
  }
}

export async function sendMailForgot(req, res) {
  try {
    const response = await forgotService(req.params.email);

    if (response.error === 0) {
      // Read the HTML file
      const templatePath = path.join(
        __dirname,
        "..",
        "view",
        "forgotContent.html"
      );
      let htmlContent = fs.readFileSync(templatePath, "utf-8");

      // Replace placeholders in the HTML content
      htmlContent = htmlContent.replace("{{otp}}", response.otp);

      // Send the email
      const info = await transporter.sendMail({
        from: '"KhangCoder 👻" <khangluctran@gmail.com>',
        to: req.params.email, // Ensure this is a valid email address
        subject: "Password Reset Request ✔",
        text: "Please click the link to reset your password",
        html: htmlContent,
      });

      console.log("Message sent: %s", info.messageId);
      res.send("Verification email sent.");
    } else {
      res.status(400).send(response.message); // Handle user not found scenario
    }
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).send("Failed to send email");
  }
}
