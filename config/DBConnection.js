const mongoose = require("mongoose");
require("dotenv").config();

const connectWithRetry = () => {
    mongoose
        .connect(
            `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@blisscet-store-db.bzanvai.mongodb.net/?retryWrites=true&w=majority&appName=Blisscet-Store-db&tls=true`,
            {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000,
            }
        )
        .then(() => console.log("MongoDB connected"))
        .catch((err) => {
            console.error("MongoDB connection error:", err);
            setTimeout(connectWithRetry, 5000);
        });
};

connectWithRetry();

mongoose.connection.on("error", (err) => {
    console.error("MongoDB connection lost:", err);
});
