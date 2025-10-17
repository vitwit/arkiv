import { useEffect, useState } from "react";
import NavBar from "./components/layout/Navbar";
import QuickActions from "./components/ui/QuickActions";
import { FileGrid } from "./components/ui/FileGrid";
import { useWalletStore } from "./store/walletStore";

interface FileRecord {
  cid: string;
  title: string;
  description: string;
  uploadDate: string;
  sharedWith: number;
}

export default function DashboardPage() {
  const { account, ensName } = useWalletStore();
  const [myFiles, setMyFiles] = useState<FileRecord[]>([]);
  const [sharedFiles, setSharedFiles] = useState<FileRecord[]>([]);

  useEffect(() => {
    if (account) {
      // TODO: Replace with contract calls
      setMyFiles([
        {
          cid: "bafybeia123...",
          title: "Patient Report - 2025",
          description: "Encrypted patient test results",
          uploadDate: "2025-09-20",
          sharedWith: 2,
        },
      ]);
      setSharedFiles([
        {
          cid: "bafybeib456...",
          title: "Confidential Research.pdf",
          description: "Access granted by MedLab",
          uploadDate: "2025-09-18",
          sharedWith: 1,
        },
      ]);
    }
  }, [account]);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <NavBar />

      <main className="px-6 py-10">
        {!account? (
          <div className="text-center mt-20 text-gray-300">
            🔐 Please connect your wallet to continue.
          </div>
        ) : (
          <>
            <QuickActions role="user"/>
            <section className="mb-16">
              <h2 className="text-2xl font-semibold mb-6">📁 My Files</h2>
              <FileGrid files={myFiles} />
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-6">🔗 Shared With Me</h2>
              <FileGrid files={sharedFiles} />
            </section>
          </>
        )}
      </main>
    </div>
  );
}
