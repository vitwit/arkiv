import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import NavBar from './components/layout/Navbar';
import QuickActions from './components/ui/QuickActions';
import { FileGrid } from './components/ui/FileGrid';
import { useWalletStore } from './store/walletStore';
import RegisterInstitution from './pages/RegisterInstitution';
import UploadRecord from './pages/UploadRecord';
import Records from './pages/Records';
import SharedRecords from './pages/SharedRecords';
import Profile from './pages/Profile';
import {
  getFilesByOwner,
  getFileCid,
  getFileMetadata,
  getAllFiles,
  getFileDetails,
} from './lib/dcaQuery';
import About from './pages/About';

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

function Dashboard() {
  const { account } = useWalletStore();
  const [myFiles, setMyFiles] = useState<FileRecord[]>([]);
  const [sharedFiles, setSharedFiles] = useState<FileRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingShared, setLoadingShared] = useState(false);

  useEffect(() => {
    const fetchFiles = async () => {
      if (!account) return;

      setLoading(true);
      try {
        // Fetch user's own files
        const fileIds: string[] = await getFilesByOwner(account);

        if (fileIds && fileIds.length > 0) {
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
                  metadata = {
                    title: 'Unknown File',
                    description: metadataStr,
                  };
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

          setMyFiles(fileData.filter(Boolean) as FileRecord[]);
        } else {
          setMyFiles([]);
        }
      } catch (err) {
        console.error('Failed to fetch files:', err);
        setMyFiles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, [account]);

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

  if (!account) {
    return (
      <div className="text-center mt-20 text-gray-300">
        🔐 Please connect your wallet to continue.
      </div>
    );
  }

  return (
    <>
      <QuickActions role="user" />

      <section className="mb-16">
        <h2 className="text-2xl font-semibold mb-6">📁 My Files</h2>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-gray-400">Loading your files...</span>
          </div>
        ) : myFiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-gray-700/50 rounded-2xl bg-gray-800/20 backdrop-blur-sm">
            <div className="w-20 h-20 bg-gray-800/50 rounded-full flex items-center justify-center mb-4 text-4xl">
              📁
            </div>
            <p className="text-gray-400 text-lg font-medium">No files found</p>
            <p className="text-gray-500 text-sm mt-2">
              Upload your first record to get started
            </p>
          </div>
        ) : (
          <FileGrid files={myFiles} />
        )}
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-6">🔗 Shared With Me</h2>
        {loadingShared ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-gray-400">Loading shared files...</span>
          </div>
        ) : sharedFiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-gray-700/50 rounded-2xl bg-gray-800/20 backdrop-blur-sm">
            <div className="w-20 h-20 bg-gray-800/50 rounded-full flex items-center justify-center mb-4 text-4xl">
              🔗
            </div>
            <p className="text-gray-400 text-lg font-medium">No shared files</p>
            <p className="text-gray-500 text-sm mt-2">
              Files shared with you will appear here
            </p>
          </div>
        ) : (
          <FileGrid files={sharedFiles} isSharedWithMe={true} />
        )}
      </section>
    </>
  );
}

export default function DashboardPage() {
  const { account } = useWalletStore();
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <NavBar />

      {account ? (
        <main className="px-6 py-10">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/upload" element={<UploadRecord />} />
            <Route path="/records" element={<Records />} />
            <Route path="/user-shared" element={<SharedRecords />} />
            <Route path="/profile" element={<Profile />} />
            <Route
              path="/register-institution"
              element={<RegisterInstitution />}
            />
            <Route path="/about" element={<About />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      ) : (
        <div className="text-center mt-20 text-gray-300">
          🔐 Please connect your wallet to continue.
        </div>
      )}
    </div>
  );
}
