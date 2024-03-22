// AssetDetailsPage.tsx
import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import Web3 from 'web3'; 
import { AccountContext } from '../App';
import { toast } from 'react-toastify';
import { Decrypt } from './Decrypt';
import { useEthers, Mumbai } from "@usedapp/core";
import { ethers } from 'ethers';
import { MoonLoader } from "react-spinners";
import {
  decrypt,
  getPorterUri,
  domains,
  ThresholdMessageKit,
} from '@nucypher/taco';
import { DEFAULT_DOMAIN, DEFAULT_RITUAL_ID } from './config';
import jsonABI from '../artifacts/NFTABI.json'
interface AssetDetailsPageProps {
 // Define any props if needed
}

interface Asset {
  _id: string;
  DataName: string;
  Desc: string;
  owneraddress: string;
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
 const [decryptedMessage, setDecryptedMessage] = useState<string>();
 const [decryptionErrors, setDecryptionErrors] = useState<string[]>([]);
 const [encryptedMessage, setEncryptedMessage] = useState<string>('');
 const [loading, setLoading] = useState(false);
 const [domain, setDomain] = useState<string>(DEFAULT_DOMAIN);
 const { activateBrowserWallet, deactivate, switchNetwork } =
    useEthers();
 
 const onEncryptedMessageChange = (newMessage: string) => {
  setEncryptedMessage(newMessage);
};

 useEffect(() => {
  // initialize();
  //   switchNetwork(Mumbai.chainId);
  // Fetch the asset details using the ID
  fetch(`http://localhost:5001/api/dataItems/${id}`)
     .then(response => response.json())
     .then(data => {
       setAsset(data); // Assuming 'setAsset' is the state update function for 'asset'
       if (data && data.EncryptedBytes) {
         setEncryptedMessage(data.EncryptedBytes);
         console.log('Encrypted message set:', data.EncryptedBytes); 
       }
     })
     .catch(error => {
       console.error('Error fetching asset details:', error);
     });
 }, [id]); // Depend on the ID to refetch if it changes

//  if (!asset) {
//     return <div>Loading...</div>; // Or a loading spinner
//  }


const handleCheckSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!currentAccount) {
      if (currentAccount === null || currentAccount === "")
                toast.error("Wallet not connected", {
                    position: "top-center",
                    autoClose: false,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
        console.error('Current account is not set.');
        return;
    }

    const contractAddressCertification = '0x88207839a5a23ded370274ff0f7f96c331c55737'; //audti contract
    // Replace 'yourContractABI' with the actual contract ABI
    const contractABICertification = [
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
    const contract = new web3.eth.Contract(contractABICertification, contractAddressCertification);
    var nftContract,hasNft;
    if (currentAccount && nftAddress) {
       nftContract= new web3.eth.Contract(jsonABI,nftAddress);
           // const nftBalance = await web3.eth.getBalance(nftAddress);
    const balance = await nftContract.methods.balanceOf(currentAccount).call();
        
    const numericBalance = Number(balance); // This ensures 'balance' is treated as a number
     hasNft = numericBalance > 0;
  }
   

    // Check NFT balance
 // If balance is m// Assuming 1 NFT is represented by a non-zero balance

    // Check app certification
    const appCertifiedPromise = contract.methods.isAppCertified(currentAccount, appId, codeHash).call();
    const appCertified = await appCertifiedPromise.then(result => Boolean(result));
    console.log('App certified:', appCertified,hasNft);
    // Update results
    setCheckResults({ nftBalance: hasNft?hasNft:false, appCertified });
};


const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    // Assuming you have a way to get the connected wallet address
    // const walletAddress = '0xYourConnectedWalletAddress';
    if (!currentAccount) {
      toast.error("Wallet not connected", {
        position: "top-center",
        autoClose: false,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
    });
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
    toast.success("Audit Process Done", {
      position: "top-center",
      autoClose: false,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
  });
 };

 const decryptMessage = async (encryptedMessage: ThresholdMessageKit) => {
  // if (!condition) {
  //   return;
  // }
  setLoading(true);
  setDecryptedMessage('');
  setDecryptionErrors([]);

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const decryptedMessage = await decrypt(
    provider,
    domain,
    encryptedMessage,
    getPorterUri(domain),
    provider.getSigner(),
  );

  setDecryptedMessage(new TextDecoder().decode(decryptedMessage));
  setLoading(false);
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
           <p>Owner Address: {asset.owneraddress}</p>
           {/* Display other asset details as needed */}
         </div>
       )}
     </div>

     <h2 className="text-xl p-5 text-center">Check Access</h2>
     <form
       className="flex flex-col space-y-4 mx-auto lg:w-3/4 bg-white p-5 rounded shadow-lg"
       onSubmit={handleCheckSubmit}
     >
       {checkResults.appCertified && checkResults.nftBalance? (
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
     <h2 className="text-xl p-5 text-center">Decrypt</h2>
     <div className="flex flex-col space-y-4 mx-auto lg:w-3/4 bg-white p-5 rounded shadow-lg">
       <label className="flex flex-col">
         <h2>TACo Domain</h2>
         <p>Must match the domain of your ritual</p>
         <select
           defaultValue={domain}
           onChange={(e) => setDomain(e.target.value)}
           className="border p-2 rounded"
         >
           {Object.values(domains).map((domain) => (
             <option value={domain} key={domain}>
               {domain}
             </option>
           ))}
         </select>
       </label>
     </div>
     <Decrypt
       enabled={!!encryptedMessage}
       decrypt={decryptMessage}
       decryptedMessage={decryptedMessage}
       decryptionErrors={decryptionErrors}
       encryptedMessage={encryptedMessage}
       onEncryptedMessageChange={onEncryptedMessageChange} // Pass the function to update the encryptedMessage state
     />
   </div>
 );
};

export default AssetDetailsPage