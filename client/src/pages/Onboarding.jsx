// ── Onboarding.jsx ────────────────────────────────────────────────────────
// Collects username / display name / bio, generates an E2EE keypair,
// and saves the profile to the backend.

import { useState } from 'react';
import { saveUserProfile }  from '../lib/api';

export default function Onboarding({ clerkUser, onComplete }) {
  const [username, setUsername] = useState(
    clerkUser?.username ||
    (clerkUser?.firstName ? clerkUser.firstName.toLowerCase() + Math.floor(Math.random() * 1000) : '')
  );
  const [displayName, setDisplayName] = useState(
    (clerkUser?.firstName || '') + (clerkUser?.lastName ? ' ' + clerkUser.lastName : '')
  );
  const [bio, setBio]           = useState('');
  const [error, setError]       = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (username.trim().length < 3) {
      setError('Username must be at least 3 characters.');
      return;
    }

    setIsLoading(true);

    try {
      const { data: savedProfile } = await saveUserProfile({
        clerkId:     clerkUser.id,
        username:    username.trim().toLowerCase(),
        displayName: displayName.trim(),
        bio:         bio.trim(),
        email:       clerkUser.primaryEmailAddress?.emailAddress || '',
        avatarUrl:   clerkUser.imageUrl || '',
        timezone:    Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
      });

      localStorage.setItem(`user_profile_${clerkUser.id}`, JSON.stringify(savedProfile));
      onComplete?.(savedProfile);
    } catch (err) {
      console.error('Error creating user profile:', err);
      setError(err.response?.data?.message || 'Failed to connect to the backend server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#eae6df] flex flex-col items-center relative overflow-hidden font-sans">
      <div className="absolute top-0 left-0 w-full h-[222px] bg-[#00a884] z-0" />

      <div className="w-full max-w-[500px] mt-[64px] z-10 px-4 flex flex-col items-center">
        {/* Brand */}
        <div className="flex items-center gap-3 mb-6 text-white">
          <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center font-bold text-white text-xl border border-white/20">
            RT
          </div>
          <span className="text-xl font-bold tracking-wider uppercase text-white">Real-Time Chat App</span>
        </div>

        {/* Card */}
        <div className="w-full bg-white rounded-md shadow-[0_17px_50px_0_rgba(0,0,0,0.19)] border border-[#e1e9eb] p-8 flex flex-col text-left">
          <div className="mb-6 space-y-1.5 border-b border-[#f0f2f5] pb-4">
            <h2 className="text-2xl font-light text-[#41525d]">Create Chat Profile</h2>
            <p className="text-sm text-[#667781]">Complete your details to start messaging</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 text-sm rounded-md flex items-center gap-2">
                <svg className="w-5 h-5 flex-shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Email (read-only) */}
            <div className="space-y-1.5 opacity-70">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#667781]">Email Address</label>
              <input
                type="text"
                disabled
                value={clerkUser?.primaryEmailAddress?.emailAddress || ''}
                className="w-full bg-[#f8f9fa] border border-[#e1e9eb] rounded-md px-4 py-2.5 text-[#667781] focus:outline-none cursor-not-allowed text-sm"
              />
            </div>

            {/* Username */}
            <div className="space-y-1.5">
              <label htmlFor="username" className="block text-xs font-semibold uppercase tracking-wider text-[#667781]">
                Choose Chat Username
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">@</span>
                <input
                  id="username"
                  type="text"
                  required
                  disabled={isLoading}
                  value={username}
                  onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                  placeholder="username"
                  className="w-full bg-white border border-[#e1e9eb] rounded-md pl-9 pr-4 py-2.5 text-[#3b4a54] placeholder-[#a3a3a3] focus:border-[#00a884] focus:ring-1 focus:ring-[#00a884]/40 transition-all disabled:opacity-50 text-sm"
                />
              </div>
            </div>

            {/* Display name */}
            <div className="space-y-1.5">
              <label htmlFor="displayName" className="block text-xs font-semibold uppercase tracking-wider text-[#667781]">
                Display Name
              </label>
              <input
                id="displayName"
                type="text"
                required
                disabled={isLoading}
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Satoshi Nakamoto"
                className="w-full bg-white border border-[#e1e9eb] rounded-md px-4 py-2.5 text-[#3b4a54] placeholder-[#a3a3a3] focus:border-[#00a884] focus:ring-1 focus:ring-[#00a884]/40 transition-all disabled:opacity-50 text-sm"
              />
            </div>

            {/* Bio */}
            <div className="space-y-1.5">
              <label htmlFor="bio" className="block text-xs font-semibold uppercase tracking-wider text-[#667781]">
                Biography / Status Message
              </label>
              <textarea
                id="bio"
                disabled={isLoading}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Available"
                className="w-full bg-white border border-[#e1e9eb] rounded-md px-4 py-2.5 text-[#3b4a54] placeholder-[#a3a3a3] focus:border-[#00a884] focus:ring-1 focus:ring-[#00a884]/40 transition-all h-20 resize-none disabled:opacity-50 text-sm"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#00a884] hover:bg-[#008f72] active:bg-[#007b61] text-white py-3 px-4 rounded-md font-semibold shadow-md transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 uppercase tracking-wider text-xs"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Completing Onboarding...</span>
                </>
              ) : (
                <span>Complete Account Setup</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
