import { ThresholdMessageKit } from '@nucypher/taco';
import React, { useState } from 'react';
import { Buffer } from 'buffer';

interface Props {
  enabled: boolean;
  decrypt: (encryptedMessage: ThresholdMessageKit) => void;
  decryptedMessage?: string | undefined;
  decryptionErrors: string[];
  encryptedMessage: string;
  onEncryptedMessageChange: (newMessage: string) => void; // Add this line to define the new prop
 }

export const Decrypt = ({
  decrypt,
  decryptedMessage,
  decryptionErrors,
  enabled,
  encryptedMessage,
  onEncryptedMessageChange,
}: Props) => {
  // const [encryptedMessage, setEncryptedMessage] = useState('');

  if (!enabled) {
    return <></>;
  }

  const onDecrypt = () => {
    if (!encryptedMessage) {
      return;
    }
    const mkBytes = Buffer.from(encryptedMessage, 'base64');
    const mk = ThresholdMessageKit.fromBytes(mkBytes);
    decrypt(mk);
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
