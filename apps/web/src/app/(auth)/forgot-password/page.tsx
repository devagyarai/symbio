'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Button, Input, GlassCard } from 'ui';
import { api } from '../../../lib/api';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const emailValue = watch('email');

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setError('');

    try {
      await api.post('/auth/forgot-password', data);
      setSuccess(true);
      toast.success('Password reset link sent (if the email exists)');
    } catch (err: any) {
      if (err.response?.data?.errors) {
        const errMsg = err.response.data.errors[0]?.message || 'Invalid input';
        setError(errMsg);
        toast.error(errMsg);
      } else {
        const errMsg = err.response?.data?.error || 'Failed to request password reset. Please try again later.';
        setError(errMsg);
        toast.error(errMsg);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950 py-12 px-4 sm:px-6 lg:px-8">
      <GlassCard className="max-w-md w-full space-y-8 p-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Reset your password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-zinc-400">
            Enter your email address and we&apos;ll send you a link to reset your password.
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm p-3 rounded-md text-center">
            {error}
          </div>
        )}

        {success ? (
          <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 text-sm p-4 rounded-md text-center">
            <h3 className="font-semibold text-lg mb-2">Check your email</h3>
            <p>If an account exists for {emailValue}, we have sent a password reset link.</p>
            <div className="mt-6">
              <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
                Return to sign in
              </Link>
            </div>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="rounded-md space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
                  Email address
                </label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  disabled={isSubmitting}
                  {...register('email')}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>
                )}
              </div>
            </div>

            <div>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? 'Sending...' : 'Send reset link'}
              </Button>
            </div>
            
            <div className="text-center mt-4">
              <Link href="/login" className="font-medium text-sm text-gray-600 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-white">
                Back to sign in
              </Link>
            </div>
          </form>
        )}
      </GlassCard>
    </div>
  );
}
