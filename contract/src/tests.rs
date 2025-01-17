use cw_multi_test::{App, ContractWrapper, Executor, IntoAddr};
use state::{Campaign , Referral};
    use cosmwasm_std::{coins, Uint128};

    use super::*;

    #[test]
    fn test_instantiation() {
        let owner = "owner".into_addr();

        let mut app = App::new(|router, _, storage| {
            router
                .bank
                .init_balance(storage, &owner, coins(600, "uxion"))
                .unwrap()
        });

        // Initialize the contract wrapper
        let code = ContractWrapper::new(execute, instantiate, query);
        let code_id = app.store_code(Box::new(code));

        // Instantiate the contract
        let addr = app
            .instantiate_contract(
                code_id,
                owner.clone(),
                &InstantiateMsg {},
                &[],
                "Pyramid Contract",
                None,
            )
            .unwrap();

        // Ensure the contract is instantiated
        assert!(!addr.as_str().is_empty());
    }

    #[test]
    fn test_campaign_creation() {
        let owner = "owner".into_addr();

        let mut app = App::new(|router, _, storage| {
            router
                .bank
                .init_balance(storage, &owner, coins(600, "uxion"))
                .unwrap()
        });

        // Initialize the contract wrapper
        let code = ContractWrapper::new(execute, instantiate, query);
        let code_id = app.store_code(Box::new(code));

        // Instantiate the contract
        let addr = app
            .instantiate_contract(
                code_id,
                owner.clone(),
                &InstantiateMsg {},
                &[],
                "Pyramid Contract",
                None,
            )
            .unwrap();

        // Create a campaign
        let campaign_id = "campaign1".to_string();
        let campaign_title = "Test Campaign".to_string();
        let img_url = "https://www.google.com".to_string();
        let campaign_goal = Uint128::new(1000);

        let create_campaign_msg = ExecuteMsg::CreateCampaign {
            id: campaign_id.clone(),
            title: campaign_title.clone(),
            img_url: img_url.clone(),
            goal: campaign_goal,
        };

        let res = app.execute_contract(owner.clone(), addr.clone(), &create_campaign_msg, &[]);
        assert!(res.is_ok());

        // Query the campaign to ensure it was created
        let query_msg = QueryMsg::GetCampaign {
            id: campaign_id.clone(),
        };
        let campaign: Campaign = app.wrap().query_wasm_smart(addr.clone(), &query_msg).unwrap();

        assert_eq!(campaign.title, campaign_title);
        assert_eq!(campaign.goal, campaign_goal);
        assert_eq!(campaign.funds_raised, Uint128::zero());
        assert_eq!(campaign.creator, owner.to_string());
    }

    #[test]
    fn test_contribution_with_referral() {
        let owner = "owner".into_addr();
        let referrer = "referrer1".into_addr();

        let refbyowner = "refbyowner".into_addr();

        let mut app = App::new(|router, _, storage| {
            router
                .bank
                .init_balance(storage, &owner, coins(6000, "uxion"))
                .unwrap();
            
            router
                .bank
                .init_balance(storage, &refbyowner, coins(3000, "uxion"))
                .unwrap();
        });

        // Initialize the contract wrapper
        let code = ContractWrapper::new(execute, instantiate, query);
        let code_id = app.store_code(Box::new(code));

        // Instantiate the contract
        let addr = app
            .instantiate_contract(
                code_id,
                owner.clone(),
                &InstantiateMsg {},
                &[],
                "Pyramid Contract",
                None,
            )
            .unwrap();

        // Create a campaign
        let campaign_id = "campaign1".to_string();
        let campaign_title = "Test Campaign".to_string();
        let campaign_goal = Uint128::new(1000);
        let img_url = "https://www.google.com".to_string();

        let create_campaign_msg = ExecuteMsg::CreateCampaign {
            id: campaign_id.clone(),
            title: campaign_title.clone(),
            img_url: img_url.clone(),
            goal: campaign_goal,
        };

        app.execute_contract(owner.clone(), addr.clone(), &create_campaign_msg, &[])
            .unwrap();

        // Simulate a contribution with a referral
        let mut contribution_msg = ExecuteMsg::Contribute {
            campaign_id: campaign_id.clone(),
            referrer: Some(referrer.to_string()),
        };
        let funds = coins(800, "uxion");

        let res = app.execute_contract(owner.clone(), addr.clone(), &contribution_msg, &funds);
        assert!(res.is_ok());

        contribution_msg = ExecuteMsg::Contribute {
            campaign_id: campaign_id.clone(),
            referrer: Some(referrer.to_string()),
        };

        let res = app.execute_contract(refbyowner.clone(), addr.clone(), &contribution_msg, &funds);
        assert!(res.is_ok());

        // Query referral details
        let referral_query_msg = QueryMsg::GetReferral {
            address: refbyowner.to_string(),
        };
        let referral: Referral =
            app.wrap().query_wasm_smart(addr.clone(), &referral_query_msg).unwrap();

        println!("Referral details: {:?}", referral);
      
    }

    #[test]
    fn test_referred_addresses_query() {
        let owner = "owner".into_addr();
        let referrer = "referrer1".into_addr();

        let mut app = App::new(|router, _, storage| {
            router
                .bank
                .init_balance(storage, &owner, coins(600, "uxion"))
                .unwrap()
        });

        // Initialize the contract wrapper
        let code = ContractWrapper::new(execute, instantiate, query);
        let code_id = app.store_code(Box::new(code));

        // Instantiate the contract
        let addr = app
            .instantiate_contract(
                code_id,
                owner.clone(),
                &InstantiateMsg {},
                &[],
                "Pyramid Contract",
                None,
            )
            .unwrap();

        // Create a campaign
        let campaign_id = "campaign1".to_string();
        let campaign_title = "Test Campaign".to_string();
        let campaign_goal = Uint128::new(1000);
        let img_url = "https://www.google.com".to_string();

        let create_campaign_msg = ExecuteMsg::CreateCampaign {
            id: campaign_id.clone(),
            title: campaign_title.clone(),
            img_url: img_url.clone(),
            goal: campaign_goal,
        };

        app.execute_contract(owner.clone(), addr.clone(), &create_campaign_msg, &[])
            .unwrap();

        // Simulate a contribution with a referral
        let contribution_msg = ExecuteMsg::Contribute {
            campaign_id: campaign_id.clone(),
            referrer: Some(referrer.to_string()),
        };
        let funds = coins(500, "uxion");

        app.execute_contract(owner.clone(), addr.clone(), &contribution_msg, &funds)
            .unwrap();

        // Query the list of referred addresses
        let referred_addresses_query_msg = QueryMsg::GetReferredAddresses {
            address: referrer.to_string(),
        };
        let referred_addresses: Vec<String> = app
            .wrap()
            .query_wasm_smart(addr.clone(), &referred_addresses_query_msg)
            .unwrap();

        println!("Referred addresses: {:?}", referred_addresses);
    }

   #[test]

   fn test_withdraw(){
         let owner = "owner".into_addr();
         let referrer = "referrer1".into_addr();
    
         let mut app = App::new(|router, _, storage| {
              router
                .bank
                .init_balance(storage, &owner, coins(6000, "uxion"))
                .unwrap()
         });
    
         // Initialize the contract wrapper
         let code = ContractWrapper::new(execute, instantiate, query);
         let code_id = app.store_code(Box::new(code));
    
         // Instantiate the contract
         let addr = app
              .instantiate_contract(
                code_id,
                owner.clone(),
                &InstantiateMsg {},
                &[],
                "Pyramid Contract",
                None,
              )
              .unwrap();
    
         // Create a campaign
         let campaign_id = "campaign1".to_string();
         let campaign_title = "Test Campaign".to_string();
         let campaign_goal = Uint128::new(100);
         let img_url = "https://www.google.com".to_string();
    
         let create_campaign_msg = ExecuteMsg::CreateCampaign {
              id: campaign_id.clone(),
              title: campaign_title.clone(),
              img_url: img_url.clone(),
              goal: campaign_goal,
         };
    
         app.execute_contract(owner.clone(), addr.clone(), &create_campaign_msg, &[])
              .unwrap();
    
         // Simulate a contribution with a referral
         let contribution_msg = ExecuteMsg::Contribute {
              campaign_id: campaign_id.clone(),
              referrer: Some(referrer.to_string()),
         };
         let funds = coins(500, "uxion");
    
         app.execute_contract(owner.clone(), addr.clone(), &contribution_msg, &funds)
              .unwrap();
    
         // Withdraw the funds
         let withdraw_msg = ExecuteMsg::Withdraw {
              campaign_id: campaign_id.clone(),
         };
    
         app.execute_contract(owner.clone(), addr.clone(), &withdraw_msg, &[])
              .unwrap();
    
         // Query the campaign to ensure the funds were withdrawn
         let query_msg = QueryMsg::GetCampaign {
              id: campaign_id.clone(),
         };
         let campaign: Campaign = app.wrap().query_wasm_smart(addr.clone(), &query_msg).unwrap();
    
         assert_eq!(campaign.funds_raised, Uint128::zero());

   
   }


   #[test]
    
   fn test_all_campaigns_query(){
       let owner = "owner".into_addr();
       let _referrer = "referrer1".into_addr();

       let mut app = App::new(|router, _, storage| {
           router
               .bank
               .init_balance(storage, &owner, coins(6000, "uxion"))
               .unwrap()
       });

       // Initialize the contract wrapper
       let code = ContractWrapper::new(execute, instantiate, query);
       let code_id = app.store_code(Box::new(code));

       // Instantiate the contract
       let addr = app
           .instantiate_contract(
               code_id,
               owner.clone(),
               &InstantiateMsg {},
               &[],
               "Pyramid Contract",
               None,
           )
           .unwrap();

       // Create a campaign
       let campaign_id = "campaign1".to_string();
       let campaign_title = "Test Campaign".to_string();
       let campaign_goal = Uint128::new(1000);
       let img_url = "https://www.google.com".to_string();

       let create_campaign_msg = ExecuteMsg::CreateCampaign {
           id: campaign_id.clone(),
           title: campaign_title.clone(),
           img_url: img_url.clone(),
           goal: campaign_goal,
       };

       app.execute_contract(owner.clone(), addr.clone(), &create_campaign_msg, &[])
           .unwrap();

       // Query all campaigns
       let all_campaigns_query_msg = QueryMsg::GetAllCampaigns {};
       let campaigns: Vec<Campaign> = app
           .wrap()
           .query_wasm_smart(addr.clone(), &all_campaigns_query_msg)
           .unwrap();

       println!("All campaigns Test: {:?}", campaigns);

   }