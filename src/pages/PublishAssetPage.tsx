import React, { useEffect, useState } from 'react';
import { useEthers,Mumbai } from '@usedapp/core';
import { ethers } from 'ethers';
import { ConditionBuilder } from './ConditionBuilder';
import { Encrypt } from './Encrypt';
import { initialize, encrypt, conditions, ThresholdMessageKit,domains } from '@nucypher/taco';
import { DEFAULT_DOMAIN, DEFAULT_RITUAL_ID } from './config';

export default function App() {
  const { activateBrowserWallet, deactivate, account, switchNetwork } = useEthers();
  const [conditionJson, setConditionJson] = useState('');
  const [loading, setLoading] = useState(false);
  const [condition, setCondition] = useState<conditions.condition.Condition>();
  const [encryptedMessage, setEncryptedMessage] = useState<ThresholdMessageKit>();
  const [ritualId, setRitualId] = useState<number>(DEFAULT_RITUAL_ID);
  const [domain, setDomain] = useState<string>(DEFAULT_DOMAIN);

  // Added state hooks for new input fields
  const [dataName, setDataName] = useState('');
  const [dataDescription, setDataDescription] = useState('');
  const [sampleDataUrl, setSampleDataUrl] = useState('');

  useEffect(() => {
    initialize();
    switchNetwork(Mumbai.chainId);
  }, []);
  const handleConditionJsonChange = (newConditionJson: string) => {
    setConditionJson(newConditionJson);
  };
  const encryptMessage = async (message: string) => {
    if (!condition) {
      return;
    }
    setLoading(true);

    await switchNetwork(Mumbai .chainId);

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const encryptedMessage = await encrypt(
      provider,
      domain,
      message,
      condition,
      ritualId,
      provider.getSigner(),
    );

    setEncryptedMessage(encryptedMessage);
    setLoading(false);
  };

  if (!account) {
    return (
      <div>
        <h2>Web3 Provider</h2>
        <button onClick={() => activateBrowserWallet()}>Connect Wallet</button>
      </div>
    );
  }

  return (
    <div>
      <div>
        <h2>Publish Asset</h2>
        <button onClick={deactivate}> Disconnect Wallet</button>
        {account && <p>Account: {account}</p>}
      </div>

      {/* Existing inputs and components */}
      <h2>Ritual ID</h2>
      <p>Replace with your own ritual ID</p>
      <input
        type="number"
        value={ritualId}
        onChange={(e) => setRitualId(parseInt(e.target.value))}
      />

      <h2>TACo Domain</h2>
      <p>Must match the domain of your ritual</p>
      <select
        defaultValue={domain}
        onChange={(e) => setDomain(e.target.value)}
      >
        {Object.values(domains).map((domain) => (
          <option value={domain} key={domain}>
            {domain}
          </option>
        ))}
      </select>
 {/* New input fields */}
 <h2>Data Name</h2>
      <input
        type="text"
        value={dataName}
        onChange={(e) => setDataName(e.target.value)}
        placeholder="Enter data name"
      />

      <h2>Data Description</h2>
      <textarea
        value={dataDescription}
        onChange={(e) => setDataDescription(e.target.value)}
        placeholder="Describe your data"
      />

      <h2>Sample Data URL</h2>
      <input
        type="url"
        value={sampleDataUrl}
        onChange={(e) => setSampleDataUrl(e.target.value)}
        placeholder="Enter sample data URL"
      />

      <ConditionBuilder
        enabled={true}
        condition={condition}
        setConditions={setCondition}
        onConditionJsonChange={handleConditionJsonChange}
      />
   {conditionJson && (
  <Encrypt
    enabled={!!conditionJson}
    encrypt={encryptMessage}
    encryptedMessage={encryptedMessage}
    DataName={dataName}
    Desc={dataDescription}
    sampleData={sampleDataUrl}
    Condition={conditionJson} // TypeScript now knows condition is defined here
  />
)}
    </div>
  );
}
