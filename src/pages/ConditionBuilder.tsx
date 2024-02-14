import { conditions } from '@nucypher/taco';
import { Mumbai, useEthers } from '@usedapp/core';
import React, { useState } from 'react';
import Web3 from 'web3';

interface Props {
  condition?: conditions.condition.Condition | undefined;
  setConditions: (value: conditions.condition.Condition) => void;
  enabled: boolean;
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

const ownsNFT = new conditions.base.contract.ContractCondition({
  method: 'balanceOf',
  parameters: [':userAddress'],
  standardContractType: 'ERC721',
  contractAddress: '0xD7F4569064eBa34756F72787F9D0A7f7ea4B61e7',
  chain: 80001,
  returnValueTest: {
    comparator: '>=',
    value: 2,
  },
});

// const isAuditCertified = new conditions.base.contract.ContractCondition({
//   method: 'isAppCertified',
//   parameters: [':walletId', ':appId',':currentCodeHash'],
//   contractAddress: '0x235dca3e0781ef47bdc30455d6d0141ef6f73e36',
//   functionAbi: myFunctionAbi,
//   chain: 80001,
//   returnValueTest: {
//     comparator: '==',
//     value: true,
//   },
// });

export const ConditionBuilder = ({
  condition,
  setConditions,
  enabled,
}: Props) => {
  const { library } = useEthers();

  const demoCondition = JSON.stringify((condition ?? ownsNFT).toObj());
  const [conditionString, setConditionString] = useState(demoCondition);

  if (!enabled || !library) {
    return <></>;
  }

  const prettyPrint = (obj: object | string) => {
    if (typeof obj === 'string') {
      obj = JSON.parse(obj);
    }
    return JSON.stringify(obj, null, 2);
  };

  const makeInput = (
    onChange = (e: any) => console.log(e),
    defaultValue: string
  ) => (
    <textarea
      rows={15}
      onChange={(e: any) => onChange(e.target.value)}
      defaultValue={prettyPrint(defaultValue)}
    >
      {}
    </textarea>
  );

  const conditionJSONInput = makeInput(
    setConditionString,
    JSON.stringify(ownsNFT.toObj())
  );

  const onCreateCondition = (e: any) => {
    e.preventDefault();
    setConditions(
      conditions.ConditionFactory.conditionFromProps(
        JSON.parse(conditionString)
      )
    );
  };

  return (
    <>
      <h2>Step 1 - Create A Conditioned Access Policy</h2>
      <div>
        <div>
          <h3>Customize your Conditions</h3>
          <div>
            <h3>Condition JSON</h3>
            {conditionJSONInput}
          </div>
        </div>
        <button onClick={onCreateCondition}>Create Conditions</button>
      </div>
    </>
  );
};
