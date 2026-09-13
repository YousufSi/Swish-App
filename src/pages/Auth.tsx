import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBasket as Basketball, Mail, Lock, User, Chrome, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase/client';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        navigate('/');
      }
    };
    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        console.log('User signed in:', session.user);
        navigate('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleEmailSignIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      // Validate email format
      if (!email || !email.includes('@')) {
        alert('Please enter a valid email address');
        return;
      }
      
      // Validate password
      if (!password || password.length < 6) {
        alert('Password must be at least 6 characters long');
        return;
      }
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('Error signing in:', error.message);
        
        // Handle specific error cases
        if (error.message.includes('Invalid login credentials')) {
          alert('Invalid email or password. Please check your credentials and try again.');
        } else if (error.message.includes('Email not confirmed')) {
          alert('Please check your email and click the confirmation link before signing in.');
        } else if (error.message.includes('Too many requests')) {
          alert('Too many login attempts. Please wait a few minutes and try again.');
        } else {
          alert(`Error signing in: ${error.message}`);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Connection error. Please check your internet connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignUp = async (email: string, password: string, fullName: string) => {
    try {
      setLoading(true);
      
      // Validate inputs
      if (!email || !email.includes('@')) {
        alert('Please enter a valid email address');
        return;
      }
      
      if (!password || password.length < 6) {
        alert('Password must be at least 6 characters long');
        return;
      }
      
      if (!fullName || fullName.trim().length < 2) {
        alert('Please enter your full name (at least 2 characters)');
        return;
      }
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/auth?confirmed=true`
        }
      });
      
      if (error) {
        console.error('Error signing up:', error.message);
        
        // Handle specific error cases
        if (error.message.includes('User already registered')) {
          alert('An account with this email already exists. Please sign in instead.');
        } else if (error.message.includes('Password should be at least')) {
          alert('Password must be at least 6 characters long');
        } else if (error.message.includes('Unable to validate email address')) {
          alert('Please enter a valid email address');
        } else {
          alert(`Error creating account: ${error.message}`);
        }
      } else {
        alert('Account created successfully! Please check your email for a confirmation link, then sign in.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Connection error. Please check your internet connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);
      console.log('Initiating Google OAuth...');
      
      // Check if we have a valid Supabase URL
      if (!import.meta.env.VITE_SUPABASE_URL) {
        alert('Authentication service is not configured. Please contact support.');
        return;
      }
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth?provider=google`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        }
      });
      
      if (error) {
        console.error('Error signing in with Google:', error.message);
        
        if (error.message.includes('OAuth') || error.message.includes('provider')) {
          alert('Google sign-in is not available right now. Please use email sign-in instead.');
        } else if (error.message.includes('popup')) {
          alert('Please allow popups for this site and try again.');
        } else if (error.message.includes('network')) {
          alert('Network error. Please check your connection and try again.');
        } else {
          alert('Google sign-in failed. Please try email sign-in instead.');
        }
        console.log('Google OAuth error details:', error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An unexpected error occurred. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleForgotPassword = async (email: string) => {
    try {
      setResetLoading(true);
      
      // Validate email
      if (!email || !email.includes('@')) {
        alert('Please enter a valid email address');
        return;
      }
      
      console.log('Sending password reset email to:', email);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?reset=true`,
      });
      
      if (error) {
        console.error('Error sending reset email:', error.message);
        
        // Handle specific error cases
        if (error.message.includes('Email rate limit exceeded')) {
          alert('Too many reset requests. Please wait a few minutes before trying again.');
        } else if (error.message.includes('Invalid email')) {
          alert('Please enter a valid email address.');
        } else if (error.message.includes('User not found')) {
          alert('No account found with this email address. Please check the email or create a new account.');
        } else if (error.message.includes('Email not enabled')) {
          alert('Password reset via email is not available. Please contact support.');
        } else {
          alert(`Unable to send reset email: ${error.message}`);
        }
      } else {
        alert('Password reset email sent! Please check your inbox (and spam folder) for instructions.');
        setShowForgotPassword(false);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Connection error. Please check your internet connection and try again.');
    } finally {
      setResetLoading(false);
    }
  };
  
  // Handle URL parameters for auth callbacks
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const confirmed = urlParams.get('confirmed');
    const reset = urlParams.get('reset');
    const provider = urlParams.get('provider');
    const error = urlParams.get('error');
    
    if (confirmed === 'true') {
      alert('Email confirmed! You can now sign in.');
      // Clean up URL
      window.history.replaceState({}, document.title, '/auth');
    }
    
    if (reset === 'true') {
      alert('Please enter your new password.');
      // Clean up URL
      window.history.replaceState({}, document.title, '/auth');
    }
    
    if (provider === 'google') {
      // Handle Google OAuth callback
      console.log('Google OAuth callback received');
      // Clean up URL
      window.history.replaceState({}, document.title, '/auth');
    }
    
    if (error) {
      console.error('Auth error from URL:', error);
      alert('Authentication error occurred. Please try again.');
      // Clean up URL
      window.history.replaceState({}, document.title, '/auth');
    }
  }, []);

  if (showForgotPassword) {
    return (
      <div className="min-h-screen bg-white dark:bg-nike-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <Basketball className="mx-auto h-16 w-16 text-nike-red" />
            <h2 className="mt-6 nike-heading text-3xl">Reset Password</h2>
            <p className="mt-2 text-nike-gray-600 dark:text-nike-gray-400 font-medium">
              Enter your email to receive reset instructions
            </p>
          </div>

          <div className="mt-8 bg-white dark:bg-nike-gray-800 border border-nike-gray-200 dark:border-nike-gray-700 py-8 px-6 shadow-lg rounded-lg transition-colors duration-300">
            <ForgotPasswordForm 
              onResetPassword={handleForgotPassword}
              onBack={() => setShowForgotPassword(false)}
              loading={resetLoading}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-nike-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Basketball className="mx-auto h-16 w-16 text-nike-red" />
          <h2 className="mt-6 nike-heading text-3xl">Welcome to Swish</h2>
          <p className="mt-2 text-nike-gray-600 dark:text-nike-gray-400 font-medium">Find basketball games near you</p>
        </div>

        <div className="mt-8 bg-white dark:bg-nike-gray-800 border border-nike-gray-200 dark:border-nike-gray-700 py-8 px-6 shadow-lg rounded-lg transition-colors duration-300">
          {/* Google Sign In Button */}
          <div className="mb-6">
            <button
              onClick={handleGoogleSignIn}
              disabled={googleLoading || loading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-nike-gray-300 dark:border-nike-gray-600 rounded-md shadow-sm bg-white dark:bg-nike-gray-700 text-nike-black dark:text-nike-white hover:bg-nike-gray-50 dark:hover:bg-nike-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-nike-red transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {googleLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-nike-red"></div>
              ) : (
                <Chrome className="h-5 w-5 text-nike-red" />
              )}
              <span className="font-medium">
                {googleLoading ? 'Signing in...' : 'Continue with Google'}
              </span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-nike-gray-300 dark:border-nike-gray-600" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-nike-gray-800 text-nike-gray-500 dark:text-nike-gray-400 font-medium">
                Or continue with email
              </span>
            </div>
          </div>

          <EmailAuthForm 
            onSignIn={handleEmailSignIn}
            onSignUp={handleEmailSignUp}
            onForgotPassword={() => setShowForgotPassword(true)}
            loading={loading}
            disabled={googleLoading}
          />
        </div>

        {/* Additional Info */}
        <div className="text-center">
          <p className="text-xs text-nike-gray-500 dark:text-nike-gray-400">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}

interface EmailAuthFormProps {
  onSignIn: (email: string, password: string) => void;
  onSignUp: (email: string, password: string, fullName: string) => void;
  onForgotPassword: () => void;
  loading: boolean;
  disabled: boolean;
}

function EmailAuthForm({ onSignIn, onSignUp, onForgotPassword, loading, disabled }: EmailAuthFormProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignUp) {
      if (!fullName.trim()) {
        alert('Please enter your full name');
        return;
      }
      onSignUp(email, password, fullName);
    } else {
      onSignIn(email, password);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {isSignUp && (
        <div>
          <label htmlFor="fullName" className="block text-sm font-bold text-nike-black dark:text-nike-white uppercase tracking-wider mb-2">
            <User className="inline h-4 w-4 mr-2" />
            Full Name
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            required={isSignUp}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            disabled={disabled}
            className="mt-1 appearance-none relative block w-full px-4 py-3 border border-nike-gray-300 dark:border-nike-gray-600 placeholder-nike-gray-500 dark:placeholder-nike-gray-400 text-nike-black dark:text-nike-white bg-white dark:bg-nike-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-nike-red focus:border-nike-red transition-colors duration-200 disabled:opacity-50"
            placeholder="Enter your full name"
          />
        </div>
      )}
      
      <div>
        <label htmlFor="email" className="block text-sm font-bold text-nike-black dark:text-nike-white uppercase tracking-wider mb-2">
          <Mail className="inline h-4 w-4 mr-2" />
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={disabled}
          className="mt-1 appearance-none relative block w-full px-4 py-3 border border-nike-gray-300 dark:border-nike-gray-600 placeholder-nike-gray-500 dark:placeholder-nike-gray-400 text-nike-black dark:text-nike-white bg-white dark:bg-nike-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-nike-red focus:border-nike-red transition-colors duration-200 disabled:opacity-50"
          placeholder="Enter your email"
        />
      </div>
      
      <div>
        <label htmlFor="password" className="block text-sm font-bold text-nike-black dark:text-nike-white uppercase tracking-wider mb-2">
          <Lock className="inline h-4 w-4 mr-2" />
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete={isSignUp ? "new-password" : "current-password"}
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={disabled}
          className="mt-1 appearance-none relative block w-full px-4 py-3 border border-nike-gray-300 dark:border-nike-gray-600 placeholder-nike-gray-500 dark:placeholder-nike-gray-400 text-nike-black dark:text-nike-white bg-white dark:bg-nike-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-nike-red focus:border-nike-red transition-colors duration-200 disabled:opacity-50"
          placeholder="Enter your password"
          minLength={6}
        />
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={loading || disabled}
          className="nike-button w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Please wait...
            </>
          ) : (
            isSignUp ? 'Create Account' : 'Sign In'
          )}
        </button>
      </div>

      <div className="text-center pt-4">
        <button
          type="button"
          onClick={() => setIsSignUp(!isSignUp)}
          disabled={disabled}
          className="text-nike-red hover:text-nike-black dark:hover:text-nike-white font-bold transition-colors duration-200 disabled:opacity-50"
        >
          {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
        </button>
        
        {!isSignUp && (
          <div className="mt-3">
            <button
              type="button"
              onClick={onForgotPassword}
              disabled={disabled}
              className="text-sm text-nike-gray-600 dark:text-nike-gray-400 hover:text-nike-red transition-colors duration-200 disabled:opacity-50"
            >
              Forgot your password?
            </button>
          </div>
        )}
      </div>
    </form>
  );
}

interface ForgotPasswordFormProps {
  onResetPassword: (email: string) => void;
  onBack: () => void;
  loading: boolean;
}

function ForgotPasswordForm({ onResetPassword, onBack, loading }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      alert('Please enter your email address');
      return;
    }
    onResetPassword(email);
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <label htmlFor="reset-email" className="block text-sm font-bold text-nike-black dark:text-nike-white uppercase tracking-wider mb-2">
          <Mail className="inline h-4 w-4 mr-2" />
          Email Address
        </label>
        <input
          id="reset-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          className="mt-1 appearance-none relative block w-full px-4 py-3 border border-nike-gray-300 dark:border-nike-gray-600 placeholder-nike-gray-500 dark:placeholder-nike-gray-400 text-nike-black dark:text-nike-white bg-white dark:bg-nike-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-nike-red focus:border-nike-red transition-colors duration-200 disabled:opacity-50"
          placeholder="Enter your email address"
        />
      </div>
      <div className="pt-2 space-y-3">
        <button
          type="submit"
          disabled={loading}
          className="nike-button w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Sending Reset Email...
            </>
          ) : (
            <>
              <Mail className="h-4 w-4" />
              Send Reset Email
            </>
          )}
        </button>
        
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="nike-button-outline w-full disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Sign In
        </button>
      </div>
      
      <div className="text-center pt-4">
        <p className="text-xs text-nike-gray-500 dark:text-nike-gray-400">
          We'll send you an email with instructions to reset your password.
        </p>
      </div>
    </form>
  );
}