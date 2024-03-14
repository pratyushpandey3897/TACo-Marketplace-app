const mongoose = require('mongoose');

const DataItemSchema = new mongoose.Schema({
  DataName: {
    type: String,
    required: true
  },
  Desc: {
    type: String,
    required: true
  },
  owneraddress: {
    type: String,
    required: true
  },
  EncryptedBytes: {
    type: String,
    required: true
  },
  sampleData: {
    type: String,
    required: true
  },
  Conditions: { type: String, required: true }
});

const DataItem = mongoose.model('DataItem', DataItemSchema);

module.exports = DataItem;
