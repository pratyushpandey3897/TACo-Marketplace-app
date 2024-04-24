@startuml
actor "Data Owner" as dataowner
entity "Marketplace" as Marketplace
database "Off-Chain DB" as offchaindb
entity "TACo" as taco

dataowner -> Marketplace: Set Data Asset details
dataowner -> Marketplace : Set Access condition policies
dataowner -> Marketplace : Provide actual Data Asset

Marketplace -> taco : Encrypt Data Asset
taco -> Marketplace : Encrypted Bytes
Marketplace -> Marketplace : Publish Data Asset
Marketplace -> offchaindb: Store MetaData and Encrypted Bytes
@enduml

