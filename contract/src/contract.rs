use cosmwasm_std::{
    to_json_binary, BankMsg, Binary, Coin, Deps, DepsMut, Env, MessageInfo, Response,
    StdError, StdResult, Uint128,
};

use crate::msg::{InstantiateMsg, ExecuteMsg, QueryMsg};
use crate::state::{Campaign, Referral, CAMPAIGNS, REFERRALS, MAX_LEVELS, REWARD_PERCENTAGES};

// Instantiate entry point

pub fn instantiate(_: DepsMut, _: Env, _: MessageInfo, _: InstantiateMsg) -> StdResult<Response> {
    Ok(Response::default())
}

// Execute entry point

pub fn execute(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    msg: ExecuteMsg,
) -> StdResult<Response> {
    match msg {
        ExecuteMsg::CreateCampaign { id, title, goal , img_url } => {
            create_campaign(deps, info, id, title, goal ,img_url)
        }
        ExecuteMsg::Contribute { campaign_id, referrer } => contribute(deps, env, info, campaign_id, referrer),
        ExecuteMsg::Withdraw { campaign_id } => withdraw(deps, env, info, campaign_id),
    }
}

// Query entry point

pub fn query(deps: Deps, _env: Env, msg: QueryMsg) -> StdResult<Binary> {
    match msg {
        QueryMsg::GetCampaign { id } => to_json_binary(&query_campaign(deps, id)?),
        QueryMsg::GetReferral { address } => to_json_binary(&query_referral(deps, address)?),
        QueryMsg::GetReferredAddresses { address } => to_json_binary(&query_referred_addresses(deps, address)?),
        QueryMsg::GetAllCampaigns {} => to_json_binary(&query_all_campaigns(deps)?),
    }
}

fn query_campaign(deps: Deps, id: String) -> StdResult<Campaign> {
    let campaign = CAMPAIGNS.load(deps.storage, id)?;
    Ok(campaign)
}

pub fn query_all_campaigns(deps: Deps) -> StdResult<Vec<Campaign>> {
    // Initialize an empty vector to hold the campaigns
    let mut campaigns = Vec::new();

    // Iterate over the stored campaigns and push them to the vector
    for campaign in CAMPAIGNS.range(deps.storage, None, None, cosmwasm_std::Order::Ascending) {
        let (_, campaign_data) = campaign?;
        campaigns.push(campaign_data);
    }

    // Return the vector of campaigns
    Ok(campaigns)
}

fn query_referral(deps: Deps, address: String) -> StdResult<Referral> {
    let referral = REFERRALS
        .may_load(deps.storage, address.clone())?
        .unwrap_or(Referral {
            referrer: None,
            total_earned: Uint128::zero(),
        });
    Ok(referral)
}

fn query_referred_addresses(deps: Deps, address: String) -> StdResult<Vec<String>> {
    let mut referred_addresses: Vec<String> = vec![];

    REFERRALS
        .range(deps.storage, None, None, cosmwasm_std::Order::Ascending)
        .for_each(|item| {
            if let Ok((key, referral)) = item {
                if referral.referrer == Some(address.clone()) {
                    referred_addresses.push(key);
                }
            }
        });

    Ok(referred_addresses)
}

// Create a campaign
fn create_campaign(
    deps: DepsMut,
    info: MessageInfo,
    id: String,
    title: String,
    goal: Uint128,
    img_url: String,
) -> StdResult<Response> {
    if CAMPAIGNS.has(deps.storage, id.clone()) {
        return Err(StdError::generic_err("Campaign ID already exists"));
    }

    let campaign = Campaign {
        id: id.clone(),
        title,
        goal,
        img_url,
        funds_raised: Uint128::zero(),
        creator: info.sender.to_string(),
        active: true,
    };

    CAMPAIGNS.save(deps.storage, id.clone(), &campaign)?;

    Ok(Response::new()
        .add_attribute("action", "create_campaign")
        .add_attribute("campaign_id", id))
}

// Contribute to a campaign
fn contribute(
    deps: DepsMut,
    _: Env,
    info: MessageInfo,
    campaign_id: String,
    referrer: Option<String>,
) -> StdResult<Response> {
    let mut campaign = CAMPAIGNS.load(deps.storage, campaign_id.clone())?;

    if !campaign.active {
        return Err(StdError::generic_err("Campaign is not active"));
    }

    let contribution = info
        .funds
        .iter()
        .find(|c| c.denom == "uxion")
        .map(|c| c.amount)
        .unwrap_or_else(Uint128::zero);

    if contribution.is_zero() {
        return Err(StdError::generic_err("No funds provided"));
    }

    let mut remaining_contribution = contribution;
    let mut payouts: Vec<BankMsg> = vec![];
    let mut current_referrer = referrer.clone();
    let referrer_addr = referrer.clone();
    let mut level = 0;

    while let Some(referrer_addr) = current_referrer.clone() {
        if level >= MAX_LEVELS {
            break;
        }

        let percentage = REWARD_PERCENTAGES[level];
        let reward = remaining_contribution * Uint128::from(percentage as u128) / Uint128::from(100u128);

        if reward < Uint128::from(1u128) {
            break;
        }

        if let Ok(new_remaining) = remaining_contribution.checked_sub(reward) {
            remaining_contribution = new_remaining;
        } else {
            break;
        }

        payouts.push(BankMsg::Send {
            to_address: referrer_addr.clone(),
            amount: vec![Coin {
                denom: "uxion".to_string(),
                amount: reward,
            }],
        });

        let mut referral = REFERRALS
            .may_load(deps.storage, referrer_addr.clone())?
            .unwrap_or(Referral {
                referrer: None,
                total_earned: Uint128::zero(),
            });

        referral.total_earned += reward;
        REFERRALS.save(deps.storage, referrer_addr.clone(), &referral)?;

        current_referrer = referral.referrer;
        level += 1;
    }

    campaign.funds_raised += remaining_contribution;

    if campaign.funds_raised >= campaign.goal {
        campaign.active = false;
    }

    CAMPAIGNS.save(deps.storage, campaign_id.clone(), &campaign)?;

    let mut referral = REFERRALS
        .may_load(deps.storage, info.sender.to_string())?
        .unwrap_or(Referral {
            referrer: referrer_addr.clone(),
            total_earned: Uint128::zero(),
        });

    if referral.referrer.is_none() {
        referral.referrer = referrer_addr.clone();
    }

    REFERRALS.save(deps.storage, info.sender.to_string(), &referral)?;

    Ok(Response::new()
        .add_messages(payouts)
        .add_attribute("action", "contribute")
        .add_attribute("campaign_id", campaign_id)
        .add_attribute("contribution", contribution.to_string())
        .add_attribute("remaining_contribution", remaining_contribution.to_string()))
}

// Withdraw funds from a campaign
fn withdraw(
    deps: DepsMut,
    _: Env,
    info: MessageInfo,
    campaign_id: String,
) -> StdResult<Response> {
    let mut campaign = CAMPAIGNS.load(deps.storage, campaign_id.clone())?;

    if info.sender.to_string() != campaign.creator {
        return Err(StdError::generic_err("Unauthorized: Only the campaign creator can withdraw funds"));
    }

    if campaign.active {
        return Err(StdError::generic_err("Campaign is still active"));
    }

    if campaign.funds_raised.is_zero() {
        return Err(StdError::generic_err("No funds available to withdraw"));
    }

    let withdraw_msg = BankMsg::Send {
        to_address: campaign.creator.clone(),
        amount: vec![Coin {
            denom: "uxion".to_string(),
            amount: campaign.funds_raised,
        }],
    };

    campaign.funds_raised = Uint128::zero();
    CAMPAIGNS.save(deps.storage, campaign_id.clone(), &campaign)?;

    Ok(Response::new()
        .add_message(withdraw_msg)
        .add_attribute("action", "withdraw")
        .add_attribute("campaign_id", campaign_id)
        .add_attribute("withdrawn_amount", campaign.funds_raised.to_string()))
}

