// src/pages/SubmitCodeForAuditPage.tsx
import React, { useState } from "react";
import { useContext } from "react";
import { AccountContext } from "../App";
import { toast } from "react-toastify";
import Web3 from "web3";
import auditContractJsonAbi from "../contracts/CertificationRegistry.json";

const SubmitCodeForAuditPage: React.FC = () => {
  const [appId, setAppId] = useState("");
  const [certificationId, setCertificationId] = useState<string | null>(null);
  const [codeHash, setCodeHash] = useState("");
  const { currentAccount } = useContext(AccountContext);

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

        toast.success("Code Hashed Successfully", {
          position: "top-center",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });

        const web3 = new Web3(window.ethereum);
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

          generateCertificationId(currentAccount, hashedCode)
            .then((certificationId) => {
              console.log(certificationId);
              setCertificationId(certificationId);
            })
            .catch((error) => {
              console.error("Error generating certification ID:", error);
            });
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

  const generateCertificationId = async (
    walletId: string,
    hashedCode: string
  ): Promise<string> => {
    // Combine wallet ID, hashed code, and current time
    const dataToHash = `${walletId}-${hashedCode}-${new Date().getTime()}`;

    // Use the API to hash the combined data
    const finalHash = await getHashFromAPI(dataToHash);

    return finalHash;
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
      <h2 className="text-xl p-5 text-center">Submit Code For Audit</h2>
      <form
        className="flex flex-col space-y-4 mx-auto lg:w-3/4 bg-white p-5 rounded shadow-lg"
        onSubmit={handleAuditSubmit}
      >
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
                  if (event.target && typeof event.target.result === "string") {
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
 className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-1/4 mx-auto"
>
 Get Audited
</button>
      </form>
      {/* Display results here */}
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        {appId && (
          <div className="bg-white p-8 rounded shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Audit Results</h2>
            <div className="flex flex-col items-center">
              <p className="text-xl font-semibold mb-2">
                App ID: <span className="text-blue-500">{appId}</span>
              </p>
              <p className="text-xl font-semibold mb-2">
                Wallet User ID:{" "}
                <span className="text-blue-500">{currentAccount}</span>
              </p>
              <p className="text-lg mb-4">
                This app code is audited and is certified to be non-malicious.
              </p>
              <div className="flex items-center justify-center">
                <img
                  src="audited.png"
                  alt="Certification Barcode"
                  className="w-48 h-auto mb-4"
                />
                <p className="text-lg ml-4">
                  Certification ID:{" "}
                  <span className="text-blue-500">{certificationId}</span>
                </p>
              </div>
              <p className="text-lg mb-4">
                Certified Date:{" "}
                <span className="text-blue-500">
                  {new Date().toLocaleDateString()}
                </span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubmitCodeForAuditPage;
