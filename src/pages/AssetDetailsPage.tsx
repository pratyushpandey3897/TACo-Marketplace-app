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
  initialize,
  decrypt,
  conditions,
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
  const [appId, setAppId] = useState("");
  const [codeHash, setCodeHash] = useState("");
  const { currentAccount } = useContext(AccountContext);
  const [checkResults, setCheckResults] = useState({
    nftBalance: false,
    appCertified: false,
  });
  const [decryptedMessage, setDecryptedMessage] = useState<string>();
  const [decryptionErrors, setDecryptionErrors] = useState<string[]>([]);
  const [encryptedMessage, setEncryptedMessage] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [domain, setDomain] = useState<string>(DEFAULT_DOMAIN);
  const { activateBrowserWallet, deactivate, switchNetwork } = useEthers();
  const [audit, setAudit] = useState<boolean>(false);
  const [conditionNFTAddress, setConditionNFTAddress] = useState<string>("");
  const [validAccess, setValidAccess] = useState<boolean>(false);

  const onEncryptedMessageChange = (newMessage: string) => {
    setEncryptedMessage(newMessage);
  };

  useEffect(() => {
    initialize();
    switchNetwork(Mumbai.chainId);
    // Fetch the asset details using the ID
    fetch(`http://localhost:5001/api/dataItems/${id}`)
       .then((response) => response.json())
       .then((data) => {
         setAsset(data); // Assuming 'setAsset' is the state update function for 'asset'
         if (data && data.Condition) {
           // Parse the Condition string into a JSON object
           const conditionJson = JSON.parse(data.Condition);
           // Extract the NFTAddress and Audit status
           const { NFTAddress, Audit } = conditionJson;
           // Set the nftAddress state
           setConditionNFTAddress(NFTAddress);
           // If Audit is true, set the audit state
           if (Audit) {
             setAudit(true);
           }
         }
         if (data && data.EncryptedBytes) {
           setEncryptedMessage(data.EncryptedBytes);
           console.log("Encrypted message set:", data.EncryptedBytes);
         }
       })
       .catch((error) => {
         console.error("Error fetching asset details:", error);
       });
   }, [id]);// Depend on the ID to refetch if it changes

  //  if (!asset) {
  //     return <div>Loading...</div>; // Or a loading spinner
  //  }

  const handleCheckSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!currentAccount) {
      if (currentAccount === null || currentAccount === "")
        toast.error("Wallet not connected", {
          position: "top-center",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      console.error("Current account is not set.");
      return;
    }

    toast.info("Checking Access Conditions", {
      position: "top-center",
      autoClose: 4000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
    const contractAddressCertification =
      "0x958aF0BBEe232dA9E48DA3D6499f3b9285Ac2cb4"; //audti contract
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
    ];
    const web3 = new Web3(window.ethereum);
    // Create contract instance
    const contract = new web3.eth.Contract(
      contractABICertification,
      contractAddressCertification
    );
    var nftContract, hasNft;
    if (currentAccount && conditionNFTAddress) {
      nftContract = new web3.eth.Contract(jsonABI, conditionNFTAddress);
      const balance = await nftContract.methods
         .balanceOf(currentAccount)
         .call();
     
      const numericBalance = Number(balance);
      console.log("number",numericBalance);
       // This ensures 'balance' is treated as a number
      hasNft = numericBalance > 0;
      console.log(hasNft);
     }
     
     var appCertified
     if (audit) {
      // Check app certification
      const appCertifiedPromise = contract.methods
         .isAppCertified(currentAccount, appId, codeHash)
         .call();
      appCertified = await appCertifiedPromise.then((result) =>
         Boolean(result)
      );
     
      // Additional logic that depends on appCertified can go here
     }
     
     // Determine valid access based on the presence of NFT and app certification
     if (hasNft !== undefined && appCertified !== undefined) {
      setValidAccess(hasNft && appCertified);
     } else if (hasNft !== undefined) {
      setValidAccess(hasNft);
     } else if (appCertified !== undefined) {
      setValidAccess(appCertified);
     }
     
     console.log("App certified:", appCertified, hasNft, "Valid Access:", validAccess);
     toast.success("Access Conditions Checked", {
      position: "top-center",
      autoClose: 4000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
     });
     
  };

  // const handleSubmit = async (event: React.FormEvent) => {
  //   event.preventDefault();
  //   // Assuming you have a way to get the connected wallet address
  //   // const walletAddress = '0xYourConnectedWalletAddress';
  //   if (!currentAccount) {
  //     toast.error("Wallet not connected", {
  //       position: "top-center",
  //       autoClose: 4000,
  //       hideProgressBar: false,
  //       closeOnClick: true,
  //       pauseOnHover: true,
  //       draggable: true,
  //     });
  //     console.error("Current account is not set.");
  //     return; // Exit the function if currentAccount is null
  //   }
  //   toast.info("Starting Audit Process", {
  //     position: "top-center",
  //     autoClose: 4000,
  //     hideProgressBar: false,
  //     closeOnClick: true,
  //     pauseOnHover: true,
  //     draggable: true,
  //   });

  //   // Replace 'yourContractAddress' with the actual contract address
  //   const contractAddress = "0x958aF0BBEe232dA9E48DA3D6499f3b9285Ac2cb4";
  //   // Replace 'yourContractABI' with the actual contract ABI
  //   const contractABI = [
  //     {
  //       "inputs": [
  //         {
  //           "internalType": "address",
  //           "name": "walletId",
  //           "type": "address"
  //         },
  //         {
  //           "internalType": "uint256",
  //           "name": "appId",
  //           "type": "uint256"
  //         },
  //         {
  //           "internalType": "bytes32",
  //           "name": "currentCodeHash",
  //           "type": "bytes32"
  //         }
  //       ],
  //       "name": "isAppCertified",
  //       "outputs": [
  //         {
  //           "internalType": "bool",
  //           "name": "",
  //           "type": "bool"
  //         }
  //       ],
  //       "stateMutability": "view",
  //       "type": "function"
  //     },
  //     {
  //       "inputs": [
  //         {
  //           "internalType": "address",
  //           "name": "walletId",
  //           "type": "address"
  //         },
  //         {
  //           "internalType": "uint256",
  //           "name": "appId",
  //           "type": "uint256"
  //         },
  //         {
  //           "internalType": "bytes32",
  //           "name": "appCodeHash",
  //           "type": "bytes32"
  //         }
  //       ],
  //       "name": "registerApp",
  //       "outputs": [],
  //       "stateMutability": "nonpayable",
  //       "type": "function"
  //     },
  //     {
  //       "inputs": [
  //         {
  //           "internalType": "address",
  //           "name": "",
  //           "type": "address"
  //         }
  //       ],
  //       "name": "registry",
  //       "outputs": [
  //         {
  //           "internalType": "uint256",
  //           "name": "applicationId",
  //           "type": "uint256"
  //         },
  //         {
  //           "internalType": "bytes32",
  //           "name": "codeHash",
  //           "type": "bytes32"
  //         },
  //         {
  //           "internalType": "bool",
  //           "name": "isCertified",
  //           "type": "bool"
  //         }
  //       ],
  //       "stateMutability": "view",
  //       "type": "function"
  //     },
  //     {
  //       "inputs": [
  //         {
  //           "internalType": "address",
  //           "name": "walletId",
  //           "type": "address"
  //         }
  //       ],
  //       "name": "revokeCertification",
  //       "outputs": [],
  //       "stateMutability": "nonpayable",
  //       "type": "function"
  //     }
  //   ];

  //   // Initialize web3 or ethers instance
  //   const web3 = new Web3(window.ethereum); // If you're using Web3.js

  //   // Create contract instance
  //   const contract = new web3.eth.Contract(contractABI, contractAddress);

  //   const result = await contract.methods
  //     .registerApp(currentAccount, appId, codeHash)
  //     .send({ from: currentAccount });
  //   console.log(result);
  //   toast.success("Audit Process Done", {
  //     position: "top-center",
  //     autoClose: 4000,
  //     hideProgressBar: false,
  //     closeOnClick: true,
  //     pauseOnHover: true,
  //     draggable: true,
  //   });
  // };

  
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!currentAccount) {
      toast.error("Wallet not connected", {
        position: "top-center",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return; // Exit the function if currentAccount is null
    }

    // Collect the user-provided code from the input (assuming you have an input for this)
    const userCode = codeHash; // Assuming 'codeHash' state is holding the user input

    toast.info("Hashing Code...", {
      position: "top-center",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });

    // Make API call to backend to get SHA256 hash
    fetch('http://localhost:3000/api/hash', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ inputString: userCode })
    })
    .then(response => response.json())
    .then(data => {
      const hashedCode = data.hash;
      console.log('Received Hash:', hashedCode);
      setCodeHash(hashedCode); // Update state with the hashed code

      // Here, you can proceed to use `hashedCode` for your contract call
      toast.success("Code Hashed Successfully", {
        position: "top-center",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      // Place to make the smart contract call with hashedCode
      // For now, this part is skipped as per your instruction
    })
    .catch(error => {
      console.error('Error hashing code:', error);
      toast.error("Error in hashing code", {
        position: "top-center",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    });
};

  
  const decryptMessage = async (
    encryptedMessage: ThresholdMessageKit,
    walletId?: string,
    appId?: number,
    currentCodeHash?: string
  ): Promise<void>  => {
    // if (!condition) {
    //   return;
    // }z
    setLoading(true);
    setDecryptedMessage("");
    setDecryptionErrors([]);
    
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    let customParameters:
      | Record<string, conditions.context.CustomContextParam>
      | undefined;
      if (currentAccount && audit && walletId && appId !== undefined && currentCodeHash) {
        customParameters = {
           ":walletId": currentAccount,
           ":appId": appId,
           ":currentCodeHash": currentCodeHash,
        };
        console.log(customParameters);
       } else {
        // Check for specific conditions and display toast errors accordingly
        if (!currentAccount || currentAccount === "") {
           toast.error("Current account is not set or is empty.", {
             position: "top-center",
             autoClose: 4000,
             hideProgressBar: false,
             closeOnClick: true,
             pauseOnHover: true,
             draggable: true,
           });
           
        }
        setLoading(false);
        return;
       }
    let decryptedMessage: Uint8Array;
    try {
      console.log("reached here")
      if (customParameters.appId) {
        console.log("inside decrypt")
        decryptedMessage = await decrypt(
          provider,
          domain,
          encryptedMessage,
          getPorterUri(domain),
          provider.getSigner(),
          customParameters
        );
      } else {
        console.log("entered")
        decryptedMessage = await decrypt(
          provider,
          domain,
          encryptedMessage,
          getPorterUri(domain),
          provider.getSigner()
        );
      }

      setDecryptedMessage(new TextDecoder().decode(decryptedMessage));
      setLoading(false);
      toast.success("Message Decrypted", {
        position: "top-center",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
     } catch (error) {
      console.error("Decryption error:", error);
      setLoading(false);
      toast.error("Threshold of responses not met; TACo decryption failed with errors", {
         position: "top-center",
         autoClose: 4000,
         hideProgressBar: false,
         closeOnClick: true,
         pauseOnHover: true,
         draggable: true,
      });
     }

    
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
          <div className="flex flex-col">
            <div className="mb-4">
              <h2 className="text-xl font-bold">{asset.DataName}</h2>
            </div>
            <div className="mb-4">
              <p>{asset.Desc}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">
                Owner Address: {asset.owneraddress}
              </p>
            </div>
            
          </div>
        )}
      </div>

      <h2 className="text-xl p-5 text-center">Check Access</h2>
      <form
        className="flex flex-col space-y-4 mx-auto lg:w-3/4 bg-white p-5 rounded shadow-lg"
        onSubmit={handleCheckSubmit}
      >
        {validAccess ? (
          <span className="bg-green-500 text-white font-bold py-2 rounded-full mx-auto">
            Access Granted
          </span>
        ) : (
          <span className="bg-red-500 text-white font-bold py-2 rounded-full mx-auto">
            Access conditions not satisfied
          </span>
        )}
        {conditionNFTAddress && (
          <label className="flex flex-col">
            <h2>NFT Address</h2>
            <input
              type="text"
              value={conditionNFTAddress}
              onChange={(e) => setConditionNFTAddress(e.target.value)}
              className="border p-2 rounded"
            />
          </label>
        )}
        {audit ? (
          <>
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
          </>
        ) : null}
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Validate Access Conditions
        </button>
      </form>
      
      {audit ? (
    <>
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
    </>
 ) : (
    <h2 className="text-xl p-5 text-center">Audit Not Needed</h2>
 )}
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
      {loading ? (
        <MoonLoader />
      ) : (
        <Decrypt
          enabled={!!encryptedMessage}
          decrypt={decryptMessage}
          audit={audit}
          decryptedMessage={decryptedMessage}
          decryptionErrors={decryptionErrors}
          encryptedMessage={encryptedMessage}
          onEncryptedMessageChange={onEncryptedMessageChange} // Pass the function to update the encryptedMessage state
        />
      )}
    </div>
  );
};

export default AssetDetailsPage