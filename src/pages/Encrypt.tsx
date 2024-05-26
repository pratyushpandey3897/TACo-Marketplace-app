import React, { useState, useContext,ChangeEvent } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { Buffer } from 'buffer';
import { saveDataItem } from '../Services/AddItem'; // Adjust the import path as necessary
import { ThresholdMessageKit,conditions } from '@nucypher/taco';
import { AccountContext } from "../App";
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

interface Props {
  enabled: boolean;
  encryptedMessage?: ThresholdMessageKit;
  encrypt: (value: string) => void;
  // New props
  DataName: string;
  Condition:string;
  Desc: string;
  sampleData: string;
}

export const Encrypt = ({
  encrypt,
  encryptedMessage,
  enabled,
  DataName,
  Desc,
  sampleData,
  Condition,
}: Props) => {
  const [file, setFile] = useState<File | null>(null);
  const {currentAccount} = useContext(AccountContext);
  const navigate = useNavigate();
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    setFile(file);
    if (file) {
      console.log("File selected:", file.name);
    } else {
      console.error("No file selected");
    }
  };

  const onClickEncrypt = () => {
    if (file) {
      console.log("File is not null, proceeding with reading file.");
      const reader = new FileReader();

      reader.onloadstart = () => {
        console.log("File reading started");
      };

      reader.onload = (e: ProgressEvent<FileReader>) => {
        const text = e.target?.result as string;
        console.log("File content:", text); // Log file content
        if (text) {
          encrypt(text); // Encrypt the file content read as text
        } else {
          console.error("File content is empty or could not be read");
        }
      };

      reader.onloadend = () => {
        console.log("File reading finished");
      };

      reader.onerror = (error) => {
        console.error("Error reading file:", error);
      };

      reader.readAsText(file);
    } else {
      console.error("No file selected");
    }
  };
  const onClickPublish = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!encryptedMessage) {
      console.error("No encrypted message available for publishing.");
      toast.error("No encrypted message available.");
      return;
    }

    // Assuming the `encrypt` function updates `encryptedMessage` with the latest encryption result
    const encodedCiphertext = Buffer.from(encryptedMessage.toBytes()).toString(
      "base64"
    );

    try {
      if (currentAccount === null || currentAccount === "") {
        toast.error("Wallet not connected");
        return;
      }
      await saveDataItem({
        DataName,
        Desc,
        owneraddress: currentAccount, // You need to provide the logic to fetch this
        EncryptedBytes: encodedCiphertext,
        sampleData,
        Condition, // Adjust based on actual data or pass as prop if needed
      });
      console.log("Data item saved successfully!");
      toast.success("Asset Published", {
        position: "top-center",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      navigate('/');
    } catch (error) {
      console.error("Failed to save data item:", error);
      alert("Error saving data item.");
      toast.error("Error in Publishing the asset", {
        position: "top-center",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  const EncryptedMessageContent = () => {
    if (!encryptedMessage) {
      return null;
    }

    const encodedCiphertext = Buffer.from(encryptedMessage.toBytes()).toString(
      "base64"
    );

    return (
      <form className="flex flex-col space-y-4 mx-auto lg:w-3/4 bg-white p-5 rounded shadow-lg">
        <label className="flex flex-col">
          <h2>Encrypted Data URL</h2>
          <pre className="ciphertext">{encodedCiphertext}</pre>
          <CopyToClipboard text={encodedCiphertext}>
            <button
              type="button"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Copy to clipboard
            </button>
          </CopyToClipboard>
        </label>
        <button
          onClick={onClickPublish}
          disabled={!enabled}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Publish Data Item
        </button>
      </form>
    );
  };

  return (
    <>
      <h1 className="font-light text-xl p-5 text-center">
        Upload file
      </h1>
      <form className="flex flex-col space-y-4 mx-auto lg:w-3/4 bg-white p-5 rounded shadow-lg">
        <label className="flex flex-col">
          <h1>Encrypt and Publish Your Data</h1>
          <input type="file" onChange={handleFileChange} accept=".csv" />
          <button type="button" onClick={onClickEncrypt} disabled={!enabled}>
            Encrypt File
          </button>
          {EncryptedMessageContent()}
        </label>
  
      </form>
    </>
  );
};
