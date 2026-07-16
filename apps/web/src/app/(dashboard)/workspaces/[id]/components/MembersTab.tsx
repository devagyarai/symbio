import { useState } from 'react';
import { useWorkspaceMembers, useUpdateMemberRole, useRemoveMember } from '../../../../../hooks/useWorkspaces';
import { GlassCard, Button, Badge, Skeleton, EmptyState, Avatar, AvatarImage, AvatarFallback } from 'ui';
import { UserPlus, Shield, Trash2 } from 'lucide-react';
import { InviteModal } from './InviteModal';
import { format } from 'date-fns';

interface MembersTabProps {
  workspaceId: string;
}

export function MembersTab({ workspaceId }: MembersTabProps) {
  const { data: members, isLoading } = useWorkspaceMembers(workspaceId);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const updateRole = useUpdateMemberRole();
  const removeMember = useRemoveMember();

  const handleRoleChange = (memberId: string, role: string) => {
    updateRole.mutate({ workspaceId, memberId, role });
  };

  const handleRemove = (memberId: string) => {
    if (confirm('Are you sure you want to remove this member?')) {
      removeMember.mutate({ workspaceId, memberId });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">Workspace Members</h2>
          <p className="text-sm text-muted-foreground">Manage who has access to this workspace</p>
        </div>
        <Button onClick={() => setIsInviteModalOpen(true)}>
          <UserPlus className="w-4 h-4 mr-2" />
          Invite Member
        </Button>
      </div>

      <GlassCard className="p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="w-full h-12" />
            <Skeleton className="w-full h-12" />
            <Skeleton className="w-full h-12" />
          </div>
        ) : members?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-black/5 dark:bg-white/5 border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-medium">Member</th>
                  <th className="px-6 py-4 font-medium">Role</th>
                  <th className="px-6 py-4 font-medium">Joined</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {members.map((member: any) => (
                  <tr key={member.id} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          {member.user?.avatarUrl && (
                            <AvatarImage src={member.user.avatarUrl} alt={member.user?.name || 'Member'} />
                          )}
                          <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">
                            {(member.user?.name?.[0] || member.user?.email?.[0] || '?').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-foreground">{member.user?.name || 'Unknown User'}</div>
                          <div className="text-muted-foreground text-xs">{member.user?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                        {member.role}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {format(new Date(member.createdAt), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {member.role !== 'OWNER' && (
                          <>
                            <select
                              value={member.role}
                              onChange={(e) => handleRoleChange(member.id, e.target.value)}
                              className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                              disabled={updateRole.isPending}
                            >
                              <option value="ADMIN">Admin</option>
                              <option value="EDITOR">Editor</option>
                              <option value="VIEWER">Viewer</option>
                            </select>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => handleRemove(member.id)}
                              disabled={removeMember.isPending}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState 
            icon={<Shield className="w-10 h-10 text-muted-foreground/30" />}
            title="No members"
            description="Invite someone to get started."
            action={<Button onClick={() => setIsInviteModalOpen(true)}>Invite Member</Button>}
          />
        )}
      </GlassCard>

      <InviteModal 
        isOpen={isInviteModalOpen} 
        onClose={() => setIsInviteModalOpen(false)} 
        workspaceId={workspaceId} 
      />
    </div>
  );
}
