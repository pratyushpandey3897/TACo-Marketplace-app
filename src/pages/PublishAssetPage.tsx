import React, { useEffect, useState, useContext } from "react";
import { useEthers } from "@usedapp/core";
import { ethers } from "ethers";
import { ConditionBuilder } from "./ConditionBuilder";
import { Encrypt } from "./Encrypt";
import { toast } from 'react-toastify';
import { AccountContext } from "../App";
import {
  initialize,
  encrypt,
  conditions,
  ThresholdMessageKit,
  domains,
} from "@nucypher/taco";
import { DEFAULT_DOMAIN, DEFAULT_RITUAL_ID } from "./config";

export default function App() {
  const { activateBrowserWallet, deactivate, switchNetwork } =
    useEthers();
  const {currentAccount} = useContext(AccountContext);
    const [conditionJson, setConditionJson] = useState("");
  const [loading, setLoading] = useState(false);
  const [condition, setCondition] = useState<conditions.condition.Condition>();
  const [encryptedMessage, setEncryptedMessage] =
    useState<ThresholdMessageKit>();
  const [ritualId, setRitualId] = useState<number>(DEFAULT_RITUAL_ID);
  const [domain, setDomain] = useState<string>(DEFAULT_DOMAIN);

  // Added state hooks for new input fields
  const [dataName, setDataName] = useState("");
  const [dataDescription, setDataDescription] = useState("");
  const [sampleDataUrl, setSampleDataUrl] = useState("");

  useEffect(() => {
    initialize();
    switchNetwork(80002);
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
        console.error('Current account is not set.');
        return;
    }
  }, []);
  const handleConditionJsonChange = (newConditionJson: string) => {
    setConditionJson(newConditionJson);
  };
  const encryptMessage = async (message: string) => {
    if (!condition) {
      toast.info("Conditions are needed", {
        position: "top-center",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
    });
      return;
    }
    setLoading(true);

    await switchNetwork(80002);

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const encryptedMessage = await encrypt(
      provider,
      domain,
      message,
      condition,
      ritualId,
      provider.getSigner()
    );

    setEncryptedMessage(encryptedMessage);
    setLoading(false);
  };

  if (!currentAccount) {
    return (
      // <div>
      //   <h2>Web3 Provider</h2>
      //   <button onClick={() => activateBrowserWallet()}>Connect Wallet</button>
      // </div>
      <div>
        <h2>Wallet Connection is needed</h2>
      </div>
    );
  }

  return (
    <div className="rounded-md h-full overflow-y-scroll">
      <h1 className="font-light text-xl p-5 text-center">Publish Asset</h1>
      <form className="flex flex-col space-y-4 mx-auto lg:w-3/4 bg-white p-5 rounded shadow-lg">
        <label className="flex flex-col">
          <h2>Ritual ID</h2>
          <p>Replace with your own ritual ID</p>
          <input
            type="number"
            value={ritualId}
            onChange={(e) => setRitualId(parseInt(e.target.value))}
            className="border p-2 rounded"
          />
        </label>
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
        <label className="flex flex-col">
          <h2>Data Name</h2>
          <input
            type="text"
            value={dataName}
            onChange={(e) => setDataName(e.target.value)}
            className="border p-2 rounded"
            placeholder="Enter data name"
          />
        </label>
        <label className="flex flex-col">
          <h2>Data Description</h2>
          <textarea
            value={dataDescription}
            onChange={(e) => setDataDescription(e.target.value)}
            className="border p-2 rounded"
            placeholder="Describe your data"
          />
        </label>
        <label className="flex flex-col">
          <h2>Sample Data URL</h2>
          <input
            type="url"
            value={sampleDataUrl}
            onChange={(e) => setSampleDataUrl(e.target.value)}
            className="border p-2 rounded"
            placeholder="Enter sample data URL"
          />
        </label>
      </form>

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
