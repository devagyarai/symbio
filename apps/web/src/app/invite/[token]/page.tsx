'use client';

import { use } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { api } from '../../../lib/api';
import { toast } from 'sonner';
import { GlassCard, Button, Skeleton } from 'ui';
import { CheckCircle2, XCircle } from 'lucide-react';

export default function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const router = useRouter();

  const { data: invite, isLoading, error } = useQuery({
    queryKey: ['invite', token],
    queryFn: async () => {
      const { data } = await api.get(`/invites/${token}`);
      return data;
    },
    retry: false,
  });

  const acceptMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post(`/invites/${token}/accept`);
      return data;
    },
    onSuccess: (data) => {
      toast.success('Invitation accepted!');
      router.push(`/workspaces/${data.workspaceId}`);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Failed to accept invitation');
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <GlassCard className="w-full max-w-md p-8 text-center space-y-4">
          <Skeleton className="w-16 h-16 rounded-full mx-auto" />
          <Skeleton className="h-6 w-3/4 mx-auto" />
          <Skeleton className="h-4 w-1/2 mx-auto" />
        </GlassCard>
      </div>
    );
  }

  if (error || !invite) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <GlassCard className="w-full max-w-md p-8 text-center">
          <XCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Invalid or Expired Invite</h1>
          <p className="text-muted-foreground mb-6">
            This invitation link is no longer valid or has expired.
          </p>
          <Button onClick={() => router.push('/dashboard')} className="w-full">
            Go to Dashboard
          </Button>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-black/5 dark:bg-white/5">
      <GlassCard className="w-full max-w-md p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold mb-2">You&apos;ve been invited!</h1>
        <p className="text-muted-foreground mb-6">
          <strong>{invite.inviter?.name}</strong> has invited you to join the <strong>{invite.workspace?.name}</strong> workspace as {invite.role.toLowerCase()}.
        </p>
        <div className="space-y-3">
          <Button 
            className="w-full" 
            size="lg" 
            onClick={() => acceptMutation.mutate()}
            disabled={acceptMutation.isPending}
          >
            {acceptMutation.isPending ? 'Accepting...' : 'Accept Invitation'}
          </Button>
          <Button 
            variant="ghost" 
            className="w-full" 
            onClick={() => router.push('/dashboard')}
            disabled={acceptMutation.isPending}
          >
            Decline
          </Button>
        </div>
      </GlassCard>
    </div>
  );
}
