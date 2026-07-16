'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Button, Input } from 'ui';
import { api } from '../../../lib/api';
import { AuthLayout } from '../../../components/auth/AuthLayout';
import { Mail, Loader2, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

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
    <AuthLayout 
      title="Reset your password" 
      subtitle={
        !success && "Enter your email address and we'll send you a link to reset your password."
      }
    >
      {error && (
        <div className="mb-6 bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded-xl text-center">
          {error}
        </div>
      )}

      {success ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6"
        >
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center border-4 border-background shadow-inner">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-2">Check your email</h3>
            <p className="text-muted-foreground text-sm">
              If an account exists for <span className="font-medium text-foreground">{emailValue}</span>, we have sent a password reset link.
            </p>
          </div>
          <div className="pt-4">
            <Link href="/login" className="inline-flex items-center justify-center w-full h-11 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-xl font-medium transition-colors">
              Return to sign in
            </Link>
          </div>
        </motion.div>
      ) : (
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
                <span className="relative z-10">Send reset link</span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
              </>
            )}
          </Button>
          
          <div className="text-center mt-6">
            <Link href="/login" className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
              Back to sign in
            </Link>
          </div>
        </form>
      )}
    </AuthLayout>
  );
}
