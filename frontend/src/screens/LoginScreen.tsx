import { useState, useMemo, useCallback, FormEvent } from 'react';
import { sendOtp } from '../services/otpManager';

interface Props {
  onSendOtp: (email: string) => void;
}

export default function LoginScreen({ onSendOtp }: Props) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isValidEmail = useMemo(
    () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()),
    [email]
  );

  const handleSubmit = useCallback(
    async (e?: FormEvent) => {
      e?.preventDefault();
      
      if (!isValidEmail) {
        setError('Please enter a valid email address.');
        return;
      }

      setLoading(true);
      setError('');

      try {
        const result = await sendOtp(email.trim().toLowerCase());
        
        if (result.success) {
          onSendOtp(email.trim().toLowerCase());
        } else {
          setError(result.message || 'Failed to send OTP.');
        }
      } catch {
        setError('Cannot reach server. Check backend is running.');
      } finally {
        setLoading(false);
      }
    },
    [email, isValidEmail, onSendOtp]
  );

  return (
    <div className="screen">
      <div className="card">
        <div className="brand">
          <div className="brand-dot" />
          <span>LOKAL</span>
        </div>

        <h1 className="heading">Sign in</h1>
        <p className="subtext">
          Enter your email — we'll send you a one-time code.
        </p>

        <form onSubmit={handleSubmit} className="field-group">
          <label className="field-label">Email address</label>
          <input
            type="email"
            className="field-input"
            placeholder="you@example.com"
            value={email}
            onChange={e => {
              setEmail(e.target.value);
              setError('');
            }}
            autoFocus
          />
          {error && <span className="field-error">{error}</span>}

          <button
            type="submit"
            className={`btn-primary${loading ? ' loading' : ''}${!isValidEmail ? ' disabled' : ''}`}
            disabled={loading || !isValidEmail}
          >
            {loading ? <span className="spinner" /> : 'Send OTP'}
          </button>
        </form>
      </div>
    </div>
  );
}
