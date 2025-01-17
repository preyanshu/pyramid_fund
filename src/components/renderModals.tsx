import React from 'react';

interface RenderModalsProps {
  isModalOpen: boolean;
  setIsModalOpen: (value: boolean) => void;
  refferalModal: boolean;
  setRefferalModal: (value: boolean) => void;
  contributeModal: boolean;
  setContributeModal: (value: boolean) => void;
  modalData: {
    img_url: string;
    title: string;
    goal: number;
  };
  setModalData: React.Dispatch<React.SetStateAction<{
    img_url: string;
    title: string;
    goal: number;
  }>>;
  referralsAddr: string[];
  contributionData: {
    referralAddress: string;
    amount: number;
    campaignId: string
  };
  setContributionData: React.Dispatch<React.SetStateAction<{
    referralAddress: string;
    amount: number;
  }>>;
  handleCreateCampaign: () => void;
  handleContribute: (campaignId:string) => void;
  loading: boolean;
}

const RenderModals: React.FC<RenderModalsProps> = ({
  isModalOpen,
  setIsModalOpen,
  refferalModal,
  setRefferalModal,
  contributeModal,
  setContributeModal,
  modalData,
  setModalData,
  referralsAddr,
  contributionData,
  setContributionData,
  handleCreateCampaign,
  handleContribute,
  loading,
}) => {
  return (
    <>
      {/* Create Campaign Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 text-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create Campaign</h2>
            <div className="flex flex-col gap-4">
              <label>
                <span className="block mb-1">Image URL</span>
                <input
                  type="text"
                  className="w-full p-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring focus:ring-blue-500"
                  value={modalData.img_url}
                  onChange={(e) =>
                    setModalData((prev) => ({ ...prev, img_url: e.target.value }))
                  }
                  placeholder="Enter image URL"
                />
              </label>
              <label>
                <span className="block mb-1">Title</span>
                <input
                  type="text"
                  className="w-full p-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring focus:ring-blue-500"
                  value={modalData.title}
                  onChange={(e) =>
                    setModalData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="Enter campaign title"
                />
              </label>
              <label>
                <span className="block mb-1">Goal (uxion)</span>
                <input
                  type="number"
                  className="w-full p-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring focus:ring-blue-500"
                  value={modalData.goal}
                  onChange={(e) =>
                    setModalData((prev) => ({ ...prev, goal: +e.target.value }))
                  }
                  placeholder="Enter goal amount"
                />
              </label>
            </div>
            <div className="mt-6 flex items-center justify-between">
              <button
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg"
                onClick={() => setIsModalOpen(false)}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
                onClick={handleCreateCampaign}
                disabled={loading}
              >
                {loading ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Referral Modal */}
      {refferalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 text-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Referred User Addresses</h2>
            <div className="flex flex-col gap-4 max-h-96 overflow-y-auto">
              {referralsAddr.length === 0 && (
                <div className="p-4 bg-gray-700 rounded-lg text-center font-mono text-sm">
                  No referred users yet
                </div>
              )}
              
              {referralsAddr.length>0 && referralsAddr.map((address, index) => (
                <div
                  key={index}
                  className="p-4 bg-gray-700 rounded-lg text-center font-mono text-sm"
                >
                  {`${address.slice(0, 6)}...${address.slice(-4)}`}
                </div>
              ))}
            </div>
            <div className="mt-6 flex items-center justify-end">
              <button
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg"
                onClick={() => setRefferalModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contribute Modal */}
      {contributeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 text-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Contribute</h2>
            <div className="flex flex-col gap-4">
              <label>
                <span className="block mb-1">Referral Address</span>
                <input
                  type="text"
                  className="w-full p-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring focus:ring-blue-500"
                  value={contributionData.referralAddress}
                  onChange={(e) =>
                    setContributionData((prev) => ({
                      ...prev,
                      referralAddress: e.target.value,
                    }))
                  }
                  placeholder="Enter referral address"
                />
              </label>
              <label>
                <span className="block mb-1">Amount (UAXION)</span>
                <input
                  type="number"
                  className="w-full p-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring focus:ring-blue-500"
                  value={contributionData.amount}
                  onChange={(e) =>
                    setContributionData((prev) => ({
                      ...prev,
                      amount: +e.target.value,
                    }))
                  }
                  placeholder="Enter contribution amount"
                />
              </label>
            </div>
            <div className="mt-6 flex items-center justify-between">
              <button
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg"
                onClick={() => setContributeModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
                onClick={()=>{
                    handleContribute(contributionData.campaignId)
                }}
                disabled={loading}
              >
                {loading ? "Processing..." : "Contribute"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RenderModals;
