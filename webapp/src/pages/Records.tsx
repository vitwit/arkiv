import { useState, useEffect } from "react";
import { FileGrid } from "../components/ui/FileGrid";
import { useWalletStore } from "../store/walletStore";
import { getFilesByOwner, getFileCid, getFileMetadata } from "../lib/dcaQuery";

export default function Records() {
  const { account } = useWalletStore();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchFiles = async () => {
      if (!account) return;
      setLoading(true);

      try {
        // 1️⃣ Get all file IDs owned by the connected wallet
        const fileIds: string[] = await getFilesByOwner(account);

        if (!fileIds || fileIds.length === 0) {
          setFiles([]);
          setLoading(false);
          return;
        }

        // 2️⃣ Fetch CID + metadata for each file
        const fileData = await Promise.all(
          fileIds.map(async (fid: string) => {
            try {
              const cid = await getFileCid(fid);
              const metadataStr = await getFileMetadata(fid);

              if (!metadataStr) return null;

              let metadata;
              try {
                metadata = JSON.parse(metadataStr);
              } catch {
                metadata = { name: "Unknown File", description: metadataStr };
              }

              return {
                id: fid,
                cid,
                ...metadata,
              };
            } catch (err) {
              console.error(`Error fetching data for file ${fid}:`, err);
              return null;
            }
          })
        );

        // 3️⃣ Filter out null entries and update state
        setFiles(fileData.filter(Boolean));
      } catch (err) {
        console.error("Failed to fetch records:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, [account]);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">📁 My Records</h1>

      {loading ? (
        <p>Loading records...</p>
      ) : files.length === 0 ? (
        <p>No records found.</p>
      ) : (
        <FileGrid files={files} />
      )}
    </div>
  );
}
