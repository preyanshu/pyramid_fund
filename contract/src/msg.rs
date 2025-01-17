use serde::{Deserialize, Serialize};
use cosmwasm_std::Uint128;

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq)]
pub struct InstantiateMsg {}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq)]
pub enum ExecuteMsg {
    CreateCampaign { id: String, title: String, goal: Uint128 , img_url: String },
    Contribute { campaign_id: String, referrer: Option<String> },
    Withdraw { campaign_id: String },
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq)]
pub enum QueryMsg {
    GetCampaign { id: String },
    GetAllCampaigns {},
    GetReferral { address: String },
    GetReferredAddresses { address: String },
}
