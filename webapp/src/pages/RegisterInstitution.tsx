import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerInstitution } from "../lib/dcaTx";
import { useSnackbar } from "../hooks/useSnackbar";

export default function RegisterInstitution() {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    contactInfo: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await registerInstitution(
        formData.name,
        formData.description,
        formData.contactInfo
      );
      console.log("Institution registered:", result.hash);
      showSnackbar("Registered successfully", "tx-success", result.hash);
      navigate("/");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Error registering:", error);
      showSnackbar(`failed to register ${error.message || JSON.stringify(error)}`, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">🏢 Register as Institution</h1>
      
      <form onSubmit={handleSubmit} className="bg-gray-800 rounded-2xl p-8 space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Institution Name</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="e.g., City General Hospital"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            required
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            rows={4}
            placeholder="Brief description of your institution..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Contact Information</label>
          <input
            type="text"
            required
            value={formData.contactInfo}
            onChange={(e) => setFormData({ ...formData, contactInfo: e.target.value })}
            className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Email, phone, or website"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 py-3 rounded-lg font-semibold transition"
        >
          {loading ? "Registering..." : "Register Institution"}
        </button>
      </form>
    </div>
  );
}