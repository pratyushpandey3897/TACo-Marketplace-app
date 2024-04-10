@startuml
start
:Data Consumer browses data assets;
:Data Consumer views data asset sample;
if (Data asset contains NFT or ERC20 ownership?) then (yes)
 :Data Consumer buys NFT or ERC20 tokens;
endif
:Is it a new application code?;
if (New application/code?) then (yes)
 :Data Consumer submits application code file;
 :Audit Backend Service audits code;
 if (Code is malicious?) then (yes)
    :Audit Backend Service rejects application code;
 else (no)
    :Audit Backend Service creates code hash and generates Application ID;
    :Audit Backend Service stores information;
    :Audit Backend Service returns code approval certificate and Application ID;
    :Marketplace notifies consumer for code approval status and Application ID;
 endif
else (Application already audited)
 :Data Consumer submits application code file and Application ID;
 :Marketplace generates code hash;
 :Audit Backend Service returns code hash;
 :TACo decrypts request with context parameters;
 :TACo fetches certification status;
 :TACo verifies access conditions;
 if (TACo conditions are met?) then (yes)
    :TACo returns decrypted data asset and Ready for Compute message;
 else (no)
    :TACo returns access denied;
 endif
endif
if (Data asset is ready for compute?) then (yes)
 :Data Consumer requests data asset compute;
 :Marketplace submits code docker file and decrypted data asset to Compute;
 :Compute returns compute job ID;
 :Marketplace notifies consumer for compute job ID;
 :Compute returns compute result file;
 :Marketplace notifies consumer for compute result file;
endif
stop
@enduml
