// ── App.jsx ───────────────────────────────────────────────────────────────
// Root component: handles auth state and routes between Login / Onboarding / ChatDashboard.

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';

import Login         from './pages/Login';
import Onboarding    from './pages/Onboarding';
import ChatDashboard from './pages/ChatDashboard';
import LoadingScreen from './components/ui/LoadingScreen';

import { fetchUserById } from './lib/api';

function App() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [localProfile, setLocalProfile]       = useState(null);
  const [isProfileChecking, setIsProfileChecking] = useState(true);

  // Debug log on sign-in
  useEffect(() => {
    if (isSignedIn && user) {
      console.group('🔑 Clerk User Authenticated');
      console.log('ID:',    user.id);
      console.log('Email:', user.primaryEmailAddress?.emailAddress || 'n/a');
      console.log('Name:',  `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'n/a');
      console.groupEnd();
    }
  }, [isSignedIn, user]);

  // Resolve profile from localStorage cache or backend
  useEffect(() => {
    const checkProfile = async () => {
      if (!user) {
        setLocalProfile(null);
        setIsProfileChecking(true);
        return;
      }

      // 1. Try localStorage cache
      const cached = localStorage.getItem(`user_profile_${user.id}`);
      if (cached) {
        try {
          setLocalProfile(JSON.parse(cached));
          setIsProfileChecking(false);
          return;
        } catch {
          // corrupted cache — fall through to network fetch
        }
      }

      // 2. Fetch from backend
      try {
        const { data } = await fetchUserById(user.id);
        if (data) {
          setLocalProfile(data);
          localStorage.setItem(`user_profile_${user.id}`, JSON.stringify(data));
        }
      } catch (err) {
        if (err.response?.status === 404) {
          localStorage.removeItem(`user_profile_${user.id}`);
          setLocalProfile(null);
        } else {
          console.warn('Profile fetch failed (server may be offline):', err.message);
        }
      } finally {
        setIsProfileChecking(false);
      }
    };

    checkProfile();
  }, [user]);

  // ── Render states ──────────────────────────────────────────────────────
  if (!isLoaded || (isSignedIn && isProfileChecking)) {
    return <LoadingScreen message="Locating secure profile index..." />;
  }

  if (!isSignedIn) {
    return <Login />;
  }

  if (!localProfile) {
    return <Onboarding clerkUser={user} onComplete={(p) => setLocalProfile(p)} />;
  }

  return <ChatDashboard profile={localProfile} />;
}

export default App;
