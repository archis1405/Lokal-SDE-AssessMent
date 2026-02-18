import { useState, useCallback } from 'react';
import type { Screen } from './types/auth';
import LoginScreen from './screens/LoginScreen';
import OtpScreen from './screens/OtpScreen';
import SessionScreen from './screens/SessionScreen';

export default function App() {
  const [screen, setScreen] = useState<Screen>('login');
  const [email, setEmail] = useState('');

  const handleSendOtp = useCallback((em: string) => {
    setEmail(em);
    setScreen('otp');
  }, []);

  const handleVerified = useCallback((em: string) => {
    setEmail(em);
    setScreen('session');
  }, []);

  const handleLogout = useCallback(() => {
    setEmail('');
    setScreen('login');
  }, []);

  const handleBack = useCallback(() => {
    setScreen('login');
  }, []);

  return (
    <>
      {screen === 'login' && <LoginScreen onSendOtp={handleSendOtp} />}
      {screen === 'otp' && (
        <OtpScreen
          email={email}
          onSuccess={handleVerified}
          onBack={handleBack}
        />
      )}
      {screen === 'session' && <SessionScreen email={email} onLogout={handleLogout} />}
    </>
  );
}
