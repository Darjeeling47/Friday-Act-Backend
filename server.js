const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const connectDB = require("./utils/db");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const { xss } = require("express-xss-sanitizer");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
const cors = require("cors");

// Load env variables
dotenv.config({ path: "./config/config.env" });

connectDB();

// Route files
const router = require('./router');

const app = express();

// Body parser
app.use(bodyParser.json({ limit: "5mb" }));
app.use(
  bodyParser.urlencoded({
    limit: "5mb",
    extended: true,
    parameterLimit: 1000,
  })
);

// Cookie parser
app.use(cookieParser());

// Cookie parser
app.use(cookieParser());

// Securities
app.use(helmet());
app.use(xss());
app.use(hpp());
app.use(cors());

// Set up rate limiter
const allowlist = [];
const limiter = rateLimit({
  windowMS: 10 * 60 * 1000, // in milliseconds
  max: 1000,
  skip: (req, res) => allowlist.includes(req.ip),
});
app.use(limiter);

// Mount router
app.use("/", router)

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(
    "Server is running in",
    process.env.NODE_ENV,
    "on" + process.env.HOST + ":" + PORT
  )
);

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});