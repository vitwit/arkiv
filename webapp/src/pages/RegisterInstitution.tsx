import { useState } from "react";
import NavBar from "../components/layout/Navbar";

export default function RegisterInstitutionPage() {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [contactInfo, setContactInfo] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            // TODO: Send to smart contract
            // Example: await contract.registerInstitution({ name, description, contactInfo, account: userAddress })

            alert("Institution registration submitted!");
            setName("");
            setDescription("");
            setContactInfo("");
        } catch (err) {
            console.error(err);
            alert("Registration failed!");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-700 text-white">
            <NavBar />
            <main className="max-w-xl mx-auto p-6">
                <h2 className="text-2xl font-semibold mb-6">Register as Institution</h2>
                <form
                    onSubmit={handleSubmit}
                    className="bg-gray-800 bg-opacity-70 p-6 rounded-2xl shadow-md flex flex-col gap-4"
                >
                    <label className="flex flex-col">
                        <span className="mb-1">Institution Name</span>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="px-3 py-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                    </label>

                    <label className="flex flex-col">
                        <span className="mb-1">Description</span>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                            className="px-3 py-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                    </label>

                    <label className="flex flex-col">
                        <span className="mb-1">Contact Info</span>
                        <input
                            type="text"
                            value={contactInfo}
                            onChange={(e) => setContactInfo(e.target.value)}
                            placeholder="Email, phone, website"
                            required
                            className="px-3 py-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                    </label>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="mt-4 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-semibold transition"
                    >
                        {submitting ? "Submitting..." : "Register"}
                    </button>
                </form>
            </main>
        </div>
    );
}
