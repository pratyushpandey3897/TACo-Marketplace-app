// dataService.ts
import axios from 'axios';

// Adjusted interface to match the MongoDB schema
interface DataItem {
  DataName: string; // Changed from dataName to DataName
  Desc: string; // Changed from dataDescription to Desc
  owneraddress: string; // Matched the case exactly as expected by MongoDB schema
  EncryptedBytes: string; // Changed from encryptedBytes to EncryptedBytes
  sampleData: string; // Changed from sampleDataUrl to sampleData
  Condition: string; // Changed from condition to Condition, adjust the type as necessary
}

const API_BASE_URL = 'http://localhost:5001/api/addItem'; // Your API's base URL

export const saveDataItem = async (dataItem: DataItem): Promise<DataItem> => {
  try {
    const response = await axios.post(API_BASE_URL, dataItem);
    return response.data;
  } catch (error) {
    console.error('Error in saving data item:', error);
    throw error;
  }
};
