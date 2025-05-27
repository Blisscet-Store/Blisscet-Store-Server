const mongoose = require("mongoose")
require("dotenv").config()

module.exports = () => {
    mongoose
        .connect(`mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@blisscet-store-db.bzanvai.mongodb.net/?retryWrites=true&w=majority&appName=Blisscet-Store-db&tls=true`)
        .then(() => console.log("Connected to MongoDB"))
        .catch((error) => console.log("Connection Faild to MongoDB \n", error))
}