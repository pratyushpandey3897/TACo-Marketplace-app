// DisplayPage.tsx
import React, { useEffect, useState } from 'react';
import { fetchDataItems } from '../Services/DataFetch'; // Adjust the import path as necessary
import '../Style/display.css'; // Assume you have some CSS for styling

interface IDataItem {
  _id: string;
  DataName: string;
  Desc: string;
  owneraddress: string;
  EncryptedBytes: string;
  sampleData: string;
  Conditions: any;
}

const DisplayPage: React.FC = () => {
  const [dataItems, setDataItems] = useState<IDataItem[]>([]);

  useEffect(() => {
    const getData = async () => {
      const items = await fetchDataItems();
      setDataItems(items);
    };

    getData();
  }, []);

  const handleBuy = (itemId: string) => {
    console.log(`Buying item with ID: ${itemId}`);
    // Implement your buying logic here, e.g., redirect to a payment page
  };

  return (
    <div className="card-container">
      {dataItems.map((item: any) => (
        <div key={item._id} className="card">
          <h3>{item.DataName}</h3>
          <p>{item.Desc}</p>
          {/* Display other item details as needed */}
          <button onClick={() => handleBuy(item._id)}>Buy</button>
        </div>
      ))}
    </div>
  );
};

export default DisplayPage;
