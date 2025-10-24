import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
// import { createFile, storeKeyWordsBatch } from '../lib/dcatx';
import { generateAesKeyRaw, encryptFileWithAesGcm } from '../lib/crypto';
import { useSnackbar } from '../hooks/useSnackbar';
import { createFile } from '../lib/dcaTx';
import { Upload, FileText, Tag, AlignLeft } from 'lucide-react';

export default function UploadRecord() {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    file: null as File | null,
    category: '',
    recipients: [] as string[], // Ethereum addresses
  });

  // Upload encrypted file to local IPFS
  const uploadToIPFS = async (file: File): Promise<string> => {
    const form = new FormData();
    form.append('file', file, file.name);

    const res = await fetch(
      'http://localhost:5001/api/v0/add?wrap-with-directory=false',
      {
        method: 'POST',
        body: form,
      }
    );

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`IPFS upload failed: ${text}`);
    }

    const lines = (await res.text()).trim().split('\n');
    const last = JSON.parse(lines[lines.length - 1]);
    return last.Hash; // CID
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.file) return alert('Please select a file');

    setLoading(true);
    try {
      // 1. Generate AES-256 key
      const aesKey = await generateAesKeyRaw();

      // 2. Encrypt file in browser
      const { cipher, iv } = await encryptFileWithAesGcm(formData.file, aesKey);

      // 3. Upload encrypted file to IPFS
      const encryptedFile = new File([cipher], formData.file.name);
      const cid = await uploadToIPFS(encryptedFile);
      console.log('Encrypted file CID:', cid);

      // 4. Create file metadata
      const metadata = JSON.stringify({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        fileName: formData.file.name,
        fileSize: formData.file.size,
        fileType: formData.file.type,
        timestamp: Date.now(),
        iv: Array.from(iv), // store IV as array for decryption
        aesKey: Array.from(aesKey),
      });

      // 5. Register file on-chain
      const fileId = ethers.id(cid);
      await createFile(fileId, cid, metadata);
      showSnackbar('File registered on-chain', 'tx-success');

      navigate('/records');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error('Upload failed:', err);
      showSnackbar(`Error: ${err.message || JSON.stringify(err)}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
          <div className="bg-gradient-to-br rounded-xl shadow-lg">📤</div>
          Upload New Record
        </h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 space-y-6 shadow-2xl"
      >
        {/* Title Input */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
            <FileText size={16} className="text-blue-400" />
            Document Title
          </label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600/50 text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-500"
            placeholder="e.g., Medical Report 2025"
          />
        </div>

        {/* Description Textarea */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
            <AlignLeft size={16} className="text-blue-400" />
            Description
          </label>
          <textarea
            required
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600/50 text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-500 resize-none"
            rows={4}
            placeholder="Describe the file..."
          />
        </div>

        {/* Category Select */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
            <Tag size={16} className="text-blue-400" />
            Category
          </label>
          <select
            required
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
            className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600/50 text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none cursor-pointer"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239CA3AF'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 0.75rem center',
              backgroundSize: '1.5em 1.5em',
              paddingRight: '2.5rem',
            }}
          >
            <option value="">Select category</option>
            <option value="medical">Medical</option>
            <option value="legal">Legal</option>
            <option value="financial">Financial</option>
            <option value="research">Research</option>
          </select>
        </div>

        {/* File Input */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
            <Upload size={16} className="text-blue-400" />
            File Upload
          </label>
          <input
            type="file"
            required
            onChange={(e) =>
              setFormData({ ...formData, file: e.target.files?.[0] || null })
            }
            className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600/50 text-gray-300 rounded-xl focus:ring-2 focus:border-transparent outline-none transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-gray-200 file:text-black file:cursor-pointer cursor-pointer"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700   disabled:cursor-not-allowed py-4 rounded-xl font-semibold text-white transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 text-lg"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Uploading...
            </>
          ) : (
            <>
              <Upload size={20} />
              Upload Record
            </>
          )}
        </button>
      </form>
    </div>
  );
}
