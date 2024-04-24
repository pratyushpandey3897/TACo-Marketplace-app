import { ThresholdMessageKit } from '@nucypher/taco';
import React, { useState } from 'react';
import { Buffer } from 'buffer';
import { toast } from 'react-toastify';

interface Props {
  enabled: boolean;
  decrypt: (encryptedMessage: ThresholdMessageKit, walletId?: string, appId?: number, currentCodeHash?: string) => Promise<void>;
  decryptedMessage?: string | undefined;
  decryptionErrors: string[];
  encryptedMessage: string;
  audit: boolean;
  onEncryptedMessageChange: (newMessage: string) => void;
 }

export const Decrypt = ({
  decrypt,
  audit,
  decryptedMessage,
  decryptionErrors,
  enabled,
  encryptedMessage,
  onEncryptedMessageChange,
}: Props) => {
  // const [encryptedMessage, setEncryptedMessage] = useState('');
  const [appId, setAppId] = useState<string>("");
  const [codeHash, setCodeHash] = useState<string>("");
  if (!enabled) {
    return <></>;
  }

  const onDecrypt = async () => {
    console.log("called decrypt")
    if (!encryptedMessage) {
      return;
    }
    const mkBytes = Buffer.from(encryptedMessage, "base64");
    const mk = ThresholdMessageKit.fromBytes(mkBytes);
    console.log(mk)
    if (audit) {
      if (!appId || !codeHash) {
        console.log("App ID and Code Hash are required for audit mode");
        toast.error("App ID and Code Hash are required for audit mode", {
          position: "top-center",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        return;
      }
      // Fetch the hashedCode from the API
    const response = await fetch("http://localhost:5001/api/hash", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputString: appId }),
    });
    const data = await response.json();
    const hashedCode = data.hash;
    console.log("Received Hash:", hashedCode);
      decrypt(mk, appId, parseInt(appId), "0x"+hashedCode);
      return;
    } else decrypt(mk);
  };

  const DecryptedMessage = () => {
    if (!decryptedMessage) {
      return <></>;
    }
    return (
      <>
        <h3>Decrypted Message:</h3>
        <p>{decryptedMessage}</p>
      </>
    );
  };

  const DecryptionErrors = () => {
    if (decryptionErrors.length === 0) {
      return null;
    }

    return (
      <div>
        <h2>Decryption Errors</h2>
        <p>Not enough decryption shares to decrypt the message.</p>
        <p>Some Ursulas have failed with errors:</p>
        <ul>
          {decryptionErrors.map((error, index) => (
            <li key={index}>{error}</li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="flex flex-col space-y-4 mx-auto lg:w-3/4 bg-white p-5 rounded shadow-lg">
      <label className="flex flex-col">
        <p>Enter the encrypted message to decrypt</p>
        <input
          type="text"
          value={encryptedMessage}
          placeholder="Enter encrypted message"
          onChange={(e) => onEncryptedMessageChange(e.currentTarget.value)} // Use the passed function to handle the change
          className="border p-2 rounded"
        />
      </label>
      {audit && (
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
            <h2>Code File</h2>
            <input
              type="text"
              value={codeHash}
              onChange={(e) => setCodeHash(e.target.value)}
              className="border p-2 rounded"
            />
          </label>
        </>
      )}
      <button
        onClick={onDecrypt}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Decrypt
      </button>
      {DecryptedMessage()}
      {DecryptionErrors()}
    </div>
  );
};
