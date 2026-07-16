'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '../../../lib/api';
import { Suspense } from 'react';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your email address...');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid or missing verification token.');
      return;
    }

    const verifyEmail = async () => {
      try {
        await api.get(`/auth/verify-email?token=${token}`);
        setStatus('success');
        setMessage('Email verified successfully! You can now sign in.');
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } catch (err: any) {
        setStatus('error');
        setMessage(err.response?.data?.error || 'Verification failed. The token may be expired or invalid.');
      }
    };

    verifyEmail();
  }, [token, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-zinc-900 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 text-center">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Email Verification
          </h2>
        </div>
        
        <div className="mt-8 space-y-6">
          {status === 'loading' && (
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="text-gray-600 dark:text-zinc-400">{message}</p>
            </div>
          )}

          {status === 'success' && (
            <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 p-4 rounded-md">
              <p>{message}</p>
              <p className="text-sm mt-2">Redirecting to login...</p>
            </div>
          )}

          {status === 'error' && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-4 rounded-md">
              <p>{message}</p>
              <div className="mt-4">
                <Link href="/login" className="text-blue-600 hover:text-blue-500 font-medium text-sm">
                  Return to login
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950">Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
