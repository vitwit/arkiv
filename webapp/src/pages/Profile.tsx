import { useState, useEffect } from "react";
import { useWalletStore } from "../store/walletStore";
import { getInstitutionDetails } from "../lib/dcaQuery";

export default function Profile() {
  const { account, ensName } = useWalletStore();
  const [institution, setInstitution] = useState(null);

  useEffect(() => {
    if (account) {
      getInstitutionDetails(account).then(setInstitution);
    }
  }, [account]);

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">👤 My Profile</h1>
      
      <div className="bg-gray-800 rounded-2xl p-8 space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Wallet Address</label>
          <div className="px-4 py-2 bg-gray-700 rounded-lg">
            {account}
          </div>
        </div>

        {ensName && (
          <div>
            <label className="block text-sm font-medium mb-2">ENS Name</label>
            <div className="px-4 py-2 bg-gray-700 rounded-lg">
              {ensName}
            </div>
          </div>
        )}

        {institution && (
          <>
            <div>
              <label className="block text-sm font-medium mb-2">Institution Name</label>
              <div className="px-4 py-2 bg-gray-700 rounded-lg">
                {institution.name}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <div className="px-4 py-2 bg-gray-700 rounded-lg">
                {institution.description}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Contact Info</label>
              <div className="px-4 py-2 bg-gray-700 rounded-lg">
                {institution.contactInfo}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}