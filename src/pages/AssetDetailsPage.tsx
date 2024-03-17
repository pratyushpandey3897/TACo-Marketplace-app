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
    // Replace 'yourApiUrl' with the actual URL of your API
    fetch(`yourApiUrl/${id}`)
      .then(response => response.json())
      .then(data => setAsset(data))
      .catch(error => console.error('Error fetching asset details:', error));
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
    <div>
    <h1>Asset Details Page for ID: {id}</h1> {/* Add the title here */}
    {/* <h2>{asset.DataName}</h2>
    <p>{asset.Desc}</p> */}
    {/* Display other asset details as needed */}

    <form onSubmit={handleSubmit}>
        <label>
          App ID:
          <input type="text" value={appId} onChange={(e) => setAppId(e.target.value)} />
        </label>
        <label>
          Code Hash:
          <input type="text" value={codeHash} onChange={(e) => setCodeHash(e.target.value)} />
        </label>
        <button type="submit">Get Audited</button>
      </form>


    <h2>Check Conditions</h2>
      <form onSubmit={handleCheckSubmit}>
    <label>
        NFT Address:
        <input type="text" value={nftAddress} onChange={(e) => setNftAddress(e.target.value)} />
    </label>
    <label>
        App ID:
        <input type="text" value={appId} onChange={(e) => setAppId(e.target.value)} />
    </label>
    <label>
        Code Hash:
        <input type="text" value={codeHash} onChange={(e) => setCodeHash(e.target.value)} />
    </label>
    <button type="submit">Check Conditions</button>
</form>

<div >
    {checkResults.appCertified ? (
        <p>App is audited.</p>
    ) : (
        <p>Application needs audit.</p>
    )}
</div>
      
  </div>
 );
};

export default AssetDetailsPage