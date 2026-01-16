'use client';

import { useState, useEffect } from 'react';
import { getAllUsers, deleteUser, type UserListItem } from '@/app/admin-actions';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Search,
    Trash2,
    Loader2,
    Shield,
    User,
    Wrench,
    Car,
    AlertTriangle
} from 'lucide-react';

interface UsersContentProps {
    adminId: string;
}

export default function UsersContent({ adminId }: UsersContentProps) {
    const [users, setUsers] = useState<UserListItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('all');
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

    useEffect(() => {
        loadUsers();
    }, [adminId]);

    const loadUsers = async () => {
        setIsLoading(true);
        const result = await getAllUsers(adminId);
        if (result.success && result.users) {
            setUsers(result.users);
        }
        setIsLoading(false);
    };

    const handleDelete = async (userId: string) => {
        setDeletingId(userId);
        const result = await deleteUser(adminId, userId);
        if (result.success) {
            setUsers(prev => prev.filter(u => u.id !== userId));
        } else {
            alert(result.error || 'Failed to delete user');
        }
        setDeletingId(null);
        setConfirmDelete(null);
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch =
            user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.phone.includes(searchQuery);

        const matchesRole = roleFilter === 'all' || user.role === roleFilter;

        return matchesSearch && matchesRole;
    });

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'admin': return <Shield className="w-3 h-3" />;
            case 'mechanic': return <Wrench className="w-3 h-3" />;
            case 'breakdown': return <Car className="w-3 h-3" />;
            default: return <User className="w-3 h-3" />;
        }
    };

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'admin': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
            case 'mechanic': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
            case 'breakdown': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            case 'client': return 'bg-green-500/20 text-green-400 border-green-500/30';
            default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-slate-500" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold text-white">Users</h1>
                <span className="text-sm text-slate-400">{users.length} total</span>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <Input
                        placeholder="Search by name, email or phone..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 bg-slate-900 border-slate-800 text-white placeholder:text-slate-500"
                    />
                </div>
                <div className="flex gap-2">
                    {['all', 'admin', 'mechanic', 'breakdown', 'client'].map(role => (
                        <Button
                            key={role}
                            variant={roleFilter === role ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setRoleFilter(role)}
                            className={roleFilter === role
                                ? 'bg-orange-500 hover:bg-orange-600'
                                : 'border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800'
                            }
                        >
                            {role === 'all' ? 'All' : role.charAt(0).toUpperCase() + role.slice(1)}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Users Table */}
            <Card className="bg-slate-900 border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-800">
                                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">User</th>
                                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Contact</th>
                                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Role</th>
                                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Status</th>
                                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Joined</th>
                                <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {filteredUsers.map(user => (
                                <tr key={user.id} className="hover:bg-slate-800/50 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-sm font-medium text-white">
                                                {user.fullName.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-medium text-white text-sm">{user.fullName}</p>
                                                <p className="text-xs text-slate-500 font-mono">{user.id.slice(0, 8)}...</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <p className="text-sm text-slate-300">{user.email}</p>
                                        <p className="text-xs text-slate-500">{user.phone}</p>
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge variant="outline" className={`text-xs ${getRoleBadgeColor(user.role)}`}>
                                            <span className="mr-1">{getRoleIcon(user.role)}</span>
                                            {user.role}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3">
                                        {user.isVerified ? (
                                            <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                                                Verified
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-xs border-slate-600 text-slate-400">
                                                Unverified
                                            </Badge>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <p className="text-sm text-slate-400">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </p>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        {confirmDelete === user.id ? (
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => setConfirmDelete(null)}
                                                    className="text-slate-400 hover:text-white h-7 px-2"
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleDelete(user.id)}
                                                    disabled={deletingId === user.id}
                                                    className="bg-red-600 hover:bg-red-700 h-7 px-2"
                                                >
                                                    {deletingId === user.id ? (
                                                        <Loader2 className="w-3 h-3 animate-spin" />
                                                    ) : (
                                                        'Confirm'
                                                    )}
                                                </Button>
                                            </div>
                                        ) : (
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => setConfirmDelete(user.id)}
                                                disabled={user.role === 'admin'}
                                                className="text-slate-400 hover:text-red-400 hover:bg-red-500/10 h-7 px-2 disabled:opacity-30 disabled:cursor-not-allowed"
                                                title={user.role === 'admin' ? 'Cannot delete admin users' : 'Delete user'}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredUsers.length === 0 && (
                    <div className="text-center py-12">
                        <User className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                        <p className="font-medium text-white">No users found</p>
                        <p className="text-sm text-slate-500 mt-1">
                            {searchQuery || roleFilter !== 'all'
                                ? 'Try adjusting your filters'
                                : 'No users in the database'}
                        </p>
                    </div>
                )}
            </Card>

            {/* Warning */}
            <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                    <p className="text-sm font-medium text-amber-400">Database Users</p>
                    <p className="text-xs text-amber-500/80 mt-1">
                        These users are stored in your local PostgreSQL database. If you delete users here,
                        they may still exist in Supabase Auth. Make sure to delete them from both places.
                    </p>
                </div>
            </div>
        </div>
    );
}
