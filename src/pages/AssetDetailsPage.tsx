// AssetDetailsPage.tsx
import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import Web3 from 'web3'; 
import { AccountContext } from '../App';
import { toast } from 'react-toastify';
interface AssetDetailsPageProps {
 // Define any props if needed
}

interface Asset {
    _id: string;
    DataName: string;
    Desc: string;
    ownerAddress: string;
    EncryptedBytes: string;
    sampleData: string;
    Conditions: string;
    __v: number;
    // Include other properties as needed
}
const AssetDetailsPage: React.FC<AssetDetailsPageProps> = () => {
 const { id } = useParams(); // Get the asset ID from the URL
 const [asset, setAsset] = useState<Asset | null>(null); // State to hold the asset details
 const [appId, setAppId] = useState('');
 const [codeHash, setCodeHash] = useState('');
 const { currentAccount } = useContext(AccountContext);
 const [nftAddress, setNftAddress] = useState('');
 const [checkResults, setCheckResults] = useState({ nftBalance: false, appCertified: false });
 


 useEffect(() => {
    // Fetch the asset details using the ID
    const mockAsset = {
        "_id": "65f3f09aea9127151e84dc2c",
        "DataName": "dasdasd",
        "Desc": "asdasdas",
        "ownerAddress": "owner's address here",
        "EncryptedBytes": "VE1LaQABAACSk8QwtJ+gz/nVLela5ZXA9IpxhmAbzkvWDtewKdW7ctGVwdMtR/vF9bpR/y1XVjWZztinxGCs/mj8AShoJGZUiLDfzvN/NJdoZl+E1jlsXw8gOQNYjnzPmn35V+4G4r3gyuMkyzkLqAX2UzNPFMVG0aelxakskzyTgN+yUtAw9qp2Z3uPp2jL/DYEHMrxNrCXkRjCI97EHRlgi+A0+vEoKP/Z0g5jwaP9Pac9Uq7UsxEFuyR4kpLEMKpJbA0RVhJcnVqUWS21REip+hWz2FupKDdTqJelgKIEnrVUqH6tIJpSZPxueVACR9oCRnsiY29uZGl0aW9uIjp7ImNvbmRpdGlvblR5cGUiOiJjb21wb3VuZCIsIm9wZXJhbmRzIjpbeyJjaGFpbiI6ODAwMDEsImNvbmRpdGlvblR5cGUiOiJjb250cmFjdCIsImNvbnRyYWN0QWRkcmVzcyI6IjB4NDY2Q2I1Nzc3OTlDMzllRDZDMzM1MDkyMDVhMTEyRjRFNTE3MDEyNSIsIm1ldGhvZCI6ImJhbGFuY2VPZiIsInBhcmFtZXRlcnMiOlsiOnVzZXJBZGRyZXNzIl0sInJldHVyblZhbHVlVGVzdCI6eyJjb21wYXJhdG9yIjoiPj0iLCJ2YWx1ZSI6MX0sInN0YW5kYXJkQ29udHJhY3RUeXBlIjoiRVJDNzIxIn0seyJjaGFpbiI6ODAwMDEsImNvbmRpdGlvblR5cGUiOiJjb250cmFjdCIsImNvbnRyYWN0QWRkcmVzcyI6IjB4NDY2Q2I1Nzc3OTlDMzllRDZDMzM1MDkyMDVhMTEyRjRFNTE3MDEyNSIsIm1ldGhvZCI6ImJhbGFuY2VPZiIsInBhcmFtZXRlcnMiOlsiOnVzZXJBZGRyZXNzIl0sInJldHVyblZhbHVlVGVzdCI6eyJjb21wYXJhdG9yIjoiPj0iLCJ2YWx1ZSI6LTIwMDAwMDAwMDAwMDAwMDAwMDB9LCJzdGFuZGFyZENvbnRyYWN0VHlwZSI6IkVSQzIwIn1dLCJvcGVyYXRvciI6ImFuZCJ9LCJ2ZXJzaW9uIjoiMS4wLjAifcRBquYoSDXGCWBbeNJq8ApEIV6eVTuU+02XgZly7DQZz4A6fIk/rIGtzsMIy7zeCpXmOQA+Luv5jEEYPWWSmxWoZhw=",
        "sampleData": "asdasdasd",
        "Conditions": "{\"conditionType\":\"compound\",\"operator\":\"and\",\"operands\":[{\"conditionType\":\"contract\",\"chain\":80001,\"method\":\"balanceOf\",\"parameters\":[\":userAddress\"],\"returnValueTest\":{\"comparator\":\">=\",\"value\":1},\"contractAddress\":\"0x466Cb577799C39eD6C33509205a112F4E5170125\",\"standardContractType\":\"ERC721\"},{\"conditionType\":\"contract\",\"chain\":80001,\"method\":\"balanceOf\",\"parameters\":[\":userAddress\"],\"returnValueTest\":{\"comparator\":\">=\",\"value\":-2000000000000000000},\"contractAddress\":\"0x466Cb577799C39eD6C33509205a112F4E5170125\",\"standardContractType\":\"ERC20\"}]}",
        "__v": 0
     };
    
     // Set the mock asset data to the state
     setAsset(mockAsset);

    //  [todo]
    // fetch(`yourApiUrl/${id}`)
    //   .then(response => response.json())
    //   .then(data => setAsset(data))
    //   .catch(error => console.error('Error fetching asset details:', error));
 }, [id]); // Depend on the ID to refetch if it changes

//  if (!asset) {
//     return <div>Loading...</div>; // Or a loading spinner
//  }

const handleCheckSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!currentAccount) {
        console.error('Current account is not set.');
        return;
    }

    const contractAddress = '0x88207839a5a23ded370274ff0f7f96c331c55737'; //audti contract
    // Replace 'yourContractABI' with the actual contract ABI
    const contractABI = [
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "walletId",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "appId",
                    "type": "uint256"
                },
                {
                    "internalType": "bytes32",
                    "name": "appCodeHash",
                    "type": "bytes32"
                }
            ],
            "name": "registerApp",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "walletId",
                    "type": "address"
                }
            ],
            "name": "revokeCertification",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "walletId",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "appId",
                    "type": "uint256"
                },
                {
                    "internalType": "bytes32",
                    "name": "currentCodeHash",
                    "type": "bytes32"
                }
            ],
            "name": "isAppCertified",
            "outputs": [
                {
                    "internalType": "bool",
                    "name": "",
                    "type": "bool"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                }
            ],
            "name": "registry",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "applicationId",
                    "type": "uint256"
                },
                {
                    "internalType": "bytes32",
                    "name": "codeHash",
                    "type": "bytes32"
                },
                {
                    "internalType": "bool",
                    "name": "isCertified",
                    "type": "bool"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        }
    ]
    const web3 = new Web3(window.ethereum);
    // Create contract instance
    const contract = new web3.eth.Contract(contractABI, contractAddress);
    
    // Check NFT balance
    const nftBalance = await web3.eth.getBalance(nftAddress);
    const hasNft = nftBalance > 0; // Assuming 1 NFT is represented by a non-zero balance

    // Check app certification
    const appCertifiedPromise = contract.methods.isAppCertified(currentAccount, appId, codeHash).call();
    const appCertified = await appCertifiedPromise.then(result => Boolean(result));
    console.log('App certified:', appCertified);
    // Update results
    setCheckResults({ nftBalance: hasNft, appCertified });
};


const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    // Assuming you have a way to get the connected wallet address
    // const walletAddress = '0xYourConnectedWalletAddress';
    if (!currentAccount) {
        console.error('Current account is not set.');
        return; // Exit the function if currentAccount is null
    }

    // Replace 'yourContractAddress' with the actual contract address
    const contractAddress = '0x88207839a5a23ded370274ff0f7f96c331c55737';
    // Replace 'yourContractABI' with the actual contract ABI
    const contractABI = [
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "walletId",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "appId",
                    "type": "uint256"
                },
                {
                    "internalType": "bytes32",
                    "name": "appCodeHash",
                    "type": "bytes32"
                }
            ],
            "name": "registerApp",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "walletId",
                    "type": "address"
                }
            ],
            "name": "revokeCertification",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "walletId",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "appId",
                    "type": "uint256"
                },
                {
                    "internalType": "bytes32",
                    "name": "currentCodeHash",
                    "type": "bytes32"
                }
            ],
            "name": "isAppCertified",
            "outputs": [
                {
                    "internalType": "bool",
                    "name": "",
                    "type": "bool"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                }
            ],
            "name": "registry",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "applicationId",
                    "type": "uint256"
                },
                {
                    "internalType": "bytes32",
                    "name": "codeHash",
                    "type": "bytes32"
                },
                {
                    "internalType": "bool",
                    "name": "isCertified",
                    "type": "bool"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        }
    ]

    // Initialize web3 or ethers instance
    const web3 = new Web3(window.ethereum); // If you're using Web3.js

    // Create contract instance
    const contract = new web3.eth.Contract(contractABI, contractAddress);

    const result = await contract.methods.registerApp(currentAccount, appId, codeHash).send({ from: currentAccount });
    console.log(result);
    toast.success(`Access granted for App ID: ${appId}`, {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        style: {
            width: 'auto', // Adjust the width as needed
            maxWidth: '10%', // Set a maximum width to prevent it from covering the entire screen
        },
    });
 };



 return (
   <div className="rounded-md h-full overflow-y-scroll">
     <div className="flex justify-between items-center p-5">
       <h1 className="font-light text-xl">
         Asset Details Page for ID: {asset?._id}
       </h1>
     </div>

     <div className="bg-white p-5 rounded shadow-lg mx-auto lg:w-3/4">
       {asset && (
         <div>
           <h2>{asset.DataName}</h2>
           <p>{asset.Desc}</p>
           <p>Owner Address: {asset.ownerAddress}</p>
           {/* Display other asset details as needed */}
         </div>
       )}
     </div>

     <h2 className="text-xl p-5 text-center">Check Access</h2>
     <form
       className="flex flex-col space-y-4 mx-auto lg:w-3/4 bg-white p-5 rounded shadow-lg"
       onSubmit={handleCheckSubmit}
     >
       {checkResults.appCertified ? (
         <span className="bg-green-500 text-white font-bold py-2 rounded-full mx-auto">
           Access Granted
         </span>
       ) : (
         <span className="bg-red-500 text-white font-bold py-2 rounded-full mx-auto">
           Access conditions not satisfied
         </span>
       )}
       <label className="flex flex-col">
         <h2>NFT Address</h2>
         <input
           type="text"
           value={nftAddress}
           onChange={(e) => setNftAddress(e.target.value)}
           className="border p-2 rounded"
         />
       </label>
       <label className="flex flex-col">
         <h2>App ID</h2>
         <input
           type="text"
           value={appId}
           onChange={(e) => setAppId(e.target.value)}
           className="border p-2 rounded"
         />
       </label>
       <label className="flex flex-col">
         <h2>Code Hash</h2>
         <input
           type="text"
           value={codeHash}
           onChange={(e) => setCodeHash(e.target.value)}
           className="border p-2 rounded"
         />
       </label>
       <button
         type="submit"
         className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
       >
         Validate Access Conditions
       </button>

     </form>
     <h2 className="text-xl p-5 text-center">Smart Contract Audit</h2>
     <form
       className="flex flex-col space-y-4 mx-auto lg:w-3/4 bg-white p-5 rounded shadow-lg"
       onSubmit={handleSubmit}
     >
       <label className="flex flex-col">
         <h2>App ID</h2>
         <input
           type="text"
           value={appId}
           onChange={(e) => setAppId(e.target.value)}
           className="border p-2 rounded"
         />
       </label>
       <label className="flex flex-col">
         <h2>Code Hash</h2>
         <input
           type="text"
           value={codeHash}
           onChange={(e) => setCodeHash(e.target.value)}
           className="border p-2 rounded"
         />
       </label>
       <button
         type="submit"
         className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
       >
         Get Audited
       </button>
     </form>
   </div>
 );
};

export default AssetDetailsPage