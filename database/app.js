const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();
const cors = require('cors');
const crypto = require('crypto');
const multer = require('multer');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

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
// route for finding a particular data by Id
app.get('/api/dataItems/:id', async (req, res) => {
  try {
    const item = await DataItem.findById(req.params.id);
    if (item) {
      res.json(item);
    } else {
      res.status(404).json({ message: "Data item not found" });
    }
  } catch (error) {
    console.error("Error fetching data item:", error);
    res.status(500).json({ message: "Error fetching data item", error: error });
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
    Condition: req.body.Condition // Assuming Conditions is properly formatted JSON
  });
 
  try {
    console.log(newItem);
    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (error) {
    res.status(500).json({ message: "Error saving the data item", error: error });
  }
});
app.post('/api/hash', (req, res) => {
  const { inputString } = req.body;
  if (!inputString) {
      return res.status(400).send('Input string is required');
  }
  const hash = crypto.createHash('sha256').update(inputString).digest('hex');
  console.log("hash",hash)
  res.send({ hash });
});
// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
      cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Endpoint to upload and process model
app.post('/upload-model', upload.fields([
  { name: 'model', maxCount: 1 },
  { name: 'requirements', maxCount: 1 },
  { name: 'data', maxCount: 1 }
]), (req, res) => {
  const modelFile = req.files['model'][0];
  const requirementsFile = req.files['requirements'][0];
  const dataFile = req.files['data'][0];

  buildAndRunDockerContainer(modelFile, requirementsFile, dataFile, res);
});

function buildAndRunDockerContainer(modelFile, requirementsFile, dataFile, res) {
  const dockerImageName = `usermodel-${Date.now()}`;
  const modelFilename = path.basename(modelFile.path);  // Extract filename from full path
  const requirementsFilePath = requirementsFile.path;
  const dataFilePath = dataFile.path;

  // Generate a Dockerfile
  const dockerfileContent = `
FROM python:3.8-slim
WORKDIR /app
COPY ${path.basename(requirementsFilePath)} /app/
RUN pip install --no-cache-dir -r ${path.basename(requirementsFilePath)}
COPY ${modelFilename} /app/model.py  // Use extracted filename
COPY ${path.basename(dataFilePath)} /app/data.csv
CMD ["python", "model.py", "data.csv"]
  `;
  fs.writeFileSync('Dockerfile', dockerfileContent);

  // Build Docker image
  exec(`docker build -t ${dockerImageName} .`, (error, stdout, stderr) => {
      if (error) {
          console.error(`exec error: ${error}`);
          return res.status(500).send({ message: 'Failed to build Docker image', details: stderr });
      }

      // Run Docker container
      exec(`docker run --rm ${dockerImageName}`, (error, stdout, stderr) => {
          // Optionally, clean up Docker image after execution
          exec(`docker rmi ${dockerImageName}`);
          if (error) {
              console.error(`exec error: ${error}`);
              return res.status(500).send({ message: 'Failed to run Docker container', details: stderr });
          }

          res.send({ results: stdout });
      });
  });
}

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
