import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { auth, googleProvider } from '../firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { Zap, Mail, Lock, User, Eye, EyeOff, ArrowRight, ArrowLeft, Globe, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function AuthPage() {
  const [mode, setMode] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const { login } = useApp();
  const navigate = useNavigate();

  const getErrorMessage = (code) => {
    switch (code) {
      case 'auth/invalid-email': return 'Invalid email address.';
      case 'auth/user-not-found': return 'No account found with this email.';
      case 'auth/wrong-password': return 'Incorrect password.';
      case 'auth/invalid-credential': return 'Incorrect email or password.';
      case 'auth/email-already-in-use': return 'An account with this email already exists.';
      case 'auth/weak-password': return 'Password must be at least 6 characters.';
      case 'auth/popup-closed-by-user': return 'Google sign-in was cancelled.';
      case 'auth/too-many-requests': return 'Too many attempts. Please try again later.';
      default: return 'Something went wrong. Please try again.';
    }
  };

  // Google Sign In
  const handleGoogle = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      login(result.user); // ← pass real Firebase user
      navigate('/app');
    } catch (err) {
      setError(getErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  // Email/Password Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'login') {
        const result = await signInWithEmailAndPassword(auth, email, password);
        login(result.user); // ← pass real Firebase user
      } else {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        if (name.trim()) {
          await updateProfile(result.user, { displayName: name.trim() });
        }
         login({ uid: result.user.uid, email: result.user.email, displayName: name.trim() || result.user.email, photoURL: result.user.photoURL }); // ← pass real Firebase user
      }
      navigate('/app');
    } catch (err) {
      setError(getErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  // Forgot Password
  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setError('Enter your email above first, then click Forgot password.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
    } catch (err) {
      setError(getErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setError('');
    setResetSent(false);
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-[380px]"
      >
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-sm text-text-tertiary hover:text-text-secondary transition-colors mb-4"
        >
          <ArrowLeft size={15} /> Back to home
        </button>

        <div className="card p-7">
          <div className="text-center mb-7">
            <div className="w-10 h-10 rounded-xl bg-accent-blue flex items-center justify-center mx-auto mb-4">
              <Zap size={18} className="text-white" />
            </div>
            <h1 className="text-lg font-semibold text-text-primary">
              {mode === 'login' ? 'Welcome back' : 'Create account'}
            </h1>
            <p className="text-sm text-text-tertiary mt-1">
              {mode === 'login' ? 'Sign in to continue' : 'Get started with NexusAI'}
            </p>
          </div>

          {/* Google Button */}
          <button
            type="button"
            onClick={handleGoogle}
            disabled={loading}
            className="btn-secondary w-full flex items-center justify-center gap-2.5 mb-5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Globe size={16} /> Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-text-muted">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Reset sent success */}
          {resetSent && (
            <div className="flex items-center gap-2 text-xs text-green-400 mb-4 bg-green-400/10 px-3 py-2 rounded-lg">
              <CheckCircle2 size={13} />
              <span>Password reset email sent! Check your inbox.</span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 text-xs text-red-400 mb-4 bg-red-400/10 px-3 py-2 rounded-lg">
              <AlertCircle size={13} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'signup' && (
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="text"
                  placeholder="Full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input pl-9"
                />
              </div>
            )}
            <div className="relative">
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                className="input pl-9"
                required
              />
            </div>
            <div className="relative">
              <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                className="input pl-9 pr-9"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            {mode === 'login' && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-xs text-accent-blue hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full !py-2.5 flex items-center justify-center gap-2 mt-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>{mode === 'login' ? 'Sign In' : 'Create Account'} <ArrowRight size={15} /></>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-text-tertiary mt-5">
            {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              type="button"
              onClick={switchMode}
              className="text-accent-blue hover:underline"
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}