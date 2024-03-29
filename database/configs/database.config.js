const mongoose = require("mongoose");
require('dotenv').config();

console.log(process.env.MONGODB_URI);
// Connect to the MongoDB database
mongoose
    .connect(process.env.MONGODB_URI, {})
    .then(() => {
        console.log("Connected to MongoDB");
    })
    .catch((err) => {
        console.error("Error connecting to MongoDB:", err);
    });

// Export the Mongoose object to use in other parts of your application
module.exports = mongoose;
