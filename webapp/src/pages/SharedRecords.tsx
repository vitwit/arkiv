import { useState, useEffect } from 'react';
import { FileGrid } from '../components/ui/FileGrid';
import { useWalletStore } from '../store/walletStore';
import { getAllFiles, getFileDetails } from '../lib/dcaQuery';

interface FileRecord {
  cid: string;
  title: string;
  description: string;
  uploadDate?: string;
  timestamp?: number;
  sharedWith?: number;
  category?: string;
  fileName?: string;
  fileSize?: number;
  id?: string;
}

export default function SharedRecords() {
  const { account } = useWalletStore();
  const [sharedFiles, setSharedFiles] = useState<FileRecord[]>([]);
  const [loadingShared, setLoadingShared] = useState(false);

  useEffect(() => {
    const fetchSharedFiles = async () => {
      if (!account) return;

      setLoadingShared(true);
      try {
        // Get all files from the contract
        const allFileIds: string[] = await getAllFiles();

        if (!allFileIds || allFileIds.length === 0) {
          setSharedFiles([]);
          return;
        }

        // Check each file to see if current user is in recipients list
        const sharedFileData = await Promise.all(
          allFileIds.map(async (fileId: string) => {
            try {
              const fileDetails = await getFileDetails(fileId);

              if (!fileDetails) return null;

              // Check if current account is in the recipients list
              const isRecipient = fileDetails.recipients.some(
                (recipient: string) =>
                  recipient.toLowerCase() === account.toLowerCase()
              );

              // Only include files where user is a recipient (and not the owner)
              if (
                isRecipient &&
                fileDetails.owner.toLowerCase() !== account.toLowerCase()
              ) {
                const metadataStr = fileDetails.metadata;
                let metadata;

                try {
                  metadata = JSON.parse(metadataStr);
                } catch {
                  metadata = {
                    title: 'Shared File',
                    description: metadataStr,
                  };
                }

                return {
                  id: fileId,
                  cid: fileDetails.cid,
                  ...metadata,
                  sharedWith: fileDetails.recipients.length,
                };
              }

              return null;
            } catch (err) {
              console.error(
                `Error checking file ${fileId} for shared access:`,
                err
              );
              return null;
            }
          })
        );

        // Filter out null values and set shared files
        setSharedFiles(sharedFileData.filter(Boolean) as FileRecord[]);
      } catch (err) {
        console.error('Failed to fetch shared files:', err);
        setSharedFiles([]);
      } finally {
        setLoadingShared(false);
      }
    };

    fetchSharedFiles();
  }, [account]);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">🔗 Records Shared With Me</h1>
      {loadingShared ? (
        <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-400">Loading shared files...</span>
      </div>
      ) : (
        <FileGrid files={sharedFiles} isSharedWithMe={true} />
      )}
    </div>
  );
}
