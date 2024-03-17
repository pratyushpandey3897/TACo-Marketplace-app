// dataService.ts
import axios from 'axios';

interface IDataItem {
  _id: string;
  DataName: string;
  Desc: string;
  owneraddress: string;
  EncryptedBytes: string;
  sampleData: string;
  Conditions: any; // Adjust based on the actual structure of your Conditions
}

// Fetch data items from the API
export const fetchDataItems = async (): Promise<IDataItem[]> => {
  try {
    const response = await axios.get('http://localhost:5001/api/dataItems');
    return response.data;
  } catch (error) {
    console.error('Error fetching data items:', error);
    return [];
  }
};
