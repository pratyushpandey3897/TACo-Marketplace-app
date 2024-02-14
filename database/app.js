const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();
const cors = require('cors');

const app = express();
const port = process.env.SERVER_PORT || 5001;

app.use(bodyParser.json());
app.use(cors());

// Define API routes


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
