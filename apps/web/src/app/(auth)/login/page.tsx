'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Button, Input, PasswordInput, Checkbox } from 'ui';
import { api } from '../../../lib/api';
import { useAuthStore } from '../../../store/useAuthStore';
import { AuthLayout } from '../../../components/auth/AuthLayout';
import { Mail, KeyRound, Loader2 } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const checkAuth = useAuthStore(state => state.checkAuth);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setError('');

    try {
      const response = await api.post('/auth/login', data);
      
      // Store token
      localStorage.setItem('access_token', response.data.accessToken);
      
      // Load user state
      await checkAuth();
      
      toast.success('Successfully logged in');
      router.push('/dashboard');
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        'Login failed. Please check your credentials.';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  return (
    <AuthLayout 
      title="Welcome back" 
      subtitle={
        <>
          New to Symbio?{' '}
          <Link href="/register" className="font-semibold text-primary hover:text-primary/80 transition-colors">
            Create an account
          </Link>
        </>
      }
    >
      {error && (
        <div className="mb-6 bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded-xl text-center">
          {error}
        </div>
      )}

      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">Email address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                disabled={isSubmitting}
                className="pl-9 h-11"
                {...register('email')}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">Password</label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground z-10" />
              <PasswordInput
                id="password"
                autoComplete="current-password"
                placeholder="••••••••"
                disabled={isSubmitting}
                className="pl-9 h-11"
                {...register('password')}
              />
            </div>
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center space-x-2">
            <Checkbox id="remember-me" />
            <label htmlFor="remember-me" className="text-sm font-medium leading-none cursor-pointer">
              Remember me
            </label>
          </div>

          <Link href="/forgot-password" className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors">
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-11 mt-4 relative overflow-hidden group"
        >
          {isSubmitting ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <span className="relative z-10">Sign in</span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
            </>
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}
