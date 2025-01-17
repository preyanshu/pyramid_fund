export const contractAddress = "xion1vjypc3d85257apyz7zz2psq5czpujn3kdxqkuzsc2k9qcsfxsfkqwmgs7j";

// Type definitions
interface Campaign {
  id: string;
  img_url: string;
  title: string;
  goal: string;
}

export async function getAllCampaigns(client: any): Promise<Campaign[]> {
  const query = { GetAllCampaigns: {} };

  try {
    if (!client) throw new Error("Client not initialized");
    const campaigns = await client.queryContractSmart(contractAddress, query);
    return campaigns;
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    return [];
  }
}

export async function createCampaign(
  client: any,
  account: { bech32Address: string },
  img_url: string,
  title: string,
  goal: number
): Promise<any> {
  const currentDate = new Date();
  const campaignId = currentDate.getTime().toString();
  const msg = {
    CreateCampaign: {
      id: campaignId,
      img_url,
      title,
      goal: String(goal),
    },
  };

  try {
    if (!client || !account) throw new Error("Client or account not initialized");
    const response = await client.execute(account.bech32Address, contractAddress, msg, "auto");
    console.log("Campaign created successfully:", response);
    return response;
  } catch (error) {
    console.error("Error creating campaign:", error);
    throw error;
  }
}

export async function contribute(
  client: any,
  account: { bech32Address: string },
  campaignId: string,
  referrer: string,
  amount: Number
): Promise<any> {
  const msg = {
    Contribute: {
      campaign_id: campaignId,
      referrer : referrer,
    },
  };

  console.log("Contribution message:", msg);
  console.log("Amount:", amount);

  try {
    if (!client || !account) throw new Error("Client or account not initialized");
    const response = await client.execute(account.bech32Address, contractAddress, msg,"auto" ,undefined, [{
      amount: String(amount), denom: "uxion"
    }]);
    console.log("Contribution successful:", response);
    return response;
  } catch (error) {
    console.error("Error contributing:", error);
    throw error;
  }
}


export async function getReferrer(client: any, account: { bech32Address: string }): Promise<any> {
  const query = { GetReferral : { address : account.bech32Address } };

  console.log("Query:", query);

  try {
    if (!client || !account) throw new Error("Client or account not initialized");
    const referrer = await client.queryContractSmart(contractAddress, query);
    return referrer;
  } catch (error) {
    console.error("Error fetching referrer:", error);
    return null;
  }
}

export async function getRefferedUsers(client: any, account: { bech32Address: string }): Promise<any> {
  const query = { GetReferredAddresses : { address  : account.bech32Address} };

  console.log("Query:", query);

  try {
    if (!client || !account) throw new Error("Client or account not initialized");
    const referrer = await client.queryContractSmart(contractAddress, query);
    return referrer;
  } catch (error) {
    console.error("Error fetching referrer:", error);
    return null;
  }
}


export async function withdrawFunds(client: any, account: { bech32Address: string }, campaignId:string): Promise<any> {
  const msg = {
    Withdraw : { campaign_id : campaignId },
  };

  try {
    if (!client || !account) throw new Error("Client or account not initialized");
    const response = await client.execute(account.bech32Address, contractAddress, msg, "auto");
    console.log("Withdrawal successful:", response);
    return response;
  } catch (error) {
    console.error("Error withdrawing funds:", error);
    throw error;
  }
}