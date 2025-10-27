import {
  ShieldCheckIcon,
  KeyIcon,
  CloudArrowUpIcon,
  LockClosedIcon,
  UserGroupIcon,
  DocumentCheckIcon,
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br text-white">
      {/* Hero Section */}
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r text-white bg-clip-text">
            Arkiv
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Secure, decentralized storage for your medical records with
            blockchain-powered access control
          </p>
        </div>

        {/* What is Arkiv */}
        <section className="mb-20">
          <div className="bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-gray-700">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
              <ShieldCheckIcon className="w-8 h-8 text-indigo-400" />
              What is Arkiv?
            </h2>
            <p className="text-lg text-gray-300 leading-relaxed">
              Arkiv is a decentralized healthcare data management platform that
              empowers you to securely store, manage, and share your medical
              records. Built on blockchain technology and IPFS, Arkiv ensures
              that you have complete control over your sensitive health
              information while enabling seamless, secure sharing with
              healthcare institutions when you choose to grant access.
            </p>
          </div>
        </section>

        {/* How It Works */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-10 text-center">
            How Arkiv Works
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-indigo-500 transition-all">
              <div className="bg-indigo-600 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <CloudArrowUpIcon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3">
                1. Upload Your Files
              </h3>
              <p className="text-gray-400">
                Upload your medical reports, prescriptions, and health records
                to the platform.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-indigo-500 transition-all">
              <div className="bg-indigo-600 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <LockClosedIcon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3">
                2. Automatic Encryption
              </h3>
              <p className="text-gray-400">
                A unique AES encryption key is generated for your file, ensuring
                maximum security.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-indigo-500 transition-all">
              <div className="bg-indigo-600 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <KeyIcon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3">
                3. Blockchain Storage
              </h3>
              <p className="text-gray-400">
                Your encryption key is stored on-chain, while encrypted files
                are stored on IPFS.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-indigo-500 transition-all">
              <div className="bg-indigo-600 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <UserGroupIcon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3">4. Grant Access</h3>
              <p className="text-gray-400">
                Share access with healthcare institutions who can decrypt and
                view your files.
              </p>
            </div>
          </div>
        </section>

        {/* Technical Process */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-10 text-center">
            Technical Architecture
          </h2>
          <div className="bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-gray-700">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="bg-indigo-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                  1
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">
                    File Upload & Key Generation
                  </h3>
                  <p className="text-gray-400">
                    When you upload a file, Arkiv generates a unique AES-256
                    encryption key specifically for that file.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-indigo-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                  2
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">
                    File Encryption
                  </h3>
                  <p className="text-gray-400">
                    Your file is encrypted using the AES key, ensuring that only
                    authorized parties can decrypt and view the content.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-indigo-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                  3
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">
                    Decentralized Storage
                  </h3>
                  <p className="text-gray-400">
                    The encrypted file is stored on IPFS (InterPlanetary File
                    System), while the encryption key is securely stored on the
                    blockchain.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-indigo-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                  4
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Access Control</h3>
                  <p className="text-gray-400">
                    You can grant access to registered healthcare institutions.
                    When access is granted, the institution receives the
                    encryption key from the blockchain.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-indigo-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                  5
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">
                    File Retrieval & Decryption
                  </h3>
                  <p className="text-gray-400">
                    Authorized institutions fetch the encrypted file from IPFS,
                    decrypt it using the key, and can view or download your
                    medical records.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-indigo-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                  6
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">
                    Revoke Access Anytime
                  </h3>
                  <p className="text-gray-400">
                    You maintain full control and can revoke access from any
                    institution at any time, ensuring your privacy is always
                    protected.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Key Features */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-10 text-center">Key Features</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <ShieldCheckIcon className="w-10 h-10 text-indigo-400 mb-4" />
              <h3 className="text-xl font-semibold mb-3">
                End-to-End Encryption
              </h3>
              <p className="text-gray-400">
                AES encryption ensures your medical data remains secure and
                private.
              </p>
            </div>

            <div className="bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <DocumentCheckIcon className="w-10 h-10 text-indigo-400 mb-4" />
              <h3 className="text-xl font-semibold mb-3">You Own Your Data</h3>
              <p className="text-gray-400">
                Complete control over who can access your medical records and
                for how long.
              </p>
            </div>

            <div className="bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <KeyIcon className="w-10 h-10 text-indigo-400 mb-4" />
              <h3 className="text-xl font-semibold mb-3">
                Blockchain Security
              </h3>
              <p className="text-gray-400">
                Immutable access logs and tamper-proof key storage on the
                blockchain.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-12 shadow-2xl">
            <h2 className="text-3xl font-bold mb-4">
              Take Control of Your Health Data
            </h2>
            <p className="text-lg text-indigo-100 mb-8 max-w-2xl mx-auto">
              Join Arkiv today and experience the future of secure,
              decentralized healthcare data management.
            </p>
            <Link
              to="/"
              className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105"
            >
              Get Started
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
