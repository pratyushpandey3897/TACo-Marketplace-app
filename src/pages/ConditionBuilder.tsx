import { conditions } from '@nucypher/taco';
import { Mumbai, useEthers } from '@usedapp/core';
import React, { useState, useEffect } from 'react';
import Web3 from 'web3';

interface Props {
  condition?: conditions.condition.Condition | undefined;
  setConditions: (value: conditions.condition.Condition) => void;
  enabled: boolean;
  onConditionJsonChange: (conditionJson: string) => void;
}
const myFunctionAbi: conditions.base.contract.FunctionAbiProps = {
  inputs: [
    {
      internalType: 'address',
      name: 'walletId',
      type: 'address',
    },
    {
      internalType: 'uint256',
      name: 'appId',
      type: 'uint256',
    },
    {
      internalType: 'bytes32',
      name: 'currentCodeHash',
      type: 'bytes32',
    },
  ],
  name: 'isAppCertified',
  outputs: [
    {
      internalType: 'bool',
      name: '',
      type: 'bool',
    },
  ],
  stateMutability: 'view',
  type: 'function',
};

//updated ABI

const jsonArray = [
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
    }
  
 ];

export const ConditionBuilder = ({
  onConditionJsonChange,
  condition,
  setConditions,
  enabled,

}: Props) => {
  const { library } = useEthers();
  type CustomConditionType = conditions.compound.CompoundCondition | null;
  const [customCondition, setCustomCondition] = useState<CustomConditionType>(null);

  const rpcCondition = new conditions.base.rpc.RpcCondition({
    chain: Mumbai.chainId,
    method: 'eth_getBalance',
    parameters: [':userAddress'],
    returnValueTest: {
      comparator: '>',
      value:  0,
    },
  });
  
  const [conditionString, setConditionString] = useState(JSON.stringify(rpcCondition.toObj()));
  
  

  const [nftOwnership, setNftOwnership] = useState(false);
  const [erc20Ownership, setErc20Ownership] = useState(false);
  const [auditNeeded, setAuditNeeded] = useState(false);

  const [nftContractAddress, setNftContractAddress] = useState('');
  const [erc20ContractAddress, setErc20ContractAddress] = useState('');
  const [erc20Threshold, setErc20Threshold] = useState('');
 

  if (!enabled || !library) {
    return <></>;
  }

  

  const handleNftOwnershipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNftOwnership(e.target.checked);
  };

  const handleErc20OwnershipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErc20Ownership(e.target.checked);
  };

  const handleAuditNeededChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAuditNeeded(e.target.checked);
  };

  const prettyPrint = (obj: object | string): string => {
    if (typeof obj === 'string') {
      try {
        obj = JSON.parse(obj);
      } catch (e) {
        // If parsing fails, return an empty string
        return '';
      }
    }
    return JSON.stringify(obj, null,  2);
  };

  const makeInput = (
    onChange = (e: any) => console.log(e),
    defaultValue: string
  ) => (
    <textarea
      rows={15}
      readOnly
      onChange={(e: any) => onChange(e.target.value)}
      defaultValue={prettyPrint(defaultValue)}
    >
      {}
    </textarea>
  );
  const conditionJSONInput = makeInput(
    () => {}, // No need for an onChange handler since the textarea is read-only
    customCondition ? JSON.stringify(customCondition.toObj(), null,   2) : ''
  );

const onCreateCondition = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  let conditionsArray = [];
  let conditionJSON = {
    Audit: false,
    NFTAddress: "",
    ERC20: {
      contractAddress: "",
      Threshold: ""
    }
  };// To store human-readable descriptions

  // Check if NFT ownership is selected and add the condition
  if (nftOwnership) {
    conditionJSON.NFTAddress= nftContractAddress;

    const ownsNFT = new conditions.base.contract.ContractCondition({
      method: 'balanceOf',
      parameters: [':userAddress'],
      standardContractType: 'ERC721',
      contractAddress: nftContractAddress,
      chain: 80001,
      returnValueTest: {
        comparator: '>=',
        value: 1,
      },
    });
    conditionsArray.push(ownsNFT);
  }

  // Check if ERC20 token ownership is selected and add the condition
  if (erc20Ownership) {
    conditionJSON.ERC20.Threshold =erc20Threshold;
    conditionJSON.ERC20.contractAddress = erc20ContractAddress;

    const ownsERC20 = new conditions.base.contract.ContractCondition({
      method: 'balanceOf',
      parameters: [':userAddress'],
      standardContractType: 'ERC20',
      contractAddress: erc20ContractAddress,
      chain: 80001,
      returnValueTest: {
        comparator: '>=',
        value: parseInt(erc20Threshold, 10) * Math.pow(10, 18),
      },
    });
    conditionsArray.push(ownsERC20);
  }

  // Check if audit is needed and add the condition
  if (auditNeeded) {
    conditionJSON.Audit =true;
    const isCertified = new conditions.base.contract.ContractCondition({
      method: 'isAppCertified',
      parameters: [':walletId', ':appId',':currentCodeHash'],
      contractAddress: '0xb90d6aac5d201608634c7c4f7ee411c059463123',
      functionAbi: myFunctionAbi,
      chain: 80001,
      returnValueTest: {
        comparator: '==',
        value: true,
      },
    });
    conditionsArray.push(isCertified);
  }

  let newCustomCondition;
  if (conditionsArray.length === 1) {
    newCustomCondition = conditionsArray[0];
  } else {
    newCustomCondition = conditions.compound.CompoundCondition.and(conditionsArray);
  }
  
  // Use JSON.stringify to convert array of descriptions to a string if you prefer
  const humanReadableConditions = JSON.stringify(conditionJSON)

  setCustomCondition(newCustomCondition);
  setConditions(newCustomCondition);
  onConditionJsonChange(humanReadableConditions); // Pass the human-readable descriptions instead of JSON
};

  return (
    <>
      <h1 className="font-light text-xl p-5 text-center">
        Step 1 - Create A Conditioned Access Policy
      </h1>
      <form
        onSubmit={onCreateCondition}
        className="flex flex-col space-y-4 mx-auto lg:w-3/4 bg-white p-5 rounded shadow-lg"
      >
        <div className="flex flex-col">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={nftOwnership}
              onChange={handleNftOwnershipChange}
              className="mr-2"
            />
            NFT Ownership
          </label>
          {nftOwnership && (
            <input
              type="text"
              placeholder="NFT Contract Address"
              value={nftContractAddress}
              onChange={(e) => setNftContractAddress(e.target.value)}
              className="border p-2 rounded mt-2"
            />
          )}
        </div>
        <div className="flex flex-col">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={erc20Ownership}
              onChange={handleErc20OwnershipChange}
              className="mr-2"
            />
            ERC20 Token Ownership
          </label>
          {erc20Ownership && (
            <>
              <input
                type="text"
                placeholder="ERC20 Contract Address"
                value={erc20ContractAddress}
                onChange={(e) => setErc20ContractAddress(e.target.value)}
                className="border p-2 rounded mt-2"
              />
              <input
                type="number"
                placeholder="Token Threshold"
                value={erc20Threshold}
                onChange={(e) => setErc20Threshold(e.target.value)}
                className="border p-2 rounded mt-2"
              />
            </>
          )}
        </div>
        <div className="flex flex-col">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={auditNeeded}
              onChange={handleAuditNeededChange}
              className="mr-2"
            />
            Audit Needed
          </label>
        </div>
        <div className="flex flex-col">
          <div className="flex flex-col">
            <div className="flex justify-center items-center p-5">
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-2 rounded"
              >
                Create Conditions
              </button>
            </div>
            {conditionJSONInput && (
              <>
                <h3 className="mb-2 font-semibold text-lg">Condition JSON</h3>
                {conditionJSONInput}
              </>
            )}
          </div>
        </div>
      </form>
    </>
  );
};
