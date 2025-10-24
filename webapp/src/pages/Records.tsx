import { useState, useEffect } from 'react';
import { FileGrid } from '../components/ui/FileGrid';
import { useWalletStore } from '../store/walletStore';
import { getFilesByOwner, getFileCid, getFileMetadata } from '../lib/dcaQuery';

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
                metadata = { name: 'Unknown File', description: metadataStr };
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
        console.error('Failed to fetch records:', err);
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
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-400">Loading records...</span>
        </div>
      ) : files.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-gray-700/50 rounded-2xl bg-gray-800/20 backdrop-blur-sm">
            <div className="w-20 h-20 bg-gray-800/50 rounded-full flex items-center justify-center mb-4 text-4xl">
              📁
            </div>
            <p className="text-gray-400 text-lg font-medium">No files found</p>
            <p className="text-gray-500 text-sm mt-2">Upload your first record to get started</p>
          </div>
      ) : (
        <FileGrid files={files} />
      )}
    </div>
  );
}
