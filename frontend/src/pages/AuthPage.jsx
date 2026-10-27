import { useState } from 'react';
import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import AmbientBackground from '../components/common/AmbientBackground';
import Toast from '../components/common/Toast';
import AnimatedAppName from '../components/common/AnimatedAppName';

export default function AuthPage({
  toast,
  onCloseToast,
  onLogin,
  onSignup,
  isSubmitting,
  authError,
  setAuthError,
}) {
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'signup'
  const [signupName, setSignupName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (authMode === 'login') {
      onLogin({ email: authEmail, password: authPassword });
    } else {
      onSignup({
        name: signupName,
        email: authEmail,
        password: authPassword,
        onSuccess: () => {
          setAuthMode('login');
          setAuthPassword('');
        },
      });
    }
  };

  return (
    <div className="flex min-h-screen w-screen flex-col items-center justify-center bg-black text-[#E3E3E3] relative overflow-hidden px-4">
      <AmbientBackground />

      {/* Fixed Top-Left "MemBrain" Brand Title */}
      <div className="fixed top-4 left-6 z-50 flex items-center select-none pointer-events-auto">
        <AnimatedAppName className="text-[1.35rem] tracking-wider text-[#E3E3E3] major-mono-display-regular" />
      </div>

      {/* Global Toast Notification */}
      <Toast toast={toast} onClose={onCloseToast} />

      {/* Centered Auth Card */}
      <div
        className="max-w-md w-[90%] mx-auto relative z-10 bg-[#111214] border border-[#333538] rounded-3xl p-8"
        style={{
          boxShadow:
            '0 8px 85px 25px rgba(79, 112, 229, 0.10), 0 12px 140px 45px rgba(56, 102, 214, 0.07), 0 16px 50px 10px rgba(0, 0, 0, 0.75)',
        }}
      >
        {/* Header inside Card: Segmented pill toggle */}
        <div className="flex items-center justify-center mb-6">
          <div className="flex items-center bg-[#1E1F20] border border-[#333538] rounded-full p-1 shadow-inner w-full max-w-[280px]">
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setAuthError(null);
              }}
              className={`flex-1 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all text-center cursor-pointer ${authMode === 'login'
                ? 'bg-[#333538] text-[#E3E3E3] shadow-sm'
                : 'text-[#C4C7C5] hover:text-[#E3E3E3]'
                }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('signup');
                setAuthError(null);
              }}
              className={`flex-1 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all text-center cursor-pointer ${authMode === 'signup'
                ? 'bg-[#333538] text-[#E3E3E3] shadow-sm'
                : 'text-[#C4C7C5] hover:text-[#E3E3E3]'
                }`}
            >
              Create Account
            </button>
          </div>
        </div>

        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight bg-gradient-to-b from-white via-[#E3E3E3] to-[#8E918F] bg-clip-text text-transparent">
            {authMode === 'login' ? 'Welcome back' : 'Create your MemBrain'}
          </h1>
          <p className="text-sm text-[#9AA0A6] mt-1.5">
            {authMode === 'login'
              ? 'Access your personal memories and thoughts.'
              : 'Start your private, indexed writing sanctuary.'}
          </p>
        </div>

        {/* Error Message */}
        {authError && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0 text-rose-400" />
            <span>{authError}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {authMode === 'signup' && (
            <div>
              <label className="block text-xs font-medium text-[#C4C7C5] mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                value={signupName}
                onChange={(e) => setSignupName(e.target.value)}
                placeholder="e.g. Bruce Wayne"
                className="bg-[#1E1F20] border border-[#333538] focus:border-[#4E95FF]/60 rounded-2xl px-4 py-3 text-sm text-[#E3E3E3] placeholder-[#5F6368] outline-none transition-all w-full"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-[#C4C7C5] mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={authEmail}
              onChange={(e) => setAuthEmail(e.target.value)}
              placeholder="name@example.com"
              className="bg-[#1E1F20] border border-[#333538] focus:border-[#4E95FF]/60 rounded-2xl px-4 py-3 text-sm text-[#E3E3E3] placeholder-[#5F6368] outline-none transition-all w-full"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#C4C7C5] mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                placeholder={authMode === 'signup' ? 'At least 6 characters' : 'Enter your password'}
                className="bg-[#1E1F20] border border-[#333538] focus:border-[#4E95FF]/60 rounded-2xl pl-4 pr-11 py-3 text-sm text-[#E3E3E3] placeholder-[#5F6368] outline-none transition-all w-full"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8E918F] hover:text-[#E3E3E3] transition-colors p-1 cursor-pointer"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-full font-medium text-sm bg-[#E3E3E3] text-black hover:bg-white shadow-[0_0_20px_rgba(255,255,255,0.15)] transition-all cursor-pointer !mt-14 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <Loader2 size={16} className="animate-spin text-black" />
            ) : authMode === 'login' ? (
              'Sign In'
            ) : (
              'Create Account'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

