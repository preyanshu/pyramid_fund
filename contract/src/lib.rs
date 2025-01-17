#[cfg(not(feature = "library"))]
use cosmwasm_std::{entry_point, Deps, DepsMut, Env, MessageInfo, Response, Binary};
use crate::msg::{InstantiateMsg, ExecuteMsg, QueryMsg};
// use crate::contract::{instantiate, execute, query};

pub mod msg;
pub mod contract;
pub mod state;
pub mod error;

// Entry Point: Instantiate the contract
#[cfg_attr(not(feature = "library"), entry_point)]
pub fn instantiate(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    msg: InstantiateMsg,
) -> cosmwasm_std::StdResult<Response> {
    contract::instantiate(deps, env, info, msg)
}

// Entry Point: Execute contract logic (such as contributing or withdrawing)
#[cfg_attr(not(feature = "library"), entry_point)]
pub fn execute(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    msg: ExecuteMsg,
) -> cosmwasm_std::StdResult<Response> {
    contract::execute(deps, env, info, msg)
}

// Entry Point: Query contract state (such as getting campaign details)
#[cfg_attr(not(feature = "library"), entry_point)]
pub fn query(deps: Deps, env: Env, msg: QueryMsg) -> cosmwasm_std::StdResult<Binary> {
    contract::query(deps, env, msg)
}

// Tests

#[cfg(test)]
mod tests;
