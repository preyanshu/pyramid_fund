use cosmwasm_std::Uint128;
use cw_storage_plus::Map;
use serde::{Deserialize, Serialize};

pub const CAMPAIGNS: Map<String, Campaign> = Map::new("campaigns");
pub const REFERRALS: Map<String, Referral> = Map::new("referrals");

pub const MAX_LEVELS: usize = 5;
pub const REWARD_PERCENTAGES: [u8; 5] = [10, 5, 3, 2, 1];

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq)]
pub struct Campaign {
    pub id : String,
    pub title: String,
    pub goal: Uint128,
    pub img_url: String,
    pub funds_raised: Uint128,
    pub creator: String,
    pub active: bool,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq)]
pub struct Referral {
    pub referrer: Option<String>,
    pub total_earned: Uint128,
}
