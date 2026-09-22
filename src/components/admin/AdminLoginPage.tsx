import React, { useState } from 'react';
import { useJobs } from '../../context/JobContext';
import { Shield, Lock, User, Eye, EyeOff, ArrowLeft, ArrowRight, AlertCircle } from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  const { loginAdmin, navigateToView } = useJobs();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!username.trim() || !password) {
      setErrorMessage('Invalid username or password');
      return;
    }

    setIsLoading(true);
    try {
      const result = await loginAdmin(username, password);
      if (result.success) {
        navigateToView('admin');
      } else {
        setErrorMessage(result.error || 'Invalid username or password');
      }
    } catch {
      setErrorMessage('Invalid username or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center items-center px-4 sm:px-6 py-12 bg-[#FBF9F5]">
      {/* Top Editorial Rule */}
      <div className="w-full max-w-md mb-8 text-center">
        <button
          type="button"
          onClick={() => navigateToView('home')}
          className="inline-flex items-center gap-1.5 text-xs text-[#71717A] hover:text-[#7A1C28] transition-colors mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Public Publication</span>
        </button>

        <div className="flex items-center justify-center gap-2 mb-2">
          <Shield className="w-4 h-4 text-[#7A1C28]" />
          <span className="text-[11px] font-mono tracking-[0.25em] uppercase text-[#7A1C28] font-bold">
            The Role Dispatch
          </span>
        </div>
        <h1 className="font-serif text-3xl font-bold tracking-tight text-[#141416]">
          Editorial Desk
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-[#52525B]">
          Authorized editorial access for publication management.
        </p>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md bg-[#FFFFFF] border border-[#E7E2D9] p-6 sm:p-8 shadow-xs">
        {/* Error message banner */}
        {errorMessage && (
          <div
            id="admin-login-error"
            className="mb-6 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2.5"
            role="alert"
          >
            <AlertCircle className="w-4 h-4 text-rose-700 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Username Field */}
          <div>
            <label
              htmlFor="admin-login-username"
              className="block text-xs font-bold uppercase tracking-wider text-[#141416] mb-1.5"
            >
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#71717A]">
                <User className="w-4 h-4" />
              </div>
              <input
                id="admin-login-username"
                type="text"
                autoComplete="username"
                autoFocus
                required
                value={username}
                onChange={e => {
                  setUsername(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                placeholder="Enter administrator username"
                className="w-full pl-9 pr-3 py-2.5 bg-[#FAF8F5] border border-[#E7E2D9] text-xs sm:text-sm text-[#141416] placeholder-[#71717A] focus:outline-none focus:border-[#7A1C28] focus:bg-[#FFFFFF] transition-colors"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label
              htmlFor="admin-login-password"
              className="block text-xs font-bold uppercase tracking-wider text-[#141416] mb-1.5"
            >
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#71717A]">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="admin-login-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={e => {
                  setPassword(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                placeholder="Enter administrator password"
                className="w-full pl-9 pr-10 py-2.5 bg-[#FAF8F5] border border-[#E7E2D9] text-xs sm:text-sm text-[#141416] placeholder-[#71717A] focus:outline-none focus:border-[#7A1C28] focus:bg-[#FFFFFF] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#71717A] hover:text-[#141416] cursor-pointer"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              id="admin-login-submit"
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-[#7A1C28] hover:bg-[#63141F] text-[#FFFFFF] text-xs font-semibold tracking-wider uppercase transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-60"
            >
              {isLoading ? (
                <span>Verifying Credentials...</span>
              ) : (
                <>
                  <span>Authenticate & Enter Desk</span>
                  <ArrowRight className="w-4 h-4 text-[#C5A059]" />
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-6 pt-5 border-t border-[#F0EBE1] text-center">
          <p className="text-[11px] text-[#71717A]">
            Security Notice: All administrative modifications are audited and recorded to the local publication register.
          </p>
        </div>
      </div>
    </div>
  );
};
