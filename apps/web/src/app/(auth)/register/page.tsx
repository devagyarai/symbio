'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { api } from '../../../lib/api';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setError('');
    setSuccess('');

    try {
      await api.post('/auth/register', data);
      
      const successMsg = 'Registration successful! Please check your email to verify your account.';
      setSuccess(successMsg);
      toast.success(successMsg);
      
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err: any) {
      if (err.response?.data?.errors) {
        const errMsg = err.response.data.errors[0]?.message || 'Invalid input';
        setError(errMsg);
        toast.error(errMsg);
      } else {
        const errMsg = err.response?.data?.error || 'Registration failed. Please try again.';
        setError(errMsg);
        toast.error(errMsg);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-zinc-900 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Create an account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-zinc-400">
            Or{' '}
            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
              sign in to your existing account
            </Link>
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm p-3 rounded-md text-center">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 text-sm p-3 rounded-md text-center">
            {success}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="rounded-md space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 placeholder-gray-500 dark:placeholder-zinc-500 text-gray-900 dark:text-white bg-white dark:bg-zinc-950 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Jane Doe"
                disabled={isSubmitting || !!success}
                {...register('name')}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 placeholder-gray-500 dark:placeholder-zinc-500 text-gray-900 dark:text-white bg-white dark:bg-zinc-950 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="you@example.com"
                disabled={isSubmitting || !!success}
                {...register('email')}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 placeholder-gray-500 dark:placeholder-zinc-500 text-gray-900 dark:text-white bg-white dark:bg-zinc-950 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="••••••••"
                disabled={isSubmitting || !!success}
                {...register('password')}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password.message}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting || !!success}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating account...' : 'Create account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
