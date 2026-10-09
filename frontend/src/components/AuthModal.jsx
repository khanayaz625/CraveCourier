import React, { useState, useEffect } from 'react';
import { 
  X, 
  Lock, 
  Mail, 
  User, 
  Phone, 
  Sparkles, 
  CheckCircle2, 
  Smartphone, 
  RotateCcw, 
  Zap, 
  ChefHat, 
  ShieldCheck 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AuthModal = () => {
  const { 
    isAuthModalOpen, 
    setIsAuthModalOpen, 
    authMode, 
    setAuthMode, 
    login, 
    register, 
    loginWithGoogle,
    sendOTP,
    verifyOTP,
    demoLogin, 
    loading 
  } = useAuth();

  const [authType, setAuthType] = useState('otp'); // 'otp' | 'email'
  
  // Email States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('customer');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // OTP States
  const [phoneInput, setPhoneInput] = useState('');
  const [otpStep, setOtpStep] = useState('phone'); // 'phone' | 'otp'
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [serverOtpPreview, setServerOtpPreview] = useState(null);
  const [otpCountdown, setOtpCountdown] = useState(30);
  const [canResendOtp, setCanResendOtp] = useState(false);

  useEffect(() => {
    let timer;
    if (otpStep === 'otp' && otpCountdown > 0) {
      timer = setInterval(() => setOtpCountdown(c => c - 1), 1000);
    } else if (otpCountdown === 0) {
      setCanResendOtp(true);
    }
    return () => clearInterval(timer);
  }, [otpStep, otpCountdown]);

  if (!isAuthModalOpen) return null;

  // --- Send OTP ---
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    const cleanNumber = phoneInput.replace(/[^0-9]/g, '');
    if (cleanNumber.length < 10) {
      setErrorMsg('Please enter a valid 10-digit Indian mobile number');
      return;
    }

    try {
      const res = await sendOTP(phoneInput);
      setServerOtpPreview(res.otp);
      setOtpStep('otp');
      setOtpCountdown(30);
      setCanResendOtp(false);
      setSuccessMsg(`OTP sent to +91 ${cleanNumber.slice(-10)}`);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to send OTP. Please try again.');
    }
  };

  // --- Verify OTP ---
  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    const fullOtp = otpDigits.join('');
    if (fullOtp.length !== 6) {
      setErrorMsg('Please enter all 6 digits of the OTP code');
      return;
    }

    try {
      await verifyOTP(phoneInput, fullOtp, name, role);
    } catch (err) {
      setErrorMsg(err.message || 'Invalid OTP. Please check code and try again.');
    }
  };

  const handleOtpDigitChange = (index, value) => {
    if (value.length > 1) {
      const digits = value.replace(/[^0-9]/g, '').slice(0, 6).split('');
      const newDigits = [...otpDigits];
      digits.forEach((d, idx) => {
        if (idx < 6) newDigits[idx] = d;
      });
      setOtpDigits(newDigits);
      const nextIndex = Math.min(digits.length, 5);
      document.getElementById(`modal-otp-input-${nextIndex}`)?.focus();
      return;
    }

    const cleanVal = value.replace(/[^0-9]/g, '');
    const newDigits = [...otpDigits];
    newDigits[index] = cleanVal;
    setOtpDigits(newDigits);

    if (cleanVal && index < 5) {
      document.getElementById(`modal-otp-input-${index + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      document.getElementById(`modal-otp-input-${index - 1}`)?.focus();
    }
  };

  const handleAutoFillOtp = () => {
    if (serverOtpPreview) {
      const digits = serverOtpPreview.split('');
      setOtpDigits(digits);
      document.getElementById(`modal-otp-input-5`)?.focus();
    }
  };

  // --- Email Submit ---
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      if (authMode === 'login') {
        await login(email, password);
      } else {
        await register(name, email, password, phoneInput, role);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed');
    }
  };

  return (
    <div className="modal-overlay" onClick={() => setIsAuthModalOpen(false)}>
      <div
        className="glass-panel animate-modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '460px',
          maxHeight: '90vh',
          borderRadius: 'var(--radius-xl)',
          overflowY: 'auto',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-card)'
        }}
      >
        {/* Header Banner */}
        <div style={{
          padding: '20px 24px 14px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          position: 'relative'
        }}>
          <button
            onClick={() => setIsAuthModalOpen(false)}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer'
            }}
          >
            <X size={20} />
          </button>

          <h3 style={{ fontSize: '1.35rem', fontWeight: 900, marginBottom: '4px' }}>
            {authMode === 'login' ? 'Sign In to CraveCourier' : 'Create an Account'}
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            Access orders, live tracking & express food delivery
          </p>

          {/* Auth Type Switcher (OTP vs Email) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1.2fr 1fr',
            background: 'var(--bg-input)',
            borderRadius: 'var(--radius-md)',
            padding: '4px',
            marginTop: '14px'
          }}>
            <button
              type="button"
              onClick={() => { setAuthType('otp'); setErrorMsg(''); }}
              style={{
                padding: '8px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: authType === 'otp' ? 'var(--primary-gradient)' : 'transparent',
                color: authType === 'otp' ? '#fff' : 'var(--text-muted)',
                fontWeight: 800,
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <Smartphone size={15} />
              <span>Mobile OTP</span>
            </button>
            <button
              type="button"
              onClick={() => { setAuthType('email'); setErrorMsg(''); }}
              style={{
                padding: '8px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: authType === 'email' ? 'var(--primary-gradient)' : 'transparent',
                color: authType === 'email' ? '#fff' : 'var(--text-muted)',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <Mail size={15} />
              <span>Email</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div style={{ padding: '18px 24px 24px 24px' }}>
          
          {/* Google Button */}
          <button
            type="button"
            onClick={() => {
              loginWithGoogle({
                name: 'Google Foodie',
                email: 'google.foodie@gmail.com',
                avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
                googleId: `g_${Date.now()}`
              });
            }}
            className="btn btn-secondary google-signin-btn"
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              fontSize: '0.88rem',
              fontWeight: 700,
              background: 'var(--bg-input)',
              border: '1px solid var(--border-subtle)',
              marginBottom: '14px'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z" />
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z" />
              <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
            </svg>
            <span>Continue with Google</span>
          </button>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '14px',
            color: 'var(--text-muted)',
            fontSize: '0.72rem',
            fontWeight: 700,
            textTransform: 'uppercase'
          }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
            <span>{authType === 'otp' ? 'OR VERIFY WITH MOBILE OTP' : 'OR WITH EMAIL'}</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
          </div>

          {/* Alerts */}
          {errorMsg && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid var(--nonveg-color)',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              color: 'var(--nonveg-color)',
              fontSize: '0.82rem',
              marginBottom: '12px'
            }}>
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div style={{
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid var(--veg-color)',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              color: 'var(--veg-color)',
              fontSize: '0.82rem',
              marginBottom: '12px'
            }}>
              {successMsg}
            </div>
          )}

          {/* ============================================================ */}
          {/* FLOW A: OTP LOGIN */}
          {/* ============================================================ */}
          {authType === 'otp' && (
            <div>
              {otpStep === 'phone' ? (
                <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Mobile Number</label>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '10px 12px',
                        background: 'var(--bg-input)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.88rem',
                        fontWeight: 700
                      }}>
                        <span>🇮🇳</span>
                        <span>+91</span>
                      </div>
                      <input
                        type="tel"
                        required
                        autoFocus
                        placeholder="98765 43210"
                        value={phoneInput}
                        onChange={(e) => setPhoneInput(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
                        style={{
                          flex: 1,
                          padding: '10px 14px',
                          background: 'var(--bg-input)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-md)',
                          color: 'var(--text-main)',
                          fontSize: '0.92rem',
                          fontWeight: 700,
                          outline: 'none'
                        }}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || phoneInput.length < 10}
                    className="btn btn-primary btn-lg"
                    style={{ width: '100%', marginTop: '4px' }}
                  >
                    {loading ? 'Sending...' : 'Send 6-Digit OTP →'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-subtle)'
                  }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>🇮🇳 +91 {phoneInput}</span>
                    <button
                      type="button"
                      onClick={() => setOtpStep('phone')}
                      className="btn btn-ghost btn-sm"
                      style={{ color: 'var(--primary)', fontSize: '0.75rem', padding: '2px 6px' }}
                    >
                      ✏️ Edit
                    </button>
                  </div>

                  {serverOtpPreview && (
                    <div style={{
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-md)',
                      background: 'rgba(255, 94, 30, 0.12)',
                      border: '1px solid rgba(255, 94, 30, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--primary)' }}>
                        📩 Code: {serverOtpPreview}
                      </span>
                      <button
                        type="button"
                        onClick={handleAutoFillOtp}
                        className="btn btn-primary btn-sm"
                        style={{ padding: '2px 8px', fontSize: '0.72rem' }}
                      >
                        ⚡ Fill
                      </button>
                    </div>
                  )}

                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px', display: 'block', textAlign: 'center' }}>
                      Enter 6-Digit OTP
                    </label>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
                      {otpDigits.map((digit, index) => (
                        <input
                          key={index}
                          id={`modal-otp-input-${index}`}
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          value={digit}
                          autoFocus={index === 0}
                          onChange={(e) => handleOtpDigitChange(index, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(index, e)}
                          style={{
                            width: '42px',
                            height: '48px',
                            textAlign: 'center',
                            fontSize: '1.3rem',
                            fontWeight: 900,
                            borderRadius: 'var(--radius-md)',
                            background: 'var(--bg-input)',
                            border: digit ? '2px solid var(--primary)' : '1px solid var(--border-subtle)',
                            color: 'var(--text-main)',
                            outline: 'none'
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.78rem' }}>
                    {canResendOtp ? (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer' }}
                      >
                        <RotateCcw size={12} /> Resend OTP
                      </button>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>Resend in {otpCountdown}s</span>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otpDigits.join('').length < 6}
                    className="btn btn-primary btn-lg"
                    style={{ width: '100%' }}
                  >
                    {loading ? 'Verifying...' : 'Verify OTP & Sign In 🚀'}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* ============================================================ */}
          {/* FLOW B: EMAIL / PASS */}
          {/* ============================================================ */}
          {authType === 'email' && (
            <form onSubmit={handleEmailSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {authMode === 'register' && (
                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Full Name</label>
                  <div style={{ position: 'relative', marginTop: '4px' }}>
                    <User size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Arjun Sharma"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 14px 10px 38px',
                        background: 'var(--bg-input)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--text-main)',
                        fontSize: '0.88rem',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>
              )}

              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Email Address</label>
                <div style={{ position: 'relative', marginTop: '4px' }}>
                  <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="email"
                    required
                    placeholder="user@crave.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px 10px 38px',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-main)',
                      fontSize: '0.88rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Password</label>
                <div style={{ position: 'relative', marginTop: '4px' }}>
                  <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px 10px 38px',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-main)',
                      fontSize: '0.88rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary btn-lg"
                style={{ width: '100%', marginTop: '6px' }}
              >
                {loading ? 'Processing...' : (authMode === 'login' ? 'Sign In' : 'Create Account')}
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
