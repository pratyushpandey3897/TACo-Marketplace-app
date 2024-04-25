// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

contract CertificationRegistry is Initializable, OwnableUpgradeable, UUPSUpgradeable {
    struct AppCertification {
        uint256 applicationId;
        bytes32 codeHash;
        bool isCertified;
    }

    uint256 private applicationCounter; // Counter to assign application IDs
    mapping(address => AppCertification[]) public registry; // Maps wallet address to list of certification info
    mapping(bytes32 => uint256[]) public dataPermissions; // Maps data hash to an array of allowed application IDs
   
function initialize(address initialOwner) public initializer {
    __Ownable_init(initialOwner);  // Correct initialization for Ownable
    __UUPSUpgradeable_init();  // Correct initialization for UUPS upgradeable proxy
    _transferOwnership(initialOwner);  // Ensures ownership is set as expected
}

    function registerApp(address walletId, bytes32 appCodeHash) public {
        applicationCounter++;
        registry[walletId].push(AppCertification({
            applicationId: applicationCounter,
            codeHash: appCodeHash,
            isCertified: true
        }));
    }

    function isAppCertified(address walletId, uint256 appId, bytes32 currentCodeHash) public view returns (bool) {
        AppCertification[] storage certifications = registry[walletId];
        for (uint i = 0; i < certifications.length; i++) {
            if (certifications[i].isCertified && appId == certifications[i].applicationId && currentCodeHash == certifications[i].codeHash) {
                return true;
            }
        }
        return false;
    }

    function revokeCertification(address walletId, uint256 appId) public onlyOwner {
        AppCertification[] storage certifications = registry[walletId];
        for (uint i = 0; i < certifications.length; i++) {
            if (appId == certifications[i].applicationId) {
                certifications[i].isCertified = false;
            }
        }
    }

    function allowDataComputation(bytes32 dataHash, uint256 appId, uint256 amount) public payable onlyOwner {
        require(msg.value == amount, "Incorrect fee paid");
        dataPermissions[dataHash].push(appId);
    }

    function isAllowedToCompute(bytes32 dataHash, uint256 appId) public view returns (bool) {
        uint256[] memory allowedApps = dataPermissions[dataHash];
        for (uint i = 0; i < allowedApps.length; i++) {
            if (allowedApps[i] == appId) {
                return true;
            }
        }
        return false;
    }

    function getAppId(address walletId, bytes32 codeHash) public view returns (uint256) {
        AppCertification[] storage certifications = registry[walletId];
        for (uint i = 0; i < certifications.length; i++) {
            if (certifications[i].codeHash == codeHash) {
                return certifications[i].applicationId;
            }
        }
        revert("Application ID not found");
    }

    function _authorizeUpgrade(address newImplementation) internal onlyOwner override {}

    // Use this method to simulate the interaction and test it locally or in a testnet
    function testRegisterAndCheck(uint256 amountToPay) public payable {
        registerApp(msg.sender, keccak256(abi.encodePacked(msg.sender)));
        allowDataComputation(keccak256(abi.encodePacked(msg.sender)), 1, amountToPay);
    }
}
