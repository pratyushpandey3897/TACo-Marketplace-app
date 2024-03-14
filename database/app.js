const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();
const cors = require('cors');
require('./configs/database.config.js');
const DataItem = require('./models/DataItem'); // Make sure the path is correct

const app = express();
const port = process.env.SERVER_PORT || 5001;

app.use(bodyParser.json());
app.use(cors());

// API route to get all data items
app.get('/api/dataItems', async (req, res) => {
  try {
    const items = await DataItem.find();
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: "Error fetching data items", error: error });
  }
});

// API route to add a new data item
app.post('/api/addItem', async (req, res) => {
  console.log(req.body);
  const newItem = new DataItem({
    DataName: req.body.DataName,
    Desc: req.body.Desc,
    owneraddress: req.body.owneraddress,
    EncryptedBytes: req.body.EncryptedBytes,
    sampleData: req.body.sampleData,
    Conditions: req.body.Condition // Assuming Conditions is properly formatted JSON
  });

  try {
    console.log(newItem);
    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (error) {
    res.status(500).json({ message: "Error saving the data item", error: error });
  }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
