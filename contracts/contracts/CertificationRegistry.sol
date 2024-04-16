// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";


contract CertificationRegistry is Initializable, OwnableUpgradeable,UUPSUpgradeable {
    struct AppCertification {
        uint256 applicationId;
        bytes32 codeHash;
        bool isCertified;
    }

    uint256 private applicationCounter; // Counter to assign application IDs
    mapping(address => AppCertification) public registry; // Maps wallet address to certification info
    mapping(bytes32 => uint256[]) public dataPermissions; // Maps data hash to an array of allowed application IDs
   
    constructor() {
        _disableInitializers();
    }

    function initialize(address initialOwner) initializer public {
        __Ownable_init(initialOwner);
        __UUPSUpgradeable_init();
    }
    // Function to register the application along with the owner's wallet address
    function registerApp(address walletId, bytes32 appCodeHash) public {
        applicationCounter++; // Increment the counter to get a unique application ID
        registry[walletId] = AppCertification({
            applicationId: applicationCounter,
            codeHash: appCodeHash,
            isCertified: true // Automatically certify the app upon registration
        });
    }

    // Function to check if an application is certified
    function isAppCertified(address walletId, uint256 appId, bytes32 currentCodeHash) public view returns (bool) {
        AppCertification memory certification = registry[walletId];
        return certification.isCertified && appId == certification.applicationId && currentCodeHash == certification.codeHash;
    }

    // Function to revoke certification
    function revokeCertification(address walletId) public onlyOwner {
        registry[walletId].isCertified = false;
    }

    // Function to register that a particular application ID can compute on given data hash
    // Checks if the paid amount matches the specified fee
// Function to register that a particular application ID can compute on given data hash
// Checks if the paid amount matches the specified fee
// Only the owner of the contract can call this function
function allowDataComputation(bytes32 dataHash, address walletId, uint256 amount) public payable onlyOwner {
    require(msg.value == amount, "Incorrect fee paid");
    AppCertification memory certification = registry[walletId];
    if (certification.isCertified) {
        dataPermissions[dataHash].push(certification.applicationId);
    }
}


    // Function to check if an application is allowed to compute on the given data hash
    function isAllowedToCompute(bytes32 dataHash, uint256 appId) public view returns (bool) {
        uint256[] memory allowedApps = dataPermissions[dataHash];
        for (uint i = 0; i < allowedApps.length; i++) {
            if (allowedApps[i] == appId) {
                return true;
            }
        }
        return false;
    }
      function _authorizeUpgrade(address newImplementation)
        internal
        onlyOwner
        override
    {}
}
