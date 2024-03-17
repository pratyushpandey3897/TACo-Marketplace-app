// src/pages/LandingPage.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';


interface DataItem {
  _id: string;
  DataName: string;
  Desc: string;
  owneraddress: string;
  EncryptedBytes: string;
  sampleData: string;
  Conditions: string;
  __v: number;
 }

const LandingPage: React.FC = () => {
  const [dataItems, setDataItems] = useState<DataItem[]>([]);
  const navigate = useNavigate();
 useEffect(() => {
    // Replace 'yourApiUrl' with the actual URL of your dataItems API
    fetch('http://localhost:5001/api/dataItems')
      .then(response => response.json())
      .then(data => setDataItems(data.slice(0, 10))) // Get top 10 items
      .catch(error => console.error('Error fetching data:', error));
 }, []);

 const handleCardClick = (item: DataItem) => {
  // Navigate to a new page, passing the item's _id as a parameter
  navigate(`/details/${item._id}`);
};

  return (
    <div>
      {dataItems.map(item => (
        <div key={item._id} className="card" onClick={() => handleCardClick(item)}>
          <h3>{item.DataName}</h3>
          <p>{item.Desc}</p>
        </div>
      ))}
    </div>
  );
};

export default LandingPage;
