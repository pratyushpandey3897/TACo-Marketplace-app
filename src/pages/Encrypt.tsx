import React, { useState, useContext } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { Buffer } from 'buffer';
import { saveDataItem } from '../Services/AddItem'; // Adjust the import path as necessary
import { ThresholdMessageKit,conditions } from '@nucypher/taco';
import { AccountContext } from "../App";
import { toast } from 'react-toastify';

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
  const [plaintext, setPlaintext] = useState("plaintext");
  const {currentAccount} = useContext(AccountContext);
  const onClickEncrypt = () => {
    encrypt(plaintext);
  };

  const onClickPublish = async () => {
    if (!encryptedMessage) {
      console.error("No encrypted message available for publishing.");
      return;
    }

    // Assuming the `encrypt` function updates `encryptedMessage` with the latest encryption result
    const encodedCiphertext = Buffer.from(encryptedMessage.toBytes()).toString(
      "base64"
    );

    try {
      if (currentAccount === null || currentAccount === "") {
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
        Step 2 - Set conditions and Encrypt a message
      </h1>
      <form className="flex flex-col space-y-4 mx-auto lg:w-3/4 bg-white p-5 rounded shadow-lg">
        <label className="flex flex-col">
          <h2>Enter Plaintext</h2>
          <input
            type="text"
            value={plaintext}
            onChange={(e) => setPlaintext(e.currentTarget.value)}
            className="border p-2 rounded"
            placeholder="Enter your plaintext message here"
          />
        </label>
        <button
          type="button" // Change the type to "button"
          onClick={onClickEncrypt}
          disabled={!enabled}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Encrypt
        </button>
        {EncryptedMessageContent()}
      </form>
    </>
  );
};
