import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";
import jwt from "jsonwebtoken";
import db from "./src/models";
require("./connection_database");
import initRoutes from "./src/routes"; // Import initRoutes
import session from "express-session";
dotenv.config();

const app = express();

// Config Methods
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST", "DELETE", "PUT"],
  })
);

// Cấu hình session
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Đặt true nếu bạn sử dụng HTTPS
  })
);

// Config object convert JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Khởi động Passport
app.use(passport.initialize());
app.use(passport.session());

// Cấu hình Passport với GoogleStrategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/v1/auth/google/callback",
      profileFields: ["id", "displayName", "photos", "emails"],
    },
    async (accessToken, refreshToken, profile, done) => {
      console.log("Profile:", profile);
      try {
        let [user, created] = await db.User.findOrCreate({
          where: { email: profile.emails[0].value, provider: profile.provider },
          defaults: {
            email: profile.emails[0].value,
            username: profile.displayName,
            provider: profile.provider,
            avatar: profile.photos[0].value,
          },
        });

        done(null, user); // Pass the entire user object
      } catch (error) {
        done(error);
      }
    }
  )
);

// Hàm xử lý callback
const googleCallback = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  try {
    const user = req.user; // Lấy thông tin người dùng từ req.user
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.redirect(`http://localhost:3000/home?token=${token}`);
  } catch (error) {
    res.status(500).json({ message: "Login failed", error: error.message });
  }
};

// Route để khởi động xác thực Google
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Callback route
app.get(
  "/api/v1/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  googleCallback
);

// Login with Facebook: Cấu hình passport với facebook
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: "/auth/facebook/callback",
      profileFields: ["id", "displayName", "photos", "emails"], // Specify the fields you want to retrieve
    },
    async (accessToken, refreshToken, profile, done) => {
      console.log("Profile:", profile);
      try {
        const [user, created] = await db.User.findOrCreate({
          // Fixed the declaration
          where: { email: profile.emails[0].value, provider: profile.provider },
          defaults: {
            email:
              profile.emails && profile.emails[0]
                ? profile.emails[0].value
                : null,
            username: profile.displayName,
            provider: profile.provider,
            avatar:
              profile.photos && profile.photos[0]
                ? profile.photos[0].value
                : null,
          },
        });
        done(null, user); // Pass the entire user object
      } catch (error) {
        console.error("Database Error:", error); // Log the error for debugging
        done(error);
      }
    }
  )
);

app.get(
  "/auth/facebook",
  passport.authenticate("facebook", {
    scope: ["email"], // Adjusted scopes: only request necessary permissions
  })
);

app.get(
  "/auth/facebook/callback",
  passport.authenticate("facebook", { failureRedirect: "/" }),
  googleCallback
);

// Serialize và Deserialize
passport.serializeUser((user, done) => {
  done(null, user.id); // Lưu ID của người dùng vào session
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await db.User.findByPk(id, { raw: true });
    done(null, user); // Trả về đối tượng người dùng
  } catch (error) {
    done(error);
  }
});

// Khởi động server
const PORT = process.env.PORT || 8888;
const listener = app.listen(PORT, () => {
  console.log("Server is running on the Port " + listener.address().port);
});

// Khởi tạo routes
initRoutes(app);
