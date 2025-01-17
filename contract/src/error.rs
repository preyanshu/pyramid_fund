use cosmwasm_std::StdError;

#[derive(Debug)]
pub enum ContractError {
    Std(StdError),
    // Add any custom error variants here
}
