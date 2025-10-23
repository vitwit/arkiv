import { useState, useEffect } from "react";
import { FileGrid } from "../components/ui/FileGrid";
import { useWalletStore } from "../store/walletStore";

export default function SharedRecords() {
  const { account } = useWalletStore();
  const [files, setFiles] = useState([]);

  useEffect(() => {
    if (account) {
      // TODO: Fetch shared files from contract
      setFiles([]);
    }
  }, [account]);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">🔗 Records Shared With Me</h1>
      <FileGrid files={files} />
    </div>
  );
}
