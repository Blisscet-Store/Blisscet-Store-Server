const express = require("express"); // express
const cors = require("cors"); // localhost
const errHandler = require("./middlewears/errHandler"); // errH md
const pageNotFound = require("./middlewears/pageNotFound"); // PNF md
const { DBConnection } = require("./config/DBConnection"); // db config

// Init app
const server = express();
require("dotenv").config();

// middleWares
server.use(express.json());
server.use(cors());
server.use("/uploads", express.static("uploads"));

// Connecting to MongoDB
DBConnection();

// methods
server.use("/dashboard", require("./routes/dashBoard"));
server.use("/", require("./routes/mainPage"));

// Error 404 Not Found Page
server.use(pageNotFound);

// Error Handling MiddleWare
server.use(errHandler);

// server
const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`http://localhost:${port}/`);
});
