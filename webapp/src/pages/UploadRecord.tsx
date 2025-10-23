import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createFile } from '../lib/dcaTx';
import { ethers } from "ethers";
import { useSnackbar } from '../hooks/useSnackbar';

export default function UploadRecord() {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    file: null as File | null,
    category: '',
  });

  const uploadToIPFS = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file, file.name);

    // Using local IPFS daemon API (default: http://localhost:5001)
    const response = await fetch("http://localhost:5001/api/v0/add?wrap-with-directory=false", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`IPFS upload failed: ${errorText}`);
    }

    const text = await response.text();
    // IPFS returns newline-delimited JSON, get the last line
    const lines = text.trim().split('\n');
    const data = JSON.parse(lines[lines.length - 1]);
    return data.Hash; // Returns the CID
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.file) {
      alert('Please select a file');
      return;
    }

    setLoading(true);
    try {
      // 1. Upload file to IPFS
      console.log('Uploading to IPFS...');
      const cid = await uploadToIPFS(formData.file);
      console.log('IPFS CID:', cid);

      // 2. Use CID as fileId
      const fileId = ethers.id(cid);

      // 3. Create metadata JSON
      const metadata = JSON.stringify({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        fileName: formData.file.name,
        fileSize: formData.file.size,
        fileType: formData.file.type,
        timestamp: Date.now(),
      });

      // 4. Call contract
      console.log('Creating file on blockchain...');
      const result = await createFile(fileId, cid, metadata);
      console.log('Transaction hash:', result.hash);

      showSnackbar("Registered successfully", "tx-success", result.hash);
      navigate('/records');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Error uploading:', error);
      showSnackbar(`failed to register ${error.message || JSON.stringify(error)}`, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">📤 Upload New Record</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 rounded-2xl p-8 space-y-6"
      >
        <div>
          <label className="block text-sm font-medium mb-2">Title</label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="e.g., Medical Report 2025"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            required
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            rows={4}
            placeholder="Describe the file..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Category</label>
          <select
            required
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
            className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">Select category</option>
            <option value="medical">Medical</option>
            <option value="legal">Legal</option>
            <option value="financial">Financial</option>
            <option value="research">Research</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">File</label>
          <input
            type="file"
            required
            onChange={(e) =>
              setFormData({ ...formData, file: e.target.files?.[0] || null })
            }
            className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 py-3 rounded-lg font-semibold transition"
        >
          {loading ? 'Uploading...' : 'Upload Record'}
        </button>
      </form>
    </div>
  );
}
