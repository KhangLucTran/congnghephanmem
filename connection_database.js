const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("nodejs", "root", "17072003", {
  host: "localhost",
  dialect: "mysql",
  logging: false,
});

const connectionDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

connectionDB();
