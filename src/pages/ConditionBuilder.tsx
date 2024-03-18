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

//   const onCreateCondition = (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     let conditionsArray = [];

//   // Check if NFT ownership is selected and add the condition
//   if (nftOwnership) {
//     const ownsNFT = new conditions.base.contract.ContractCondition({
//       method: 'balanceOf',
//       parameters: [':userAddress'],
//       standardContractType: 'ERC721',
//       contractAddress: nftContractAddress, // Use the state value for the contract address
//       chain:   80001,
//       returnValueTest: {
//         comparator: '>=',
//         value:   1,
//       },
//     });
//     conditionsArray.push(ownsNFT);
//   }

//   // Check if ERC20 token ownership is selected and add the condition
//   if (erc20Ownership) {
//     const ownsERC20 = new conditions.base.contract.ContractCondition({
//       method: 'balanceOf',
//       parameters: [':userAddress'],
//       standardContractType: 'ERC20',
//       contractAddress: erc20ContractAddress, // Use the state value for the contract address
//       chain:   80001,
//       returnValueTest: {
//         comparator: '>=',
//         value: parseInt(erc20Threshold,   10) * Math.pow(10,   18), // Convert the threshold to the correct unit
//       },
//     });
//     conditionsArray.push(ownsERC20);
//   }
//   if (auditNeeded){
//     const isCertified = new conditions.base.contract.ContractCondition({
//       method: 'isAppCertified',
//       parameters: [':walletid', ':codehash'],
//       contractAddress: '0xb90d6aac5d201608634c7c4f7ee411c059463123',
//       functionAbi: myFunctionAbi,
//       chain: 80001,
//       returnValueTest: {
//         comparator: '==',
//         value: true,
//       },
//     });
//     conditionsArray.push(isCertified);
//   }
//   let newCustomCondition;
// if(conditionsArray.length==1)
// {
//   newCustomCondition= conditionsArray[0];
// }else {
//    newCustomCondition = conditions.compound.CompoundCondition.and(conditionsArray);
// }
//   setCustomCondition(newCustomCondition);
//   setConditions(newCustomCondition);
//   onConditionJsonChange(JSON.stringify(newCustomCondition.toObj()));
//   };
const onCreateCondition = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  let conditionsArray = [];
  let conditionDescriptions = []; // To store human-readable descriptions

  // Check if NFT ownership is selected and add the condition
  if (nftOwnership) {
    const ownsNFTDescription = `NFT Ownership: Requires ownership of an NFT from contract ${nftContractAddress}.`;
    conditionDescriptions.push(ownsNFTDescription);

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
    const ownsERC20Description = `ERC20 Token Ownership: Requires holding at least ${erc20Threshold} tokens from contract ${erc20ContractAddress}.`;
    conditionDescriptions.push(ownsERC20Description);

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
    const isCertifiedDescription = "Audit Requirement: The app must be certified.";
    conditionDescriptions.push(isCertifiedDescription);

    const isCertified = new conditions.base.contract.ContractCondition({
      method: 'isAppCertified',
      parameters: [':walletid', ':codehash'],
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
  const humanReadableConditions = conditionDescriptions.join('; ');

  setCustomCondition(newCustomCondition);
  setConditions(newCustomCondition);
  onConditionJsonChange(humanReadableConditions); // Pass the human-readable descriptions instead of JSON
};

  return (
    <>
      <h2>Step  1 - Create A Conditioned Access Policy</h2>
      <form onSubmit={onCreateCondition}>
        <div>
          <label>
            <input
              type="checkbox"
              checked={nftOwnership}
              onChange={handleNftOwnershipChange}
            />
            NFT Ownership
          </label>
          {nftOwnership && (
            <input
              type="text"
              placeholder="NFT Contract Address"
              value={nftContractAddress}
              onChange={(e) => setNftContractAddress(e.target.value)}
            />
          )}
        </div>
        <div>
          <label>
            <input
              type="checkbox"
              checked={erc20Ownership}
              onChange={handleErc20OwnershipChange}
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
              />
              <input
                type="number"
                placeholder="Token Threshold"
                value={erc20Threshold}
                onChange={(e) => setErc20Threshold(e.target.value)}
              />
            </>
          )}
        </div>
        <div>
          <label>
            <input
              type="checkbox"
              checked={auditNeeded}
              onChange={handleAuditNeededChange}
            />
            Audit Needed
          </label>
        </div>
        <div>
          <h3>Customize your Conditions</h3>
          <div>
            <h3>Condition JSON</h3>
            {conditionJSONInput}
          </div>
        </div>
        <button type="submit">Create Conditions</button>
      </form>
    </>
  );
};
