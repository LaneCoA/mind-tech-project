'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const handleLogin = async () => {
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return
    } 
    router.refresh()
    router.push('/dashboard')
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl p-8 space-y-6">
        {/* Logo / Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white">
            🔒
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Project AI
          </h1>
          <p className="text-sm text-gray-500">
            Powered by Arkus Nexus
          </p>
        </div>

        {/* Welcome */}
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-gray-900">
            Welcome
          </h2>
          <p className="text-sm text-gray-500">
            Sign in to your secure terminal
          </p>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">
              Work Email
            </label>
            <input
              type="email"
              placeholder="name@organization.ai"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Password
              </label>
              <button
                type="button"
                className="text-sm text-indigo-600 hover:underline"
              >
                Forgot?
              </button>
            </div>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
          >
            {loading ? 'Signing in…' : 'Sign In →'}
          </button>
        </div>

        {/* Divider */}
        {/* <div className="flex items-center gap-3 text-xs text-gray-400">
          <div className="h-px flex-1 bg-gray-200" />
          ENTERPRISE
          <div className="h-px flex-1 bg-gray-200" />
        </div> */}

        {/* SSO */}
        {/* <button
          className="w-full rounded-xl border border-gray-300 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
        >
          🏛️ SSO Enterprise Login
        </button> */}

        {/* Footer */}
        {/*<div className="text-center text-xs text-gray-400 space-y-1">
          <p>🔐 AES-256 Encrypted Session</p>
          <p>Authorized internal access only</p>
        </div>*/}
      </div>
    </div>
  );
}
