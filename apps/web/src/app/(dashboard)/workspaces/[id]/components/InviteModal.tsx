import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Modal, ModalContent } from 'ui';
import { Input } from 'ui';
import { Button } from 'ui';
import { useInviteMember } from '../../../../../hooks/useWorkspaces';
import { Mail, ChevronDown } from 'lucide-react';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
}

export function InviteModal({ isOpen, onClose, workspaceId }: InviteModalProps) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<{ email: string }>();
  const [role, setRole] = useState('EDITOR');
  const inviteMember = useInviteMember();

  const onSubmit = async (data: { email: string }) => {
    try {
      await inviteMember.mutateAsync({ workspaceId, email: data.email, role });
      reset();
      onClose();
    } catch {
      // error toast handled in hook
    }
  };

  return (
    <Modal open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <ModalContent className="sm:max-w-md p-6">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Mail className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold tracking-tight">Invite Member</h3>
              <p className="text-sm text-muted-foreground">Invite a new member to this workspace.</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Email Address</label>
            <Input
              {...register('email', { required: true, pattern: /^\S+@\S+$/i })}
              placeholder="user@example.com"
              className="w-full"
              type="email"
            />
            {errors.email && <span className="text-xs text-destructive mt-1 block">A valid email is required</span>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Role</label>
            <div className="relative">
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full h-10 appearance-none rounded-md border border-input bg-background px-3 pr-8 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="ADMIN">Admin — Full management access</option>
                <option value="EDITOR">Editor — Create and edit content</option>
                <option value="VIEWER">Viewer — Read-only access</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" type="button" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={inviteMember.isPending}>
              {inviteMember.isPending ? 'Sending...' : 'Send Invitation'}
            </Button>
          </div>
        </form>
      </ModalContent>
    </Modal>
  );
}
