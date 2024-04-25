// AssetDetailsPage.tsx
import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import Web3 from "web3";
import { AccountContext } from "../App";
import { toast } from "react-toastify";
import { Decrypt } from "./Decrypt";
import { useEthers } from "@usedapp/core";
import auditContractJsonAbi from "../contracts/CertificationRegistry.json";
import { ethers } from "ethers";
import { MoonLoader } from "react-spinners";
import {
  initialize,
  decrypt,
  conditions,
  getPorterUri,
  domains,
  ThresholdMessageKit,
} from "@nucypher/taco";
import { DEFAULT_DOMAIN, DEFAULT_RITUAL_ID } from "./config";
import jsonABI from "../artifacts/NFTABI.json";
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
  const [hasAppId, setHasAppId] = useState<boolean>(true);

  const onEncryptedMessageChange = (newMessage: string) => {
    setEncryptedMessage(newMessage);
  };

  //
  const contractABI = useEffect(() => {
    initialize();
    switchNetwork(80002);
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
      "0xc7704363c8c16484F2cE06539d9B135146996a03"; //audti contract
    const web3 = new Web3(window.ethereum);
    // Create contract instance
    const contract = new web3.eth.Contract(
      auditContractJsonAbi.abi,
      contractAddressCertification
    );
    var nftContract, hasNft;
    if (currentAccount && conditionNFTAddress) {
      nftContract = new web3.eth.Contract(jsonABI, conditionNFTAddress);
      const balance = await nftContract.methods
        .balanceOf(currentAccount)
        .call();

      const numericBalance = Number(balance);
      console.log("number", numericBalance);
      // This ensures 'balance' is treated as a number
      hasNft = numericBalance > 0;
      console.log(hasNft);
    }

    var appCertified;
    if (audit) {
      //call code hash api
      const hashedCode = await getHashFromAPI(codeHash);

      // Check app certification
      const appCertifiedPromise = contract.methods
        .isAppCertified(currentAccount, appId, "0x" + hashedCode)
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

    console.log(
      "App certified:",
      appCertified,
      hasNft,
      "Valid Access:",
      validAccess
    );
    toast.success("Access Conditions Checked", {
      position: "top-center",
      autoClose: 4000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  const handleAuditSubmit = async (event: React.FormEvent) => {
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
    await fetch("http://localhost:5001/api/hash", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputString: userCode }),
    })
      .then(async (response) => {
        // Mark this function as async
        const data = await response.json(); // Use await here
        const hashedCode = data.hash;
        console.log("Received Hash:", hashedCode);
        //  setCodeHash(hashedCode); // Update state with the hashed code

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
        const web3 = new Web3(window.ethereum); // If you're using Web3.js
        const contractAddress = "0xc7704363c8c16484F2cE06539d9B135146996a03";
        const contract = new web3.eth.Contract(
          auditContractJsonAbi.abi,
          contractAddress
        );

        try {
          const result = await contract.methods
            .registerApp(currentAccount, "0x" + hashedCode)
            .send({ from: currentAccount });
          console.log(result);
          toast.success("Audit Process Done", {
            position: "top-center",
            autoClose: 4000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });

          const appIdResult = await contract.methods
            .getAppId(currentAccount, "0x" + hashedCode)
            .call();
          console.log(result);
          console.log(appIdResult);
          if (appIdResult) setAppId(appIdResult.toString());
        } catch (error) {
          console.error("Error in audit process:", error);
          toast.error("Error in audit process", {
            position: "top-center",
            autoClose: 4000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        }
      })
      .catch((error) => {
        console.error("Error hashing code:", error);
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
  ): Promise<void> => {
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
    console.log(
      currentAccount,
      audit,
      walletId,
      appId,
      currentCodeHash,
      "details"
    );
    if (
      currentAccount &&
      audit &&
      walletId &&
      appId !== undefined &&
      currentCodeHash
    ) {
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
      console.log("reached here");
      console.log(customParameters);
      if (customParameters) {
        console.log("inside decrypt");
        decryptedMessage = await decrypt(
          provider,
          domain,
          encryptedMessage,
          getPorterUri(domain),
          provider.getSigner(),
          customParameters
        );
      } else {
        console.log("entered");
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
      toast.error(
        "Threshold of responses not met; TACo decryption failed with errors",
        {
          position: "top-center",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        }
      );
    }
  };

  async function getHashFromAPI(userCode: string): Promise<string> {
    try {
      const response = await fetch("http://localhost:5001/api/hash", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputString: userCode }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch hash from API");
      }

      const data = await response.json();
      const hashedCode = data.hash;
      console.log("Received Hash:", hashedCode);
      return hashedCode;
    } catch (error) {
      console.error("Error hashing code:", error);
      throw error; // Rethrow the error to be handled by the caller
    }
  }

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

      <h2 className="text-xl p-5 text-center">Verify your audit status</h2>
      <form
        className="flex flex-col space-y-4 mx-auto lg:w-3/4 bg-white p-5 rounded shadow-lg"
        onSubmit={handleCheckSubmit}
      >
        <div className="flex flex-col">
          <label>
            <input
              type="radio"
              value="yes"
              checked={hasAppId}
              onChange={(e) => setHasAppId(e.target.value === "yes")}
            />
            Yes, I have an APP ID provided by the marketplace and believe my app
            is audited.
          </label>
          <label>
            <input
              type="radio"
              value="no"
              checked={!hasAppId}
              onChange={(e) => setHasAppId(e.target.value === "yes")}
            />
            No, I need to get app audited to get the APP ID.
          </label>
        </div>
        {hasAppId ? (
          <>
            {validAccess ? (
              <span className="bg-green-500 text-white font-bold py-2 rounded-full mx-auto">
                Code Already Audited
              </span>
            ) : (
              <span className="bg-red-500 text-white font-bold py-2 rounded-full mx-auto">
                Code Needs Audit
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
              <h2>Upload Code File</h2>
              <input
                type="file"
                accept=".txt"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    const file = e.target.files[0];
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      if (
                        event.target &&
                        typeof event.target.result === "string"
                      ) {
                        const fileContent = event.target.result;
                        setCodeHash(fileContent);
                        // Optionally, call your hash function here with trimmedContent
                      }
                    };
                    reader.readAsText(file);
                  }
                }}
                className="border p-2 rounded"
              />
            </label>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Validate Access Conditions
            </button>
          </>
        ) : (
          <p>You need to get app audited to get the APP ID.</p>
        )}
      </form>

      {!hasAppId ? (
        <>
          <h2 className="text-xl p-5 text-center">Submit Code For Audit</h2>
          <form
            className="flex flex-col space-y-4 mx-auto lg:w-3/4 bg-white p-5 rounded shadow-lg"
            onSubmit={handleAuditSubmit}
          >
            <label className="flex flex-col">
              <h2>App ID</h2>
              <div className="border p-2 rounded bg-gray-100">{appId}</div>
            </label>

            <label className="flex flex-col">
              <h2>Upload Code File</h2>
              <input
                type="file"
                accept=".txt"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    const file = e.target.files[0];
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      if (
                        event.target &&
                        typeof event.target.result === "string"
                      ) {
                        const fileContent = event.target.result;
                        setCodeHash(fileContent);
                        // Optionally, call your hash function here with trimmedContent
                      }
                    };
                    reader.readAsText(file);
                  }
                }}
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

export default AssetDetailsPage;
