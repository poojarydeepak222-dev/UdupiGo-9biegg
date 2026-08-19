import { useState, useRef, useEffect, useCallback } from 'react';
import { X, Mail, Lock, User, Eye, EyeOff, CheckCircle, ArrowLeft, RefreshCw, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { authService, useAuthStore, mapSupabaseUser } from '@/hooks/useAuth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = 'entry' | 'register_details' | 'register_otp' | 'login';

const STEPS_REGISTER = ['Email', 'Details', 'Verify'];

const OTP_LENGTH = 4;
const RESEND_SECONDS = 60;

const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
  const { login } = useAuthStore();

  // Flow state
  const [step, setStep] = useState<Step>('entry');
  const [isRegistering, setIsRegistering] = useState(true);

  // Form fields
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  // OTP fields
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Resend timer
  const [resendTimer, setResendTimer] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startResendTimer = useCallback(() => {
    setResendTimer(RESEND_SECONDS);
    timerRef.current = setInterval(() => {
      setResendTimer(t => {
        if (t <= 1) { clearInterval(timerRef.current!); return 0; }
        return t - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  if (!isOpen) return null;

  const handleClose = () => {
    setStep('entry');
    setEmail('');
    setUsername('');
    setPassword('');
    setOtp(Array(OTP_LENGTH).fill(''));
    setResendTimer(0);
    if (timerRef.current) clearInterval(timerRef.current);
    onClose();
  };

  // OTP input handlers
  const handleOtpChange = (index: number, value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(-1);
    const next = [...otp];
    next[index] = cleaned;
    setOtp(next);
    if (cleaned && index < OTP_LENGTH - 1) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;
    const next = Array(OTP_LENGTH).fill('');
    pasted.split('').forEach((ch, i) => { next[i] = ch; });
    setOtp(next);
    otpRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
  };

  const otpValue = otp.join('');
  const otpComplete = otpValue.length === OTP_LENGTH;

  // Step 1: Send OTP (Register) or go to login
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      await authService.sendOtp(email.trim());
      setOtp(Array(OTP_LENGTH).fill(''));
      setStep('register_details');
      startResendTimer();
      toast.success('Verification email sent! Check your inbox.');
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Failed to send verification email');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResend = async () => {
    if (resendTimer > 0) return;
    setLoading(true);
    try {
      await authService.sendOtp(email.trim());
      setOtp(Array(OTP_LENGTH).fill(''));
      startResendTimer();
      toast.success('New OTP sent to your email!');
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP + set password
  const handleVerifyAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpComplete || !username.trim() || !password) return;
    if (password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const user = await authService.verifyOtpAndSetPassword(email.trim(), otpValue, password, username.trim());
      if (user) {
        login(mapSupabaseUser(user));
        toast.success(`Welcome to UdupiGo, ${username.trim()}! 🎉`);
        handleClose();
      }
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Verification failed. Check your OTP.');
    } finally {
      setLoading(false);
    }
  };

  // Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setLoading(true);
    try {
      const user = await authService.signInWithPassword(email.trim(), password);
      login(mapSupabaseUser(user));
      toast.success('Welcome back!');
      handleClose();
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  // Progress step for register flow
  const currentRegisterStep = step === 'entry' ? 0 : step === 'register_details' ? 1 : 2;

  return (
    <>
      <div className="fixed inset-0 z-[60] bg-black/50" onClick={handleClose} />
      <div
        className="fixed inset-x-0 bottom-0 z-[60] bg-white rounded-t-3xl shadow-2xl pb-safe"
        style={{ animation: 'slideUp 0.3s cubic-bezier(0.32,0.72,0,1)' }}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center gap-2 px-5 pt-2 pb-3">
          {(step === 'register_details' || step === 'login') && (
            <button onClick={() => setStep('entry')} className="p-1.5 rounded-full hover:bg-gray-100 -ml-1">
              <ArrowLeft size={18} className="text-gray-600" />
            </button>
          )}
          <div className="flex-1">
            <h2 className="font-heading font-bold text-gray-900 text-xl">
              {step === 'login' ? 'Welcome Back' : step === 'entry' ? 'Get Started' : 'Create Account'}
            </h2>
            <p className="text-gray-500 text-xs mt-0.5">
              {step === 'login' ? 'Sign in to your UdupiGo account'
                : step === 'entry' ? 'New to UdupiGo? Join thousands of locals'
                : 'Complete email verification to register'}
            </p>
          </div>
          <button onClick={handleClose} className="p-2 rounded-full hover:bg-gray-100">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Register Progress Indicator */}
        {step !== 'login' && (
          <div className="px-5 pb-4">
            <div className="flex items-center gap-0">
              {STEPS_REGISTER.map((label, i) => (
                <div key={label} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors
                      ${i < currentRegisterStep ? 'bg-brand-teal text-white' : i === currentRegisterStep ? 'bg-brand-teal text-white ring-2 ring-brand-teal/30' : 'bg-gray-100 text-gray-400'}`}>
                      {i < currentRegisterStep ? <CheckCircle size={14} /> : i + 1}
                    </div>
                    <span className={`text-[9px] mt-0.5 font-medium ${i <= currentRegisterStep ? 'text-brand-teal' : 'text-gray-400'}`}>{label}</span>
                  </div>
                  {i < STEPS_REGISTER.length - 1 && (
                    <div className={`h-0.5 flex-1 mx-1 mb-3 rounded transition-colors ${i < currentRegisterStep ? 'bg-brand-teal' : 'bg-gray-200'}`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="px-5 pb-8">
          {/* ── STEP 1: Email entry ── */}
          {step === 'entry' && (
            <div className="space-y-4">
              <form onSubmit={handleSendOtp} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="yourname@gmail.com"
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-brand-teal focus:bg-white focus:ring-2 focus:ring-brand-teal/15 transition-all"
                      required
                      autoFocus
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1.5 ml-1">A 4-digit OTP will be sent to verify your email</p>
                </div>
                <button
                  type="submit"
                  disabled={loading || !email.trim()}
                  className="w-full bg-brand-teal text-white font-bold py-3.5 rounded-xl hover:bg-[#0d9488] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <><RefreshCw size={15} className="animate-spin" /> Sending OTP...</>
                  ) : (
                    <><Mail size={15} /> Send Verification Code</>
                  )}
                </button>
              </form>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400 font-medium">Already have an account?</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              <button
                type="button"
                onClick={() => setStep('login')}
                className="w-full border-2 border-gray-200 text-gray-800 font-semibold py-3.5 rounded-xl hover:border-brand-teal hover:text-brand-teal hover:bg-brand-teal/5 transition-all text-sm"
              >
                Sign In with Password
              </button>
            </div>
          )}

          {/* ── STEP 2: Details + OTP ── */}
          {step === 'register_details' && (
            <form onSubmit={handleVerifyAndRegister} className="space-y-4">
              {/* Email verified notice */}
              <div className="bg-brand-teal/5 border border-brand-teal/20 rounded-xl p-3 flex items-start gap-2.5">
                <ShieldCheck size={16} className="text-brand-teal flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-brand-teal">Verification code sent</p>
                  <p className="text-[11px] text-gray-600 mt-0.5">Check <span className="font-medium text-gray-800">{email}</span> for your OTP</p>
                </div>
              </div>

              {/* OTP boxes */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Enter 4-Digit OTP</label>
                <div className="flex gap-3 justify-center" onPaste={handleOtpPaste}>
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={el => { otpRefs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={e => handleOtpChange(i, e.target.value)}
                      onKeyDown={e => handleOtpKeyDown(i, e)}
                      className={`w-14 h-14 text-center text-2xl font-bold rounded-xl border-2 outline-none transition-all
                        ${digit ? 'border-brand-teal bg-brand-teal/5 text-brand-teal' : 'border-gray-200 bg-gray-50 text-gray-900'}
                        focus:border-brand-teal focus:bg-white focus:ring-2 focus:ring-brand-teal/15`}
                      autoFocus={i === 0}
                    />
                  ))}
                </div>

                {/* Resend */}
                <div className="flex items-center justify-center mt-3 gap-1.5">
                  <span className="text-xs text-gray-500">Didn't receive it?</span>
                  {resendTimer > 0 ? (
                    <span className="text-xs text-gray-400">Resend in <span className="font-bold text-brand-teal">{resendTimer}s</span></span>
                  ) : (
                    <button type="button" onClick={handleResend} disabled={loading}
                      className="text-xs font-semibold text-brand-teal hover:underline flex items-center gap-1 disabled:opacity-50">
                      <RefreshCw size={11} /> Resend OTP
                    </button>
                  )}
                </div>
              </div>

              {/* Username */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Full Name / Username</label>
                <div className="relative">
                  <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="Your name"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-brand-teal focus:bg-white focus:ring-2 focus:ring-brand-teal/15 transition-all"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Create Password</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    minLength={6}
                    className="w-full pl-10 pr-11 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-brand-teal focus:bg-white focus:ring-2 focus:ring-brand-teal/15 transition-all"
                    required
                  />
                  <button type="button" onClick={() => setShowPass(v => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {/* Password strength */}
                {password.length > 0 && (
                  <div className="flex gap-1 mt-1.5">
                    {[1, 2, 3].map(i => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${
                        password.length >= i * 4
                          ? password.length >= 10 ? 'bg-green-500' : password.length >= 7 ? 'bg-amber-400' : 'bg-red-400'
                          : 'bg-gray-200'
                      }`} />
                    ))}
                    <span className={`text-[9px] ml-1 font-medium ${
                      password.length >= 10 ? 'text-green-600' : password.length >= 7 ? 'text-amber-500' : 'text-red-500'
                    }`}>
                      {password.length >= 10 ? 'Strong' : password.length >= 7 ? 'Good' : 'Weak'}
                    </span>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || !otpComplete || !username.trim() || password.length < 6}
                className="w-full bg-brand-teal text-white font-bold py-3.5 rounded-xl hover:bg-[#0d9488] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><RefreshCw size={15} className="animate-spin" /> Creating Account...</>
                ) : (
                  <><CheckCircle size={15} /> Verify & Create Account</>
                )}
              </button>

              <p className="text-[10px] text-gray-400 text-center leading-relaxed">
                By registering, you agree to UdupiGo's{' '}
                <span className="text-brand-teal font-medium">Terms of Service</span> and{' '}
                <span className="text-brand-teal font-medium">Privacy Policy</span>
              </p>
            </form>
          )}

          {/* ── LOGIN ── */}
          {step === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="yourname@gmail.com"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-brand-teal focus:bg-white focus:ring-2 focus:ring-brand-teal/15 transition-all"
                    required
                    autoFocus
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Your password"
                    className="w-full pl-10 pr-11 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-brand-teal focus:bg-white focus:ring-2 focus:ring-brand-teal/15 transition-all"
                    required
                  />
                  <button type="button" onClick={() => setShowPass(v => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !email.trim() || !password}
                className="w-full bg-brand-teal text-white font-bold py-3.5 rounded-xl hover:bg-[#0d9488] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><RefreshCw size={15} className="animate-spin" /> Signing In...</>
                ) : (
                  'Sign In'
                )}
              </button>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400">New to UdupiGo?</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              <button type="button" onClick={() => setStep('entry')}
                className="w-full border-2 border-gray-200 text-gray-800 font-semibold py-3.5 rounded-xl hover:border-brand-teal hover:text-brand-teal hover:bg-brand-teal/5 transition-all text-sm">
                Create Free Account
              </button>
            </form>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .pb-safe { padding-bottom: max(2rem, env(safe-area-inset-bottom)); }
      `}</style>
    </>
  );
};

export default AuthModal;
