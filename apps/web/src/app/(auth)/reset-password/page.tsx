'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { api } from '../../../lib/api';

const resetPasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  confirmPassword: z.string().min(8, 'Confirm Password must be at least 8 characters long'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const onSubmit = async (data: ResetPasswordFormValues) => {
    setError('');

    if (!token) {
      setError('Invalid or missing reset token.');
      return;
    }

    try {
      await api.post('/auth/reset-password', { token, password: data.password });
      setSuccess(true);
      toast.success('Password successfully reset');
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err: any) {
      if (err.response?.data?.errors) {
        const errMsg = err.response.data.errors[0]?.message || 'Invalid input';
        setError(errMsg);
        toast.error(errMsg);
      } else {
        const errMsg = err.response?.data?.error || 'Failed to reset password. The token may be invalid or expired.';
        setError(errMsg);
        toast.error(errMsg);
      }
    }
  };

  if (!token && !error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full p-8 rounded-xl shadow-sm border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-center">
          <p>Invalid or missing reset token.</p>
          <div className="mt-4">
            <Link href="/forgot-password" className="text-blue-600 hover:text-blue-500 font-medium text-sm">
              Request a new reset link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-zinc-900 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Set new password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-zinc-400">
            Please enter your new password below.
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm p-3 rounded-md text-center">
            {error}
          </div>
        )}

        {success ? (
          <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 text-sm p-4 rounded-md text-center">
            <h3 className="font-semibold text-lg mb-2">Password reset successful</h3>
            <p>Your password has been successfully updated. Redirecting to sign in...</p>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="rounded-md space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
                  New Password
                </label>
                <input
                  id="password"
                  type="password"
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 placeholder-gray-500 dark:placeholder-zinc-500 text-gray-900 dark:text-white bg-white dark:bg-zinc-950 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="••••••••"
                  disabled={isSubmitting}
                  {...register('password')}
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password.message}</p>
                )}
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 placeholder-gray-500 dark:placeholder-zinc-500 text-gray-900 dark:text-white bg-white dark:bg-zinc-950 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="••••••••"
                  disabled={isSubmitting}
                  {...register('confirmPassword')}
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Resetting...' : 'Reset Password'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950">Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
