import { Building2, User, CheckCircle2 } from 'lucide-react';

const SelectRole = ({
  role,
  setRole,
}: {
  role: string;
  setRole: (role: string) => void;
}) => {
  return (
    <div className="min-h-screen flex items-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div>
        {/* Registration Cards */}
        <div className="flex gap-6 justify-center">
          {/* Institution Registration */}
          <div className="w-[30%] bg-gradient-to-br from-slate-800/80 to-slate-800/40 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-slate-700/50 hover:border-blue-500/50 transition-all group">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl mb-6 group-hover:scale-110 transition-transform">
                <Building2 size={40} className="text-white" />
              </div>

              <h3 className="text-2xl font-bold text-white mb-3">
                Register as Institution
              </h3>

              <p className="text-slate-400 mb-6 leading-relaxed">
                Perfect for hospitals, universities, government bodies, and
                organizations that need to manage and share records securely.
              </p>

              <ul className="text-left text-slate-300 space-y-2 mb-8">
                <li className="flex items-start gap-2">
                  <CheckCircle2
                    size={20}
                    className="text-green-400 mt-0.5 flex-shrink-0"
                  />
                  <span>Manage multiple records</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2
                    size={20}
                    className="text-green-400 mt-0.5 flex-shrink-0"
                  />
                  <span>Share with users securely</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2
                    size={20}
                    className="text-green-400 mt-0.5 flex-shrink-0"
                  />
                  <span>Institutional verification</span>
                </li>
              </ul>

              <button
                onClick={() => setRole('institution')}
                disabled={role !== ''}
                className="w-full py-4 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-lg hover:shadow-orange-500/25 transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
              >
                {role === 'institution' ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Registering...
                  </>
                ) : (
                  'Register as Institution'
                )}
              </button>
            </div>
          </div>

          {/* User Registration */}
          <div className="w-[30%] bg-gradient-to-br from-slate-800/80 to-slate-800/40 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-slate-700/50 hover:border-purple-500/50 transition-all group">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-6 group-hover:scale-110 transition-transform">
                <User size={40} className="text-white" />
              </div>

              <h3 className="text-2xl font-bold text-white mb-3">
                Register as User
              </h3>

              <p className="text-slate-400 mb-6 leading-relaxed">
                Ideal for individuals who want to securely store, access, and
                manage their personal records and documents.
              </p>

              <ul className="text-left text-slate-300 space-y-2 mb-8">
                <li className="flex items-start gap-2">
                  <CheckCircle2
                    size={20}
                    className="text-green-400 mt-0.5 flex-shrink-0"
                  />
                  <span>Upload personal records</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2
                    size={20}
                    className="text-green-400 mt-0.5 flex-shrink-0"
                  />
                  <span>Access shared documents</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2
                    size={20}
                    className="text-green-400 mt-0.5 flex-shrink-0"
                  />
                  <span>Control your data</span>
                </li>
              </ul>

              <button
                onClick={() => setRole('user')}
                disabled={role !== ''}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-lg hover:shadow-purple-500/25 transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
              >
                {role === 'user' ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Registering...
                  </>
                ) : (
                  'Register as User'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectRole;
