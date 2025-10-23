/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { getInstitutions, type Institution, getFileRecipients } from '../../lib/dcaQuery';
import { grantAccess, revokeAccess } from '../../lib/dcaTx';
import { useSnackbar } from '../../hooks/useSnackbar';

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

export function FileGrid({ files }: { files: FileRecord[] }) {
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [revokeModalOpen, setRevokeModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileRecord | null>(null);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [sharedInstitutions, setSharedInstitutions] = useState<Institution[]>([]);
  const [alreadySharedAddresses, setAlreadySharedAddresses] = useState<Set<string>>(new Set());
  const [selectedInstitutions, setSelectedInstitutions] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [revoking, setRevoking] = useState(false);
  const { showSnackbar } = useSnackbar();


  if (files.length === 0) return <EmptyState message="No files found." />;

  const formatDate = (file: FileRecord) => {
    if (file.uploadDate) return file.uploadDate;
    if (file.timestamp) {
      return new Date(file.timestamp).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
    return 'Unknown';
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getCategoryColor = (category?: string) => {
    const colors: Record<string, string> = {
      medical: 'bg-red-500/20 text-red-300 border-red-500/30',
      legal: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      financial: 'bg-green-500/20 text-green-300 border-green-500/30',
      research: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    };
    return colors[category?.toLowerCase() || ''] || 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  };

  const getCategoryIcon = (category?: string) => {
    const icons: Record<string, string> = {
      medical: '🏥',
      legal: '⚖️',
      financial: '💰',
      research: '🔬',
    };
    return icons[category?.toLowerCase() || ''] || '📄';
  };

  const handleShareClick = async (file: FileRecord) => {
    if (!file.id) {
      alert('File ID not found');
      return;
    }

    setSelectedFile(file);
    setShareModalOpen(true);
    setLoading(true);
    setSelectedInstitutions(new Set());

    try {
      // Fetch all institutions
      const institutionsList = await getInstitutions();
      
      // Fetch recipients who already have access
      const recipients = await getFileRecipients(file.id);
      const recipientSet = new Set(recipients.map(addr => addr.toLowerCase()));
      console.log("ree....", recipientSet)
      
      setInstitutions(institutionsList);
      setAlreadySharedAddresses(recipientSet);
      
      // Auto-select already shared institutions
      setSelectedInstitutions(recipientSet);
    } catch (error: any) {
      console.error('Error fetching institutions:', error);
      showSnackbar(`failed to load institutions ${error.message || JSON.stringify(error)}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeClick = async (file: FileRecord) => {
    if (!file.id) {
      alert('File ID not found');
      return;
    }

    setSelectedFile(file);
    setRevokeModalOpen(true);
    setLoading(true);
    setSelectedInstitutions(new Set());

    try {
      // Fetch all institutions
      const institutionsList = await getInstitutions();
      
      // Fetch recipients who have access
      const recipients = await getFileRecipients(file.id);
      
      // Filter institutions to show only those who have access
      const sharedInsts = institutionsList.filter(inst =>
        recipients.some(addr => addr.toLowerCase() === inst.account.toLowerCase())
      );
      
      setSharedInstitutions(sharedInsts);
    } catch (error: any) {
      console.error('Error fetching shared institutions:', error);
      showSnackbar(`failed to load institutions ${error.message || JSON.stringify(error)}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleInstitutionToggle = (address: string) => {
    setSelectedInstitutions(prev => {
      const newSet = new Set(prev);
      const lowerAddress = address.toLowerCase();
      
      // Don't allow deselecting already shared institutions in share modal
      if (shareModalOpen && alreadySharedAddresses.has(lowerAddress)) {
        return prev;
      }
      
      if (newSet.has(lowerAddress)) {
        newSet.delete(lowerAddress);
      } else {
        newSet.add(lowerAddress);
      }
      return newSet;
    });
  };

  const handleShareConfirm = async () => {
    if (!selectedFile || !selectedFile.id || selectedInstitutions.size === 0) {
      alert('Please select at least one institution');
      return;
    }

    // Filter out already shared addresses
    const newInstitutions = Array.from(selectedInstitutions).filter(
      addr => !alreadySharedAddresses.has(addr)
    );

    if (newInstitutions.length === 0) {
      alert('All selected institutions already have access');
      return;
    }

    setSharing(true);
    try {
      const fileId = selectedFile.id;
      const promises = newInstitutions.map(address =>
        grantAccess(fileId, address)
      );

      await Promise.all(promises);
      showSnackbar("shared successfully with", "tx-success", String(newInstitutions.length));
      setShareModalOpen(false);
      setSelectedFile(null);
      setSelectedInstitutions(new Set());
      setAlreadySharedAddresses(new Set());
    } catch (error: any) {
      console.error('Error sharing file:', error);
      showSnackbar(`failed to share ${error.message || JSON.stringify(error)}`, "error");
    } finally {
      setSharing(false);
    }
  };

  const handleRevokeConfirm = async () => {
    if (!selectedFile || !selectedFile.id || selectedInstitutions.size === 0) {
      alert('Please select at least one institution to revoke');
      return;
    }

    setRevoking(true);
    try {
      const fileId = selectedFile.id;
      const promises = Array.from(selectedInstitutions).map(address =>
        revokeAccess(fileId, address)
      );

      await Promise.all(promises);
      showSnackbar("Successfully revoked access from", "tx-success", String(selectedInstitutions.size));
      setRevokeModalOpen(false);
      setSelectedFile(null);
      setSelectedInstitutions(new Set());
    } catch (error: any) {
      console.error('Error revoking access:', error);
      showSnackbar(`failed to revoke access ${error.message || JSON.stringify(error)}`, "error");
    } finally {
      setRevoking(false);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {files.map((file, idx) => (
          <div
            key={idx}
            className="group relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-gray-700/50 hover:border-blue-500/50 hover:-translate-y-1"
          >
            {/* Category Badge */}
            {file.category && (
              <div className="absolute top-4 right-4">
                <span className={`text-xs px-3 py-1 rounded-full border ${getCategoryColor(file.category)} font-medium`}>
                  {getCategoryIcon(file.category)} {file.category}
                </span>
              </div>
            )}

            {/* File Icon */}
            <div className="mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-2xl shadow-lg">
                📄
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 mb-4">
              <h3 className="text-xl font-bold mb-2 text-white group-hover:text-blue-400 transition-colors line-clamp-1">
                {file.title}
              </h3>
              <p className="text-sm text-gray-400 mb-4 line-clamp-2 leading-relaxed">
                {file.description}
              </p>

              {/* Metadata Grid */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 text-gray-400">
                  <span className="text-base">📅</span>
                  <span>{formatDate(file)}</span>
                </div>
                
                {file.sharedWith !== undefined && (
                  <div className="flex items-center gap-2 text-gray-400">
                    <span className="text-base">👥</span>
                    <span>{file.sharedWith} {file.sharedWith === 1 ? 'recipient' : 'recipients'}</span>
                  </div>
                )}

                {file.fileName && (
                  <div className="flex items-center gap-2 text-gray-400">
                    <span className="text-base">📎</span>
                    <span className="truncate">{file.fileName}</span>
                  </div>
                )}

                {file.fileSize && (
                  <div className="flex items-center gap-2 text-gray-400">
                    <span className="text-base">💾</span>
                    <span>{formatFileSize(file.fileSize)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* CID Display */}
            <div className="mb-4 p-3 bg-gray-900/50 rounded-lg border border-gray-700/50">
              <p className="text-xs text-gray-500 mb-1">IPFS CID</p>
              <p className="text-xs font-mono text-gray-300 truncate">{file.cid}</p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              {/* Primary Button - View on IPFS */}
              <button
                onClick={() => window.open(`https://ipfs.io/ipfs/${file.cid}`, "_blank")}
                className="w-full px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-sm"
              >
                <span>View on IPFS</span>
                <svg 
                  className="w-3.5 h-3.5" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </button>

              {/* Secondary Buttons - Share & Revoke */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleShareClick(file)}
                  className="px-3 py-2 bg-gray-700/50 hover:bg-green-600/50 border border-gray-600/50 hover:border-green-500/50 text-gray-300 hover:text-green-300 font-medium rounded-lg transition-all duration-300 flex items-center justify-center gap-1.5 text-xs"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  <span>Share</span>
                </button>

                <button
                  onClick={() => handleRevokeClick(file)}
                  className="px-3 py-2 bg-gray-700/50 hover:bg-red-600/50 border border-gray-600/50 hover:border-red-500/50 text-gray-300 hover:text-red-300 font-medium rounded-lg transition-all duration-300 flex items-center justify-center gap-1.5 text-xs"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                  <span>Revoke</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Share Modal */}
      {shareModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden border border-gray-700">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                  <span>🔗</span> Share File
                </h3>
                <button
                  onClick={() => setShareModalOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {selectedFile && (
                <p className="text-sm text-gray-400 mt-2">
                  Sharing: <span className="text-blue-400 font-medium">{selectedFile.title}</span>
                </p>
              )}
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[50vh]">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
                  <span className="ml-3 text-gray-400">Loading institutions...</span>
                </div>
              ) : institutions.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <p>No institutions found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {institutions.map((institution, idx) => {
                    const isAlreadyShared = alreadySharedAddresses.has(institution.account.toLowerCase());
                    return (
                      <label
                        key={idx}
                        className={`flex items-start gap-3 p-4 rounded-lg border transition-all ${
                          isAlreadyShared
                            ? 'bg-green-900/20 border-green-600/50 cursor-not-allowed'
                            : 'bg-gray-700/30 hover:bg-gray-700/50 border-gray-600/50 cursor-pointer'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedInstitutions.has(institution.account.toLowerCase())}
                          onChange={() => handleInstitutionToggle(institution.account)}
                          disabled={isAlreadyShared}
                          className="mt-1 w-5 h-5 rounded border-gray-600 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white">{institution.name}</span>
                            {isAlreadyShared && (
                              <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-300 rounded-full border border-green-500/30">
                                Already Shared
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-400 mt-1">{institution.description}</div>
                          <div className="text-xs text-gray-500 mt-2 font-mono">{institution.account}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-700 flex items-center justify-between">
              <p className="text-sm text-gray-400">
                {selectedInstitutions.size - alreadySharedAddresses.size} new institution{selectedInstitutions.size - alreadySharedAddresses.size !== 1 ? 's' : ''} selected
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShareModalOpen(false)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleShareConfirm}
                  disabled={selectedInstitutions.size === 0 || sharing || selectedInstitutions.size === alreadySharedAddresses.size}
                  className="px-6 py-2 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 disabled:from-gray-600 disabled:to-gray-600 text-white font-semibold rounded-lg transition-all flex items-center gap-2"
                >
                  {sharing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Sharing...</span>
                    </>
                  ) : (
                    <>
                      <span>Share</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Revoke Modal */}
      {revokeModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden border border-gray-700">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                  <span>🚫</span> Revoke Access
                </h3>
                <button
                  onClick={() => setRevokeModalOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {selectedFile && (
                <p className="text-sm text-gray-400 mt-2">
                  Revoking access for: <span className="text-red-400 font-medium">{selectedFile.title}</span>
                </p>
              )}
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[50vh]">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-500"></div>
                  <span className="ml-3 text-gray-400">Loading shared institutions...</span>
                </div>
              ) : sharedInstitutions.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <p>No institutions have access to this file</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sharedInstitutions.map((institution, idx) => (
                    <label
                      key={idx}
                      className="flex items-start gap-3 p-4 bg-red-900/20 hover:bg-red-900/30 rounded-lg border border-red-600/50 cursor-pointer transition-all"
                    >
                      <input
                        type="checkbox"
                        checked={selectedInstitutions.has(institution.account.toLowerCase())}
                        onChange={() => handleInstitutionToggle(institution.account)}
                        className="mt-1 w-5 h-5 rounded border-red-600 text-red-600 focus:ring-2 focus:ring-red-500 focus:ring-offset-0 focus:ring-offset-gray-800"
                      />
                      <div className="flex-1">
                        <div className="font-semibold text-white">{institution.name}</div>
                        <div className="text-sm text-gray-400 mt-1">{institution.description}</div>
                        <div className="text-xs text-gray-500 mt-2 font-mono">{institution.account}</div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-700 flex items-center justify-between">
              <p className="text-sm text-gray-400">
                {selectedInstitutions.size} institution{selectedInstitutions.size !== 1 ? 's' : ''} selected for revocation
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setRevokeModalOpen(false)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRevokeConfirm}
                  disabled={selectedInstitutions.size === 0 || revoking}
                  className="px-6 py-2 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 disabled:from-gray-600 disabled:to-gray-600 text-white font-semibold rounded-lg transition-all flex items-center gap-2"
                >
                  {revoking ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Revoking...</span>
                    </>
                  ) : (
                    <>
                      <span>Revoke Access</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-gray-700/50 rounded-2xl bg-gray-800/20 backdrop-blur-sm">
      <div className="w-20 h-20 bg-gray-800/50 rounded-full flex items-center justify-center mb-4 text-4xl">
        📁
      </div>
      <p className="text-gray-400 text-lg font-medium">{message}</p>
      <p className="text-gray-500 text-sm mt-2">Upload your first record to get started</p>
    </div>
  );
}










