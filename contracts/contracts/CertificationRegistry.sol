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
 
    constructor() {
        _disableInitializers();
    }
 
    function initialize(address initialOwner) public initializer {
        __Ownable_init(initialOwner);
        __UUPSUpgradeable_init();
    }
 
    // Function to register the application along with the owner's wallet address
    function registerApp(address walletId, bytes32 appCodeHash) public {
        applicationCounter++; // Increment the counter to get a unique application ID
        registry[walletId].push(AppCertification({
            applicationId: applicationCounter,
            codeHash: appCodeHash,
            isCertified: true // Automatically certify the app upon registration
        }));
    }
 
    // Function to check if an application is certified
    function isAppCertified(address walletId, uint256 appId, bytes32 currentCodeHash) public view returns (bool) {
        AppCertification[] memory certifications = registry[walletId];
        for (uint i = 0; i < certifications.length; i++) {
            if (certifications[i].isCertified && appId == certifications[i].applicationId && currentCodeHash == certifications[i].codeHash) {
                return true;
            }
        }
        return false;
    }
 
    // Function to revoke certification for a specific application ID
    function revokeCertification(address walletId, uint256 appId) public onlyOwner {
        AppCertification[] storage certifications = registry[walletId];
        for (uint i = 0; i < certifications.length; i++) {
            if (appId == certifications[i].applicationId) {
                certifications[i].isCertified = false;
            }
        }
    }
 
    // Function to allow a particular application ID to compute on given data hash
    // Only the owner of the contract can call this function
    function allowDataComputation(bytes32 dataHash, uint256 appId, uint256 amount) public payable onlyOwner {
        require(msg.value == amount, "Incorrect fee paid");
        dataPermissions[dataHash].push(appId);
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
 
    // Override for UUPS upgradeability
    function _authorizeUpgrade(address newImplementation)
        internal
        onlyOwner
        override
    {}
}
 
 
contract CertificationRegistryv2 is Initializable, OwnableUpgradeable, UUPSUpgradeable {
    struct AppCertification {
        uint256 applicationId;
        bytes32 codeHash;
        bool isCertified;
    }
 
    uint256 private applicationCounter; // Counter to assign application IDs
    mapping(address => AppCertification[]) public registry; // Maps wallet address to list of certification info
    mapping(bytes32 => uint256[]) public dataPermissions; // Maps data hash to an array of allowed application IDs
 
    constructor() {
        _disableInitializers();
    }
 
    function initialize(address initialOwner) public initializer {
        __Ownable_init(initialOwner);
        __UUPSUpgradeable_init();
    }
 
    // Function to register the application along with the owner's wallet address
    function registerApp(address walletId, bytes32 appCodeHash) public {
        applicationCounter++; // Increment the counter to get a unique application ID
        registry[walletId].push(AppCertification({
            applicationId: applicationCounter,
            codeHash: appCodeHash,
            isCertified: true // Automatically certify the app upon registration
        }));
    }
 
    // Function to check if an application is certified
    function isAppCertified(address walletId, uint256 appId, bytes32 currentCodeHash) public view returns (bool) {
        AppCertification[] memory certifications = registry[walletId];
        for (uint i = 0; i < certifications.length; i++) {
            if (certifications[i].isCertified && appId == certifications[i].applicationId && currentCodeHash == certifications[i].codeHash) {
                return true;
            }
        }
        return false;
    }
 
    // Function to revoke certification for a specific application ID
    function revokeCertification(address walletId, uint256 appId) public onlyOwner {
        AppCertification[] storage certifications = registry[walletId];
        for (uint i = 0; i < certifications.length; i++) {
            if (appId == certifications[i].applicationId) {
                certifications[i].isCertified = false;
            }
        }
    }
 
    // Function to allow a particular application ID to compute on given data hash
    // Only the owner of the contract can call this function
    function allowDataComputation(bytes32 dataHash, uint256 appId, uint256 amount) public payable onlyOwner {
        require(msg.value == amount, "Incorrect fee paid");
        dataPermissions[dataHash].push(appId);
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
    // Function to get the application ID associated with a wallet address and code hash
    function getAppId(address walletId, bytes32 codeHash) public view returns (uint256) {
        AppCertification[] memory certifications = registry[walletId];
        for (uint i = 0; i < certifications.length; i++) {
            if (certifications[i].codeHash == codeHash) {
                return certifications[i].applicationId;
            }
        }
        revert("Application ID not found");
    }
 
    // Override for UUPS upgradeability
    function _authorizeUpgrade(address newImplementation)
        internal
        onlyOwner
        override
    {}
}