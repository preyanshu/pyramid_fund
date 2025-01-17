'use client'
import { use, useEffect, useState } from "react";
import {
  useAbstraxionAccount,
  useAbstraxionClient,
  useAbstraxionSigningClient,
} from "@burnt-labs/abstraxion";
import { createCampaign, getAllCampaigns, contribute , getReferrer , getRefferedUsers  , withdrawFunds} from "@/utils/contractUtils";

import RenderModals from "@/components/renderModals";
import { fromBech32 } from "@cosmjs/encoding";
import {toast, ToastContainer } from 'react-toastify';


interface Campaign {
  id : string;
  img_url: string;
  title: string;
  goal: string;
  funds_raised: string;
  creator: string;
  active: boolean;
}

interface ModalData {
  img_url: string;
  title: string;
  goal: string;
}

export default function Page(): JSX.Element {
  const { data: account } = useAbstraxionAccount();
  const { client: queryClient } = useAbstraxionClient();
  const { client } = useAbstraxionSigningClient();

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refferalModal, setRefferalModal] = useState(false);
  const [filterMyCampaigns, setFilterMyCampaigns] = useState(false);
  
  const [modalData, setModalData] = useState<ModalData>({
    img_url: "",
    title: "",
    goal: "",
  });
  

  const [referralsAddr, setReferralsAddr] = useState<string[]>([]);
  const [referralInfo, setReferralInfo] = useState<any>(null);
  const [userCardLoading, setUserCardLoading] = useState(true);


  const [contributeModal, setContributeModal] = useState(false);
  const [contributionData, setContributionData] = useState({
    referralAddress: "",
    amount: 0,
    campaignId: ""
  });

  const handleContribute = async (campaignId:string) => {
    const { referralAddress, amount } = contributionData;

    console.log("Contribution data:", contributionData);

    if (!client || !account) {
      toast("Client or account not found. Please connect your wallet.");
      return;
    }

    if (!referralAddress || !amount) {
      toast("Please fill in all the fields.");
      return;
    }

    if(referralAddress === account.bech32Address){
      toast("You cannot refer yourself");
      return;
    }

    const isValidBech32Address = (address: string, expectedPrefix: string): boolean => {
      try {
        const decoded = fromBech32(address);
        return decoded.prefix === expectedPrefix;
      } catch (error) {
        console.error("Invalid Bech32 address:", error);
        return false;
      }
    };
    
    const expectedPrefix = "xion"; 
    
    if (!isValidBech32Address(referralAddress, expectedPrefix)) {
      toast("Invalid Bech32 address. Please enter a valid referral address.");
      return;
    }

  

    const uaxionAmount = Number(amount);
    if (isNaN(uaxionAmount) || uaxionAmount <= 0) {
      toast("Please enter a valid contribution amount.");
      return;
    }

    setLoading(true);
    try {
      const contributionRes = await contribute(
        client,
        account,
        campaignId,
        referralAddress,
        uaxionAmount
      );
      console.log("Contribution successful:", contributionRes);
      toast("Thank you for contributing!");

      // Refresh campaigns
      fetchCampaigns();

      // Reset and close modal
      setContributionData({ referralAddress: "", amount: 0 , campaignId:"" });
      setContributeModal(false);
    } catch (error : any) {
      console.error("Error contributing:", error);
      toast("An error occurred during contribution." + error.message);
    } finally {
      setLoading(false);
    }
  };




  useEffect(() => {
    if (!account || !queryClient) return;

    const fetchDetails = async () => {
      try {
        setUserCardLoading(true);
    
        // Perform the requests in parallel
        const [referrer, data] = await Promise.all([
          getReferrer(queryClient, account),
          getRefferedUsers(queryClient, account),
        ]);
    
        // Log the results
        console.log("Referrer:", referrer);
        console.log("Data:", data);
    
        // Update state
        setReferralInfo(referrer);
        setReferralsAddr(data);
    
        setUserCardLoading(false);
      } catch (error) {
        console.error("Error fetching referrer or referred users:", error);
        setUserCardLoading(false); // Ensure loading is disabled in case of error
      }
    };
    



    fetchDetails();
  }
  , [account.bech32Address, queryClient , campaigns]);


  
  
  const fetchCampaigns = async () => {
    if (!queryClient) return;

    setLoading(true);
    try {
      const fetchedCampaigns = await getAllCampaigns(queryClient);
      setCampaigns(fetchedCampaigns);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, [queryClient]);

  const handleCreateCampaign = async () => {
    const { img_url, title, goal } = modalData;

    if (!client || !account) {
      toast("Client or account not found. Please connect your wallet.");
      return;
    }

    if (!title || !goal) {
      toast("Please fill in all the fields.");
      return;
    }

    const uaxionGoal = Number(goal);
    if (isNaN(uaxionGoal) || uaxionGoal <= 0) {
      toast("Please enter a valid goal amount.");
      return;
    }

    const campaignData = {
      img_url,
      title,
      goal: uaxionGoal.toString(),
    };

    setLoading(true);
    try {
      const res = await createCampaign(client, account, img_url, title, uaxionGoal);
      console.log("Campaign created:", res);
      toast("Campaign created successfully!");

      // Refresh campaigns
      fetchCampaigns();

      // Reset and close modal
      setModalData({ img_url: "", title: "", goal: "" });
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error creating campaign:", error);
      toast("An error occurred while creating the campaign.");
    } finally {
      setLoading(false);
    }
  };

 const handleWithdrawFunds = async (campaignId: string) => {
    if (!client || !account) {
      toast("Client or account not found. Please connect your wallet.");
      return;
    }

    //confirm using toast

    const confirm = window.confirm("Are you sure you want to withdraw funds from this campaign?");

    if(!confirm){
      return;
    }

    setLoading(true);
    try {
      const withdrawRes = await withdrawFunds(client, account, campaignId);
      console.log("Withdrawal successful:", withdrawRes);
      toast("Funds withdrawn successfully!");
      fetchCampaigns();
    } catch (error) {
      console.error("Error withdrawing funds:", error);
      toast("An error occurred during withdrawal.");
    } finally {
      setLoading(false);
    }
  }
 

  // Filter campaigns based on the user's address
  const filteredCampaigns = filterMyCampaigns
    ? campaigns.filter((campaign) => campaign.creator === account?.bech32Address)
    : campaigns;

  return (
    <main className="m-auto flex min-h-screen flex-col items-center justify-start gap-6 p-6 w-full max-w-4xl">
      {/* User Info Section */}
      <section className="w-full max-w-4xl p-4 bg-gray-800 rounded-lg text-white shadow-lg">
  <h1 className="text-2xl font-bold">Welcome</h1>
  <p className="mt-2">
    <strong>Your Address:</strong> {account?.bech32Address || "Not connected"}
  </p>
  <p className="mt-2">
    <strong>Your Referrer:</strong> {userCardLoading? "loading ...   " : referralInfo?.referrer || "No referrer found"}
  </p>
  <p className="mt-2">
    <strong>Referred by you : </strong>   

    {userCardLoading? "loading ...   " : referralsAddr.length || 0 +" "}
    
   ( <button className="text-blue-500 underline" onClick={()=>{
      setRefferalModal(true)
    }}  disabled={userCardLoading}>click to view details</button>)
  </p>
  <p className="mt-2">
    <strong>Total Earned: </strong> 
    {userCardLoading? "loading ...   " : (referralInfo?.total_earned || "0") + " uxion" }  
  </p>

</section>


      {/* Create Campaign and Filter Buttons */}
      <section className="w-full flex items-center justify-between max-w-4xl">
        <button
          className={`px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg ${loading ? "bg-slate-800 hover:bg-slate-800" : ""}`}
          onClick={() => setIsModalOpen(true)}
          disabled={loading}
        >
          {"Create Campaign"}
        </button>
        <label className="flex items-center gap-2 text-white">
          <input
            type="checkbox"
            className="h-4 w-4"
            checked={filterMyCampaigns}
            onChange={() => setFilterMyCampaigns((prev) => !prev)}
          />
          Show My Campaigns
        </label>
      </section>

      {/* Campaign Cards Section */}
      <section className={`w-full max-w-4xl  ${loading?"flex justify-center  items-center h-[250px]":"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"}`}>
        {loading ? (
         
           <div >Loading campaigns...</div>
        
        ) : filteredCampaigns.length > 0 ? (
          filteredCampaigns.map((campaign, index) => {
            const isCreator = account?.bech32Address === campaign.creator;

            return (
              <div
              key={index}
              className="p-4 bg-gray-700 rounded-lg text-white shadow-md flex flex-col justify-between"
            >
              <div>
                <img
                  src={
                    campaign.img_url?.startsWith("http")
                      ? campaign.img_url
                      : "https://t4.ftcdn.net/jpg/05/64/31/67/240_F_564316725_zE8llusnCk3Sfr9rdfKya6fV7BQbjfyV.jpg"
                  }
                  alt={campaign.title || "Campaign Image"}
                  className="w-full h-48 object-cover rounded-md"
                />
                <h2 className="mt-4 text-xl font-bold break-words">{campaign.title}</h2>
                <p className="mt-2 break-words">
                  <strong>Goal:</strong> {campaign.goal} uxion
                </p>
                <p className="mt-1 break-words">
                  <strong>Funds Raised:</strong> {campaign.funds_raised} uxion
                </p>
                <p className="mt-1 break-words">
                  <strong>Creator:</strong> {campaign.creator}
                </p>
                <p className="mt-2 break-words">
                  <strong>Status:</strong> {campaign.active ? "Active" : "Inactive"}
                </p>
              </div>
            
              {/* Button Section */}
              <div className="mt-4">
                {isCreator ? (
                  <button
                    className={`w-full px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg ${
                      (campaign.active || Number(campaign.funds_raised)<=0) ? "bg-slate-800 hover:bg-slate-800" : ""
                    }`}
                    onClick={async () => {
                      if (campaign.active) {
                        toast("You cannot withdraw funds from an active campaign.");
                        return;
                      }

                      if (Number(campaign.funds_raised)<=0){
                        toast("Funds Already Withdrawn");
                        return;
                      }

                      handleWithdrawFunds(campaign.id);
                    }}
                  >
                    Withdraw Funds
                  </button>
                ) : (
                  <button
                    className={`w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg ${
                      campaign.active ? "" : "bg-slate-800 hover:bg-slate-800"
                    }`}
                    onClick={async () => {
                      if (!campaign.active) {
                        toast("This campaign is inactive.");
                        return;
                      }
                      //SET CAMPAIGN ID IN CONTRIBUTION DATA
                      setContributionData((prev) => ({ ...prev, campaignId: campaign.id}));
                      setContributeModal(true);
                    }}
                  >
                    Contribute
                  </button>
                )}
              </div>
            </div>
            
            );
          })
        ) : (
          <p className="text-white">
            {filterMyCampaigns ? "No campaigns created by you." : "No campaigns found."}
          </p>
        )}
        
      </section>

      {/* Modal for Creating Campaign */}

      <RenderModals
  isModalOpen={isModalOpen}
  setIsModalOpen={setIsModalOpen}
  refferalModal={refferalModal}
  setRefferalModal={setRefferalModal}
  contributeModal={contributeModal}
  setContributeModal={setContributeModal}
  modalData={modalData}
  setModalData={setModalData}
  referralsAddr={referralsAddr}
  referralInfo={referralInfo}
  contributionData={contributionData}
  setContributionData={setContributionData}
  handleCreateCampaign={handleCreateCampaign}
  handleContribute={handleContribute}
  loading={loading}
/>

      
<ToastContainer

theme="dark"
// transition={Bounce}
/>
    </main>
  );
}
