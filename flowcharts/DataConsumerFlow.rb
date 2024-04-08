@startuml
actor "Data Consumer" as consumer
entity "Marketplace" as Marketplace
entity "Audit Backend Service" as audit
entity "Audit Smart contract" as auditcontract
database "Off-Chain DB" as offchaindb
entity "TACo" as taco
entity "Compute" as compute
entity "Exchange" as exchange

consumer -> Marketplace: Browse data assets
consumer -> Marketplace : View specific data asset sample and its access conditions

alt If Data asset contains NFT or ERC20 ownership as access condition
    consumer -> exchange: Buy NFT or ERC20 tokens
end

alt If new application/code
    consumer -> audit : Submit application code file
    audit -> audit : Audit code using LLM, SonraQube, etc.

    alt If code is Malicious
        audit -> marketplace : Reject application code
    else Code is secure
        audit -> audit: Create code hash and generate Application ID
        audit -> auditcontract: Store code hash, application ID, wallet address and audit certification
        audit -> Marketplace : Return code approval certificate and application ID
    end
    marketplace -> consumer : Notify consumer for code approval status application ID
    
else Application already audited
    consumer -> Marketplace : Submit application code file and Application ID
    Marketplace -> audit : Generate code hash
    Marketplace -> TACo : Decrypt request with context parameters (wallet ID, code hash, application ID)

    TACo -> auditcontract : Fetch certification status for code hash, application ID and wallet ID
    TACo -> TACo : verify NFT or ERC20 ownership if such access conditions specified

    alt If TACo conditions are met
        TACo -> Marketplace : return decrypted data asset and Ready for Compute message
        
        
    else TACo conditions are not met
        TACo -> Marketplace : return access denied
    end
end

alt If Data asset is ready for commpute
    consumer -> Marketplace : Request for data asset compute
    Marketplace -> compute : Submit code docker file and Decrypted data asset
    compute -> Marketplace : Return compute job ID
    Marketplace -> consumer : Notify consumer for compute job ID
    computer -> Marketplace : return compute result File
    Marketplace -> consumer : Notify consumer for compute result File
end

@enduml