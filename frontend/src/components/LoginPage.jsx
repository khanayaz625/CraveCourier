import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  ChefHat, 
  Compass,
  Sun,
  Moon,
  Star,
  MapPin,
  HelpCircle,
  X,
  Smartphone,
  KeyRound,
  RotateCcw,
  Zap,
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export const LoginPage = ({ onGuestContinue }) => {
  const { login, register, loginWithGoogle, sendOTP, verifyOTP, demoLogin, continueAsGuest, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Authentication Switcher States
  const [authMethod, setAuthMethod] = useState('otp'); // 'otp' | 'email'
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register'
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Email / Password Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('customer'); // 'customer' | 'restaurant' | 'admin'

  // Mobile + OTP Authentication States
  const [phoneInput, setPhoneInput] = useState('');
  const [otpStep, setOtpStep] = useState('phone'); // 'phone' | 'otp'
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [serverOtpPreview, setServerOtpPreview] = useState(null);
  const [otpCountdown, setOtpCountdown] = useState(30);
  const [canResendOtp, setCanResendOtp] = useState(false);
  const [phoneUserName, setPhoneUserName] = useState('');
  const [phoneUserRole, setPhoneUserRole] = useState('customer');

  // Google Account Chooser & Real OAuth State
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [customGoogleName, setCustomGoogleName] = useState('');
  const [isCustomGoogleInput, setIsCustomGoogleInput] = useState(false);
  const [googleClientId, setGoogleClientId] = useState(() => {
    return import.meta.env.VITE_GOOGLE_CLIENT_ID || localStorage.getItem('crave_google_client_id') || '';
  });
  const [tempClientIdInput, setTempClientIdInput] = useState('');
  const [showClientIdConfig, setShowClientIdConfig] = useState(false);

  // SMS Gateway Configuration States (Fast2SMS, 2Factor.in, Twilio)
  const [isSmsModalOpen, setIsSmsModalOpen] = useState(false);
  const [activeSmsProviderTab, setActiveSmsProviderTab] = useState('fast2sms'); // 'fast2sms' | '2factor' | 'twilio'
  const [fast2smsKeyInput, setFast2smsKeyInput] = useState(() => localStorage.getItem('crave_fast2sms_key') || '');
  const [twoFactorKeyInput, setTwoFactorKeyInput] = useState(() => localStorage.getItem('crave_2factor_key') || '');
  const [twilioSidInput, setTwilioSidInput] = useState(() => localStorage.getItem('crave_twilio_sid') || '');
  const [twilioTokenInput, setTwilioTokenInput] = useState(() => localStorage.getItem('crave_twilio_token') || '');
  const [twilioFromInput, setTwilioFromInput] = useState(() => localStorage.getItem('crave_twilio_from') || '');
  const [smsGatewayStatus, setSmsGatewayStatus] = useState({
    fast2smsConfigured: false,
    twoFactorConfigured: false,
    twilioConfigured: false,
    activeProviders: []
  });
  const [smsDeliveryStatus, setSmsDeliveryStatus] = useState(null);

  // Fetch live SMS gateway configuration status from backend
  const fetchSmsConfigStatus = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/auth/sms-config');
      if (res.ok) {
        const data = await res.json();
        setSmsGatewayStatus(data);
      }
    } catch (e) {
      console.warn('Could not fetch SMS config:', e.message);
    }
  };

  useEffect(() => {
    fetchSmsConfigStatus();
  }, []);

  // Countdown timer for OTP resend
  useEffect(() => {
    let timer;
    if (otpStep === 'otp' && otpCountdown > 0) {
      timer = setInterval(() => setOtpCountdown(c => c - 1), 1000);
    } else if (otpCountdown === 0) {
      setCanResendOtp(true);
    }
    return () => clearInterval(timer);
  }, [otpStep, otpCountdown]);

  // Pre-configured quick Google mock accounts for high fidelity
  const googleAccounts = [
    {
      name: 'Arjun Sharma',
      email: 'arjun.sharma99@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
      initials: 'AS'
    },
    {
      name: 'Priya Patel',
      email: 'priya.patel.foodie@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
      initials: 'PP'
    },
    {
      name: 'Rohan Verma',
      email: 'rohan.verma.dev@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80',
      initials: 'RV'
    }
  ];

  // Official Real Google OAuth Popup Launcher
  const triggerRealGooglePopup = (clientIdToUse) => {
    const activeId = clientIdToUse || googleClientId;
    
    if (!activeId) {
      setIsGoogleModalOpen(true);
      setShowClientIdConfig(true);
      return;
    }

    if (!window.google?.accounts?.oauth2) {
      setErrorMsg('Google Identity Services is initializing. Please try again in a few seconds.');
      return;
    }

    try {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: activeId.trim(),
        scope: 'email profile openid',
        callback: async (tokenResponse) => {
          if (tokenResponse.error) {
            setErrorMsg(`Google OAuth: ${tokenResponse.error_description || tokenResponse.error}`);
            return;
          }
          try {
            setErrorMsg('');
            // Fetch real user info from Google's official userinfo endpoint
            const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
            });
            const profile = await res.json();
            if (profile.email) {
              await loginWithGoogle({
                name: profile.name || profile.email.split('@')[0],
                email: profile.email,
                avatar: profile.picture,
                googleId: profile.sub
              });
              setIsGoogleModalOpen(false);
            }
          } catch (err) {
            setErrorMsg(err.message || 'Failed to authenticate profile with server.');
          }
        }
      });

      client.requestAccessToken({ prompt: 'select_account' });
    } catch (err) {
      setErrorMsg(`Google OAuth error: ${err.message}. Please check your Client ID origin settings.`);
    }
  };

  const handleSaveClientId = (e) => {
    e.preventDefault();
    if (!tempClientIdInput.trim()) return;
    const cleanId = tempClientIdInput.trim();
    setGoogleClientId(cleanId);
    localStorage.setItem('crave_google_client_id', cleanId);
    setShowClientIdConfig(false);
    triggerRealGooglePopup(cleanId);
  };

  // --- SMS Gateway Configuration Handler ---
  const handleSaveSmsGatewayConfig = async (e) => {
    if (e) e.preventDefault();
    try {
      localStorage.setItem('crave_fast2sms_key', fast2smsKeyInput.trim());
      localStorage.setItem('crave_2factor_key', twoFactorKeyInput.trim());
      localStorage.setItem('crave_twilio_sid', twilioSidInput.trim());
      localStorage.setItem('crave_twilio_token', twilioTokenInput.trim());
      localStorage.setItem('crave_twilio_from', twilioFromInput.trim());

      const res = await fetch('http://localhost:5000/api/auth/sms-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fast2smsKey: fast2smsKeyInput.trim(),
          twoFactorKey: twoFactorKeyInput.trim(),
          twilioSid: twilioSidInput.trim(),
          twilioToken: twilioTokenInput.trim(),
          twilioFrom: twilioFromInput.trim()
        })
      });

      if (res.ok) {
        await fetchSmsConfigStatus();
        setIsSmsModalOpen(false);
        setSuccessMsg('SMS Gateway credentials activated! Real SMS is now enabled.');
      }
    } catch (err) {
      setErrorMsg('Failed to save SMS config to server: ' + err.message);
    }
  };

  // --- OTP Flow Handlers ---
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
      setSmsDeliveryStatus({
        deliveredRealSMS: res.deliveredRealSMS,
        provider: res.smsProvider,
        message: res.message
      });
      setOtpStep('otp');
      setOtpCountdown(30);
      setCanResendOtp(false);
      
      if (res.deliveredRealSMS) {
        setSuccessMsg(`🚀 Real SMS delivered to +91 ${cleanNumber.slice(-10)} via ${res.smsProvider}! Check your phone.`);
      } else {
        setSuccessMsg(`OTP generated for +91 ${cleanNumber.slice(-10)}`);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to send OTP. Please try again.');
    }
  };

  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    const fullOtp = otpDigits.join('');
    if (fullOtp.length !== 6) {
      setErrorMsg('Please enter all 6 digits of the OTP code');
      return;
    }

    try {
      await verifyOTP(phoneInput, fullOtp, phoneUserName, phoneUserRole);
    } catch (err) {
      setErrorMsg(err.message || 'Invalid OTP. Please check code and try again.');
    }
  };

  const handleOtpDigitChange = (index, value) => {
    // Handle multi-character paste (e.g. user pastes "482910")
    if (value.length > 1) {
      const digits = value.replace(/[^0-9]/g, '').slice(0, 6).split('');
      const newDigits = [...otpDigits];
      digits.forEach((d, idx) => {
        if (idx < 6) newDigits[idx] = d;
      });
      setOtpDigits(newDigits);
      const nextIndex = Math.min(digits.length, 5);
      document.getElementById(`otp-input-${nextIndex}`)?.focus();
      return;
    }

    const cleanVal = value.replace(/[^0-9]/g, '');
    const newDigits = [...otpDigits];
    newDigits[index] = cleanVal;
    setOtpDigits(newDigits);

    if (cleanVal && index < 5) {
      document.getElementById(`otp-input-${index + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      document.getElementById(`otp-input-${index - 1}`)?.focus();
    }
  };

  const handleAutoFillOtp = () => {
    if (serverOtpPreview) {
      const digits = serverOtpPreview.split('');
      setOtpDigits(digits);
      document.getElementById(`otp-input-5`)?.focus();
    }
  };

  // --- Email Flow Handlers ---
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (activeTab === 'login') {
        if (!email || !password) {
          setErrorMsg('Please enter both email and password.');
          return;
        }
        await login(email, password);
      } else {
        if (!name || !email || !password) {
          setErrorMsg('Please fill in your name, email and password.');
          return;
        }
        await register(name, email, password, phone, role);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed. Please verify credentials.');
    }
  };

  const handleSelectGoogleAccount = async (account) => {
    try {
      setIsGoogleModalOpen(false);
      setErrorMsg('');
      await loginWithGoogle({
        name: account.name,
        email: account.email,
        avatar: account.avatar,
        googleId: `google_${encodeURIComponent(account.email)}`
      });
    } catch (err) {
      setErrorMsg(err.message || 'Failed to authenticate with Google.');
    }
  };

  const handleCustomGoogleSubmit = async (e) => {
    e.preventDefault();
    if (!customGoogleEmail.trim()) return;
    const computedName = customGoogleName.trim() || customGoogleEmail.split('@')[0];
    await handleSelectGoogleAccount({
      name: computedName,
      email: customGoogleEmail.trim().toLowerCase(),
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(customGoogleEmail)}`
    });
  };

  const handleDemoClick = async (demoRole) => {
    setErrorMsg('');
    try {
      await demoLogin(demoRole);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to load demo profile.');
    }
  };

  const handleGuestEntry = () => {
    continueAsGuest();
    if (onGuestContinue) onGuestContinue();
  };

  return (
    <div className="login-page-root">
      {/* Background Decorative Ambient Orbs */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        left: '-5%',
        width: '550px',
        height: '550px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255, 94, 30, 0.15) 0%, transparent 70%)',
        filter: 'blur(80px)',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      <div style={{
        position: 'absolute',
        bottom: '-10%',
        right: '-5%',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(16, 185, 129, 0.12) 0%, transparent 70%)',
        filter: 'blur(80px)',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      {/* Floating Theme Switcher at Top-Right */}
      <div style={{
        position: 'absolute',
        top: '16px',
        right: '20px',
        zIndex: 20
      }}>
        <button
          onClick={toggleTheme}
          className="btn btn-ghost btn-sm glass-panel"
          style={{
            padding: '6px 12px',
            borderRadius: 'var(--radius-full)',
            gap: '6px',
            fontSize: '0.8rem'
          }}
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Sun size={15} color="#FBBF24" /> : <Moon size={15} color="#6366F1" />}
          <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
        </button>
      </div>

      {/* LEFT COLUMN: Visual Brand & Gourmet Showcase (Desktop only) */}
      <div className="login-showcase-column">
        {/* Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img
            src="/logo.png"
            alt="CraveCourier Logo"
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '14px',
              objectFit: 'cover',
              boxShadow: '0 4px 18px var(--primary-glow)'
            }}
          />
          <div>
            <span style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 900,
              fontSize: '1.35rem',
              letterSpacing: '-0.02em',
              background: 'linear-gradient(135deg, #FFFFFF 30%, #FFA133 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              CRAVE<span style={{ color: 'var(--primary)', WebkitTextFillColor: 'var(--primary)' }}>COURIER</span>
            </span>
            <div style={{ fontSize: '0.64rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              India's Gourmet Delivery Hub
            </div>
          </div>
        </div>

        {/* Hero Narrative */}
        <div style={{ margin: '20px 0' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 12px',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(255, 94, 30, 0.15)',
            border: '1px solid rgba(255, 94, 30, 0.3)',
            color: 'var(--primary)',
            fontSize: '0.78rem',
            fontWeight: 800,
            marginBottom: '14px'
          }}>
            <Sparkles size={14} /> 500+ Top Artisan Kitchens in India
          </div>

          <h1 style={{
            fontSize: 'clamp(1.9rem, 2.7vw, 2.6rem)',
            fontWeight: 900,
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
            marginBottom: '14px'
          }}>
            Craving royal flavors? <br />
            <span className="gradient-text">Delivered hot in 25 mins.</span>
          </h1>

          <p style={{
            fontSize: '0.92rem',
            color: 'var(--text-secondary)',
            maxWidth: '460px',
            lineHeight: 1.5,
            marginBottom: '20px'
          }}>
            Experience artisanal woodfired pizzas, aromatic Awadhi biryanis, smashed Wagyu burgers, and Japanese ramen crafted by top certified chefs.
          </p>

          {/* Floating Key Benefits Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            maxWidth: '480px'
          }}>
            <div className="glass-panel" style={{
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <div style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                background: 'rgba(255, 94, 30, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary)'
              }}>
                <Clock size={18} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.85rem' }}>25 Min Express</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>GPS live rider tracking</div>
              </div>
            </div>

            <div className="glass-panel" style={{
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <div style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                background: 'rgba(16, 185, 129, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--veg-color)'
              }}>
                <ShieldCheck size={18} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.85rem' }}>Hygiene Verified</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>100% kitchen sanitation</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Social Proof */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          paddingTop: '14px',
          borderTop: '1px solid var(--border-subtle)'
        }}>
          <div style={{ display: 'flex', marginLeft: '4px' }}>
            {[
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80',
              'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80',
              'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80',
              'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&q=80'
            ].map((src, i) => (
              <img
                key={i}
                src={src}
                alt="Foodie Customer"
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  border: '2px solid var(--bg-main)',
                  marginLeft: i > 0 ? '-8px' : '0',
                  objectFit: 'cover'
                }}
              />
            ))}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              {[1, 2, 3, 4, 5].map(n => (
                <Star key={n} size={11} fill="#F59E0B" color="#F59E0B" />
              ))}
              <span style={{ fontSize: '0.78rem', fontWeight: 800, marginLeft: '3px' }}>4.9/5</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              Over 28,000+ satisfied foodies in Bengaluru & Mumbai
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Interactive Login & Registration Card */}
      <div className="login-form-column">
        <div className="login-form-card glass-panel">
          {/* Mobile Only Brand Header */}
          <div className="login-mobile-brand" style={{
            display: 'none',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            marginBottom: '14px'
          }}>
            <img
              src="/logo.png"
              alt="CraveCourier Logo"
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                objectFit: 'cover',
                boxShadow: '0 2px 12px var(--primary-glow)'
              }}
            />
            <span style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 900,
              fontSize: '1.35rem'
            }}>
              CRAVE<span style={{ color: 'var(--primary)' }}>COURIER</span>
            </span>
          </div>

          {/* Form Header */}
          <div style={{ marginBottom: '10px', textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.28rem', fontWeight: 900, marginBottom: '2px', letterSpacing: '-0.02em' }}>
              Welcome to CraveCourier
            </h2>
            <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
              Sign in with Mobile OTP, Google, or Email to start ordering
            </p>
          </div>

          {/* AUTH METHOD SELECTOR (OTP vs EMAIL) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1.2fr 1fr',
            background: 'var(--bg-input)',
            borderRadius: 'var(--radius-sm)',
            padding: '3px',
            marginBottom: '10px',
            border: '1px solid var(--border-subtle)'
          }}>
            <button
              type="button"
              onClick={() => { setAuthMethod('otp'); setErrorMsg(''); }}
              style={{
                padding: '6px 10px',
                borderRadius: '6px',
                border: 'none',
                background: authMethod === 'otp' ? 'var(--primary-gradient)' : 'transparent',
                color: authMethod === 'otp' ? '#fff' : 'var(--text-muted)',
                fontWeight: 800,
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px',
                transition: 'all 0.2s ease'
              }}
            >
              <Smartphone size={14} />
              <span>Mobile OTP</span>
              <span style={{
                fontSize: '0.58rem',
                background: 'rgba(255,255,255,0.25)',
                padding: '1px 4px',
                borderRadius: '999px',
                fontWeight: 900
              }}>FAST</span>
            </button>

            <button
              type="button"
              onClick={() => { setAuthMethod('email'); setErrorMsg(''); }}
              style={{
                padding: '6px 10px',
                borderRadius: '6px',
                border: 'none',
                background: authMethod === 'email' ? 'var(--primary-gradient)' : 'transparent',
                color: authMethod === 'email' ? '#fff' : 'var(--text-muted)',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px',
                transition: 'all 0.2s ease'
              }}
            >
              <Mail size={14} />
              <span>Email & Pass</span>
            </button>
          </div>

          {/* GOOGLE SIGN IN BUTTON (Real Google OAuth Popup) */}
          <button
            type="button"
            onClick={() => triggerRealGooglePopup()}
            className="google-signin-btn"
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-elevated)',
              color: 'var(--text-main)',
              fontSize: '0.82rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-subtle)',
              transition: 'all 0.2s ease',
              marginBottom: '10px'
            }}
          >
            {/* Official Google Multicolor G Logo SVG */}
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z" />
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z" />
              <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
            </svg>
            <span>Continue with Google / Gmail</span>
          </button>

          {/* Divider */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '10px',
            color: 'var(--text-muted)',
            fontSize: '0.68rem',
            fontWeight: 700,
            textTransform: 'uppercase'
          }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
            <span>{authMethod === 'otp' ? 'OR VERIFY WITH PHONE OTP' : 'OR SIGN IN WITH PASSWORD'}</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
          </div>

          {/* Error & Success Alerts */}
          {errorMsg && (
            <div style={{
              padding: '8px 12px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#EF4444',
              fontSize: '0.8rem',
              marginBottom: '10px',
              fontWeight: 600
            }}>
              ⚠️ {errorMsg}
            </div>
          )}

          {successMsg && (
            <div style={{
              padding: '8px 12px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid var(--veg-color)',
              color: 'var(--veg-color)',
              fontSize: '0.8rem',
              marginBottom: '10px',
              fontWeight: 600
            }}>
              ✅ {successMsg}
            </div>
          )}

          {/* ============================================================ */}
          {/* FLOW A: MOBILE NUMBER + OTP VERIFICATION */}
          {/* ============================================================ */}
          {authMethod === 'otp' && (
            <div>
              {otpStep === 'phone' ? (
                <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '7px 10px',
                        background: 'var(--bg-input)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.84rem',
                        fontWeight: 700,
                        flexShrink: 0
                      }}>
                        <span>🇮🇳</span>
                        <span>+91</span>
                      </div>
                      <input
                        type="tel"
                        required
                        autoFocus
                        placeholder="Indian Mobile (e.g. 98765 43210)"
                        value={phoneInput}
                        onChange={(e) => setPhoneInput(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
                        style={{
                          flex: 1,
                          padding: '7px 12px',
                          background: 'var(--bg-input)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-sm)',
                          color: 'var(--text-main)',
                          fontSize: '0.88rem',
                          fontWeight: 700,
                          letterSpacing: '0.05em',
                          outline: 'none'
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <input
                      type="text"
                      placeholder="Your Name (Optional)"
                      value={phoneUserName}
                      onChange={(e) => setPhoneUserName(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '7px 12px',
                        background: 'var(--bg-input)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--text-main)',
                        fontSize: '0.82rem',
                        outline: 'none'
                      }}
                    />
                  </div>

                  {/* Live SMS Carrier Status Banner & Gateway Config Trigger */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '5px 10px',
                    borderRadius: '6px',
                    background: smsGatewayStatus.activeProviders?.length > 0 
                      ? 'rgba(16, 185, 129, 0.1)' 
                      : 'rgba(255, 94, 30, 0.08)',
                    border: smsGatewayStatus.activeProviders?.length > 0 
                      ? '1px solid rgba(16, 185, 129, 0.25)' 
                      : '1px solid rgba(255, 94, 30, 0.2)',
                    fontSize: '0.72rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span>
                        {smsGatewayStatus.activeProviders?.length > 0 ? '🟢' : '📡'}
                      </span>
                      <span style={{ 
                        fontWeight: 700, 
                        color: smsGatewayStatus.activeProviders?.length > 0 ? 'var(--veg-color)' : 'var(--text-main)' 
                      }}>
                        {smsGatewayStatus.activeProviders?.length > 0 
                          ? `Real SMS Ready (${smsGatewayStatus.activeProviders[0]})` 
                          : 'Real SMS Gateway Setup'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsSmsModalOpen(true)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--primary)',
                        fontWeight: 800,
                        cursor: 'pointer',
                        fontSize: '0.72rem',
                        textDecoration: 'underline'
                      }}
                    >
                      {smsGatewayStatus.activeProviders?.length > 0 ? 'Change' : 'Configure Free Key →'}
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || phoneInput.length < 10}
                    className="btn btn-primary"
                    style={{
                      width: '100%',
                      padding: '8px 14px',
                      fontSize: '0.88rem',
                      marginTop: '2px',
                      opacity: phoneInput.length < 10 ? 0.6 : 1
                    }}
                  >
                    {loading ? 'Sending OTP...' : 'Send 6-Digit OTP →'}
                  </button>

                  <div style={{ fontSize: '0.67rem', color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.3 }}>
                    {smsGatewayStatus.activeProviders?.length > 0
                      ? '🚀 Real SMS delivered to physical SIM.'
                      : "We'll generate a 6-digit OTP. Connect Fast2SMS/2Factor for real SMS."}
                  </div>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  
                  {/* Phone Header & Change link */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 10px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-subtle)'
                  }}>
                    <div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700 }}>OTP SENT TO</div>
                      <div style={{ fontSize: '0.84rem', fontWeight: 800 }}>🇮🇳 +91 {phoneInput}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setOtpStep('phone'); setErrorMsg(''); }}
                      className="btn btn-ghost btn-sm"
                      style={{ color: 'var(--primary)', fontSize: '0.74rem', padding: '2px 6px' }}
                    >
                      ✏️ Change
                    </button>
                  </div>

                  {/* Simulated Incoming SMS Toast Preview */}
                  {serverOtpPreview && (
                    <div style={{
                      padding: '6px 10px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'linear-gradient(135deg, rgba(255, 94, 30, 0.15) 0%, rgba(255, 161, 51, 0.1) 100%)',
                      border: '1px solid rgba(255, 94, 30, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Zap size={15} color="var(--primary)" />
                        <div>
                          <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>📩 SMS Code</div>
                          <div style={{ fontSize: '0.9rem', fontWeight: 900, color: 'var(--primary)', letterSpacing: '0.08em' }}>
                            {serverOtpPreview}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleAutoFillOtp}
                        className="btn btn-primary btn-sm"
                        style={{ padding: '2px 8px', fontSize: '0.7rem', borderRadius: 'var(--radius-full)' }}
                      >
                        ⚡ Auto-Fill
                      </button>
                    </div>
                  )}

                  {/* 6-Digit Individual OTP Input Boxes */}
                  <div>
                    <label style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px', display: 'block', textAlign: 'center' }}>
                      Enter 6-Digit Verification Code
                    </label>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
                      {otpDigits.map((digit, index) => (
                        <input
                          key={index}
                          id={`otp-input-${index}`}
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          value={digit}
                          autoFocus={index === 0}
                          onChange={(e) => handleOtpDigitChange(index, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(index, e)}
                          style={{
                            width: '38px',
                            height: '42px',
                            textAlign: 'center',
                            fontSize: '1.2rem',
                            fontWeight: 900,
                            borderRadius: '6px',
                            background: 'var(--bg-input)',
                            border: digit ? '2px solid var(--primary)' : '1px solid var(--border-subtle)',
                            color: 'var(--text-main)',
                            outline: 'none',
                            boxShadow: digit ? '0 0 8px var(--primary-glow)' : 'none',
                            transition: 'all 0.15s ease'
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Resend OTP Timer Strip */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.75rem' }}>
                    {canResendOtp ? (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--primary)',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px'
                        }}
                      >
                        <RotateCcw size={12} /> Resend OTP Now
                      </button>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>
                        ⏱️ Resend in <strong>{otpCountdown}s</strong>
                      </span>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otpDigits.join('').length < 6}
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '8px 14px', fontSize: '0.88rem' }}
                  >
                    {loading ? 'Verifying...' : 'Verify OTP & Continue 🚀'}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* ============================================================ */}
          {/* FLOW B: EMAIL & PASSWORD AUTHENTICATION */}
          {/* ============================================================ */}
          {authMethod === 'email' && (
            <div>
              {/* Sign In / Register Tab Toggle */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                background: 'var(--bg-input)',
                borderRadius: '6px',
                padding: '3px',
                marginBottom: '10px',
                border: '1px solid var(--border-subtle)'
              }}>
                <button
                  type="button"
                  onClick={() => { setActiveTab('login'); setErrorMsg(''); }}
                  style={{
                    padding: '5px',
                    borderRadius: '4px',
                    border: 'none',
                    background: activeTab === 'login' ? 'var(--primary-gradient)' : 'transparent',
                    color: activeTab === 'login' ? '#fff' : 'var(--text-muted)',
                    fontWeight: 700,
                    fontSize: '0.78rem',
                    cursor: 'pointer'
                  }}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setActiveTab('register'); setErrorMsg(''); }}
                  style={{
                    padding: '5px',
                    borderRadius: '4px',
                    border: 'none',
                    background: activeTab === 'register' ? 'var(--primary-gradient)' : 'transparent',
                    color: activeTab === 'register' ? '#fff' : 'var(--text-muted)',
                    fontWeight: 700,
                    fontSize: '0.78rem',
                    cursor: 'pointer'
                  }}
                >
                  Create Account
                </button>
              </div>

              {/* Primary Authentication Form */}
              <form onSubmit={handleEmailSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {activeTab === 'register' && (
                  <div>
                    <div style={{ position: 'relative' }}>
                      <User size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                      <input
                        type="text"
                        required
                        placeholder="Full Name (e.g. Arjun Sharma)"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '7px 10px 7px 32px',
                          background: 'var(--bg-input)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-sm)',
                          color: 'var(--text-main)',
                          fontSize: '0.84rem',
                          outline: 'none'
                        }}
                      />
                    </div>
                  </div>
                )}

                <div>
                  <div style={{ position: 'relative' }}>
                    <Mail size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="email"
                      required
                      placeholder="Email Address (name@example.com)"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '7px 10px 7px 32px',
                        background: 'var(--bg-input)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--text-main)',
                        fontSize: '0.84rem',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div style={{ position: 'relative' }}>
                    <Lock size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '7px 32px 7px 32px',
                        background: 'var(--bg-input)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--text-main)',
                        fontSize: '0.84rem',
                        outline: 'none'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer'
                      }}
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '8px 14px', fontSize: '0.88rem', marginTop: '2px' }}
                >
                  {loading ? 'Processing...' : (activeTab === 'login' ? 'Sign In' : 'Create Account')}
                </button>
              </form>
            </div>
          )}

          {/* CREDENTIALS QUICK REFERENCE & AUTO-FILL CARD */}
          <div style={{
            marginTop: '10px',
            padding: '8px 10px',
            background: 'var(--bg-elevated)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '6px'
            }}>
              <span style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                🔑 Quick Role Credentials
              </span>
              <span className="badge badge-primary" style={{ fontSize: '0.58rem', padding: '2px 6px' }}>AUTO-REDIRECT</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
              {/* 1. Admin */}
              <div 
                onClick={() => {
                  if (authMethod === 'email') {
                    setEmail('admin@cravecourier.com');
                    setPassword('admin123');
                    setActiveTab('login');
                  } else {
                    setPhoneInput('9876543210');
                  }
                }}
                style={{
                  padding: '6px 4px',
                  borderRadius: '6px',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}
                title="Admin: admin@cravecourier.com / admin123 (9876543210)"
              >
                <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#6366F1', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}>
                  <ShieldCheck size={13} />
                  <span>Admin</span>
                </div>
                <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>admin123</div>
              </div>

              {/* 2. Restaurant Chef */}
              <div 
                onClick={() => {
                  if (authMethod === 'email') {
                    setEmail('restaurant@cravecourier.com');
                    setPassword('chef123');
                    setActiveTab('login');
                  } else {
                    setPhoneInput('9822011223');
                  }
                }}
                style={{
                  padding: '6px 4px',
                  borderRadius: '6px',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}
                title="Kitchen: restaurant@cravecourier.com / chef123 (9822011223)"
              >
                <div style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--veg-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}>
                  <ChefHat size={13} />
                  <span>Kitchen</span>
                </div>
                <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>chef123</div>
              </div>

              {/* 3. Customer */}
              <div 
                onClick={() => {
                  if (authMethod === 'email') {
                    setEmail('customer@cravecourier.com');
                    setPassword('user123');
                    setActiveTab('login');
                  } else {
                    setPhoneInput('9123456789');
                  }
                }}
                style={{
                  padding: '6px 4px',
                  borderRadius: '6px',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}
                title="Customer: customer@cravecourier.com / user123 (9123456789)"
              >
                <div style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}>
                  <User size={13} />
                  <span>Customer</span>
                </div>
                <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>user123</div>
              </div>
            </div>
          </div>

          {/* GUEST EXPLORATION SKIP BUTTON */}
          <div style={{ textAlign: 'center', marginTop: '8px' }}>
            <button
              type="button"
              onClick={handleGuestEntry}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--primary)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
            >
              <Compass size={14} />
              <span>Explore menu as Guest →</span>
            </button>
          </div>
        </div>
      </div>

      {/* GOOGLE ACCOUNT CHOOSER & REAL OAUTH MODAL */}
      {isGoogleModalOpen && (
        <div className="modal-overlay" onClick={() => setIsGoogleModalOpen(false)}>
          <div 
            className="glass-panel animate-modal"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '460px',
              padding: '28px',
              borderRadius: 'var(--radius-xl)',
              background: 'var(--bg-elevated)',
              boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
              border: '1px solid var(--border-subtle)',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            {/* Google Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <svg width="26" height="26" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z" />
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z" />
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
                </svg>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Sign in with Google</h3>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Official OAuth & Fast Gmail Access</div>
                </div>
              </div>

              <button
                onClick={() => setIsGoogleModalOpen(false)}
                className="btn btn-ghost btn-sm"
                style={{ padding: '6px' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* REAL OFFICIAL GOOGLE POPUP TRIGGER */}
            <div style={{ marginBottom: '18px' }}>
              <button
                type="button"
                onClick={() => triggerRealGooglePopup()}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '12px 18px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.92rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  boxShadow: '0 4px 15px var(--primary-glow)'
                }}
              >
                <span>🚀 Launch Real Google Account Popup</span>
              </button>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '6px' }}>
                Opens standard Google dialog on accounts.google.com
              </div>
            </div>

            {/* Collapsible Client ID Settings */}
            <div style={{
              marginBottom: '16px',
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-input)',
              border: '1px solid var(--border-subtle)'
            }}>
              <div 
                onClick={() => setShowClientIdConfig(!showClientIdConfig)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  userSelect: 'none'
                }}
              >
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                  ⚙️ {googleClientId ? 'Connected Client ID (Active)' : 'Setup Google Cloud Client ID'}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700 }}>
                  {showClientIdConfig ? 'Hide' : 'Configure'}
                </span>
              </div>

              {showClientIdConfig && (
                <form onSubmit={handleSaveClientId} style={{ marginTop: '10px' }}>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Paste your Google OAuth 2.0 Web Client ID:
                  </label>
                  <input
                    type="text"
                    placeholder="xxxx-xxxx.apps.googleusercontent.com"
                    value={tempClientIdInput || googleClientId}
                    onChange={(e) => setTempClientIdInput(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      color: '#fff',
                      fontSize: '0.78rem',
                      marginTop: '4px',
                      marginBottom: '8px'
                    }}
                  />
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="submit"
                      className="btn btn-primary btn-sm"
                      style={{ flex: 1, fontSize: '0.75rem' }}
                    >
                      Save & Launch Real Google Login
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Quick Google Account Options */}
            {!isCustomGoogleInput ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Or Fast-Sign In with Verified Profile
                </div>
                {googleAccounts.map((acc, index) => (
                  <div
                    key={index}
                    onClick={() => handleSelectGoogleAccount(acc)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}
                  >
                    <img
                      src={acc.avatar}
                      alt={acc.name}
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        objectFit: 'cover'
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800, fontSize: '0.88rem' }}>{acc.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{acc.email}</div>
                    </div>
                    <CheckCircle2 size={16} color="var(--veg-color)" />
                  </div>
                ))}

                <button
                  onClick={() => setIsCustomGoogleInput(true)}
                  className="btn btn-secondary"
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                    marginTop: '4px',
                    fontSize: '0.82rem'
                  }}
                >
                  Type Any Custom @gmail.com Address
                </button>
              </div>
            ) : (
              <form onSubmit={handleCustomGoogleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
                    Gmail Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="yourname@gmail.com"
                    value={customGoogleEmail}
                    onChange={(e) => setCustomGoogleEmail(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      color: '#fff',
                      fontSize: '0.88rem',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
                    Display Name
                  </label>
                  <input
                    type="text"
                    placeholder="Your Full Name"
                    value={customGoogleName}
                    onChange={(e) => setCustomGoogleName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      color: '#fff',
                      fontSize: '0.88rem',
                      outline: 'none'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                  <button
                    type="button"
                    onClick={() => setIsCustomGoogleInput(false)}
                    className="btn btn-secondary"
                    style={{ flex: 1, fontSize: '0.85rem' }}
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ flex: 1, fontSize: '0.85rem' }}
                  >
                    Sign In with Gmail
                  </button>
                </div>
              </form>
            )}

            <div style={{
              fontSize: '0.7rem',
              color: 'var(--text-muted)',
              textAlign: 'center',
              lineHeight: 1.4
            }}>
              Official Google Identity Services (GIS) integration connected with CraveCourier.
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* REAL CARRIER SMS GATEWAY SETUP MODAL */}
      {/* ============================================================ */}
      {isSmsModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '520px',
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-subtle)',
            padding: '28px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff'
                }}>
                  <Smartphone size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 900, margin: 0 }}>Real SMS Gateway Setup</h3>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Receive real SMS OTP codes on physical mobile SIM cards
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsSmsModalOpen(false)}
                style={{
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-muted)',
                  cursor: 'pointer'
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Provider Tabs */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              background: 'var(--bg-input)',
              borderRadius: 'var(--radius-md)',
              padding: '4px',
              marginBottom: '18px',
              border: '1px solid var(--border-subtle)'
            }}>
              <button
                type="button"
                onClick={() => setActiveSmsProviderTab('fast2sms')}
                style={{
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  background: activeSmsProviderTab === 'fast2sms' ? 'var(--primary-gradient)' : 'transparent',
                  color: activeSmsProviderTab === 'fast2sms' ? '#fff' : 'var(--text-muted)',
                  fontWeight: 800,
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                Fast2SMS 🇮🇳
              </button>
              <button
                type="button"
                onClick={() => setActiveSmsProviderTab('2factor')}
                style={{
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  background: activeSmsProviderTab === '2factor' ? 'var(--primary-gradient)' : 'transparent',
                  color: activeSmsProviderTab === '2factor' ? '#fff' : 'var(--text-muted)',
                  fontWeight: 800,
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                2Factor.in 🇮🇳
              </button>
              <button
                type="button"
                onClick={() => setActiveSmsProviderTab('twilio')}
                style={{
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  background: activeSmsProviderTab === 'twilio' ? 'var(--primary-gradient)' : 'transparent',
                  color: activeSmsProviderTab === 'twilio' ? '#fff' : 'var(--text-muted)',
                  fontWeight: 800,
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                Twilio 🌍
              </button>
            </div>

            {/* TAB 1: Fast2SMS */}
            {activeSmsProviderTab === 'fast2sms' && (
              <form onSubmit={handleSaveSmsGatewayConfig} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{
                  padding: '12px 14px',
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.8rem',
                  color: 'var(--text-main)',
                  lineHeight: 1.5
                }}>
                  <div style={{ fontWeight: 800, color: 'var(--veg-color)', marginBottom: '4px' }}>
                    ⚡ Get Free Real SMS in 30 Seconds:
                  </div>
                  1. Visit <a href="https://www.fast2sms.com" target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', fontWeight: 800, textDecoration: 'underline' }}>Fast2SMS.com</a> (Free sign-up, instant 50 SMS credits).<br />
                  2. Open <strong>Dev API</strong> from the left sidebar.<br />
                  3. Copy your <strong>Authorization API Key</strong> and paste below:
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>
                    Fast2SMS Authorization API Key:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. hJq1F2R5KkLz7V9mB3x4sY..."
                    value={fast2smsKeyInput}
                    onChange={(e) => setFast2smsKeyInput(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-main)',
                      fontSize: '0.88rem',
                      outline: 'none'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                  <button
                    type="button"
                    onClick={() => setIsSmsModalOpen(false)}
                    className="btn btn-secondary"
                    style={{ flex: 1, fontSize: '0.85rem' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ flex: 1.5, fontSize: '0.85rem' }}
                  >
                    💾 Save & Activate Fast2SMS
                  </button>
                </div>
              </form>
            )}

            {/* TAB 2: 2Factor.in */}
            {activeSmsProviderTab === '2factor' && (
              <form onSubmit={handleSaveSmsGatewayConfig} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{
                  padding: '12px 14px',
                  background: 'rgba(59, 130, 246, 0.1)',
                  border: '1px solid rgba(59, 130, 246, 0.25)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.8rem',
                  color: 'var(--text-main)',
                  lineHeight: 1.5
                }}>
                  <div style={{ fontWeight: 800, color: '#3B82F6', marginBottom: '4px' }}>
                    ⚡ 2Factor India Dedicated OTP Gateway:
                  </div>
                  1. Visit <a href="https://2factor.in" target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', fontWeight: 800, textDecoration: 'underline' }}>2Factor.in</a>.<br />
                  2. Create an account and copy your <strong>API Key</strong>.<br />
                  3. Paste your 2Factor API Key below:
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>
                    2Factor.in API Key:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2factor-api-key-xxxx-xxxx"
                    value={twoFactorKeyInput}
                    onChange={(e) => setTwoFactorKeyInput(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-main)',
                      fontSize: '0.88rem',
                      outline: 'none'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                  <button
                    type="button"
                    onClick={() => setIsSmsModalOpen(false)}
                    className="btn btn-secondary"
                    style={{ flex: 1, fontSize: '0.85rem' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ flex: 1.5, fontSize: '0.85rem' }}
                  >
                    💾 Save & Activate 2Factor
                  </button>
                </div>
              </form>
            )}

            {/* TAB 3: Twilio */}
            {activeSmsProviderTab === 'twilio' && (
              <form onSubmit={handleSaveSmsGatewayConfig} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
                    Twilio Account SID:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    value={twilioSidInput}
                    onChange={(e) => setTwilioSidInput(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-main)',
                      fontSize: '0.88rem',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
                    Twilio Auth Token:
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Your Twilio Auth Token"
                    value={twilioTokenInput}
                    onChange={(e) => setTwilioTokenInput(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-main)',
                      fontSize: '0.88rem',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
                    Twilio Phone Number (From):
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="+1234567890"
                    value={twilioFromInput}
                    onChange={(e) => setTwilioFromInput(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-main)',
                      fontSize: '0.88rem',
                      outline: 'none'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                  <button
                    type="button"
                    onClick={() => setIsSmsModalOpen(false)}
                    className="btn btn-secondary"
                    style={{ flex: 1, fontSize: '0.85rem' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ flex: 1.5, fontSize: '0.85rem' }}
                  >
                    💾 Save & Activate Twilio
                  </button>
                </div>
              </form>
            )}

            <div style={{
              marginTop: '16px',
              paddingTop: '12px',
              borderTop: '1px solid var(--border-subtle)',
              fontSize: '0.72rem',
              color: 'var(--text-muted)',
              textAlign: 'center'
            }}>
              Credentials are saved to your local backend securely. Once configured, every OTP requested will be delivered directly to your mobile phone SIM.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

