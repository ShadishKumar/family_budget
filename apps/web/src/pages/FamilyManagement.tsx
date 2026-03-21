import { useState } from 'react';
import Header from '../components/layout/Header';
import { useAuthStore } from '../store/authStore';
import api from '../api/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserPlus, Shield, Eye, Crown, Trash2 } from 'lucide-react';

const roleIcons = {
  ADMIN: Crown,
  MEMBER: Shield,
  VIEWER: Eye,
};

const roleColors = {
  ADMIN: 'text-amber-600 bg-amber-50',
  MEMBER: 'text-blue-600 bg-blue-50',
  VIEWER: 'text-gray-600 bg-gray-50',
};

export default function FamilyManagement() {
  const { family } = useAuthStore();
  const queryClient = useQueryClient();
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'ADMIN' | 'MEMBER' | 'VIEWER'>('MEMBER');

  const { data: members = [] } = useQuery({
    queryKey: ['family-members'],
    queryFn: async () => {
      const res = await api.get('/family/members');
      return res.data;
    },
  });

  const invite = useMutation({
    mutationFn: async () => {
      const res = await api.post('/family/invite', { email: inviteEmail, role: inviteRole });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family-members'] });
      setInviteEmail('');
    },
  });

  return (
    <div>
      <Header title="Family" subtitle={family?.name ?? 'Manage your family members'} />

      <div className="p-6 max-w-2xl">
        {/* Invite member */}
        <div className="card mb-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <UserPlus size={18} /> Invite Member
          </h3>
          <div className="flex gap-3">
            <input
              type="email"
              className="input-field flex-1"
              placeholder="Email address"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
            />
            <select
              className="input-field w-32"
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as typeof inviteRole)}
            >
              <option value="MEMBER">Member</option>
              <option value="ADMIN">Admin</option>
              <option value="VIEWER">Viewer</option>
            </select>
            <button
              onClick={() => invite.mutate()}
              className="btn-primary"
              disabled={!inviteEmail || invite.isPending}
            >
              Invite
            </button>
          </div>
          {invite.isError && (
            <p className="text-sm text-red-600 mt-2">
              {(invite.error as Error & { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to invite'}
            </p>
          )}
        </div>

        {/* Members list */}
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Members</h3>
          <div className="space-y-3">
            {(members as Array<{
              id: string;
              role: keyof typeof roleIcons;
              user: { firstName: string; lastName: string; email: string };
            }>).map((member) => {
              const RoleIcon = roleIcons[member.role];
              return (
                <div key={member.id} className="flex items-center gap-4 py-3 border-b last:border-0">
                  <div className="w-10 h-10 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-bold">
                    {member.user.firstName[0]}{member.user.lastName[0]}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {member.user.firstName} {member.user.lastName}
                    </p>
                    <p className="text-sm text-gray-500">{member.user.email}</p>
                  </div>
                  <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${roleColors[member.role]}`}>
                    <RoleIcon size={14} />
                    {member.role}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
