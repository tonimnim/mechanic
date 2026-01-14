'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { getAllMechanics, setMechanicVerificationStatus, type MechanicListItem } from '@/app/admin-actions';
import {
    Search,
    Filter,
    Users,
    Wrench,
    AlertTriangle,
    BadgeCheck,
    MoreVertical,
    Phone,
    Mail,
    MapPin,
    Star,
    Clock,
    XCircle,
    CheckCircle,
    RefreshCw,
    ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useRouter } from 'next/navigation';

export default function AdminMechanicsPage() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [mechanics, setMechanics] = useState<MechanicListItem[]>([]);
    const [filteredMechanics, setFilteredMechanics] = useState<MechanicListItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [serviceFilter, setServiceFilter] = useState<'all' | 'mechanic' | 'breakdown'>('all');
    const [verificationFilter, setVerificationFilter] = useState<'all' | 'verified' | 'pending' | 'unverified'>('all');

    // Dialog state
    const [selectedMechanic, setSelectedMechanic] = useState<MechanicListItem | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogAction, setDialogAction] = useState<'verify' | 'revoke' | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);

    // Stats
    const [stats, setStats] = useState({
        total: 0,
        verified: 0,
        pending: 0,
        mechanics: 0,
        breakdown: 0
    });

    useEffect(() => {
        if (!authLoading && user?.role !== 'admin') {
            router.push('/');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        loadMechanics();
    }, [user]);

    useEffect(() => {
        filterMechanics();
    }, [mechanics, searchQuery, serviceFilter, verificationFilter]);

    async function loadMechanics() {
        if (!user?.id) return;

        setIsLoading(true);
        try {
            const result = await getAllMechanics(user.id);
            if (result.success && result.mechanics) {
                setMechanics(result.mechanics);

                // Calculate stats
                const verified = result.mechanics.filter(m => m.isVerified).length;
                const pending = result.mechanics.filter(m => m.verificationStatus === 'pending').length;
                const mechanicsCount = result.mechanics.filter(m => m.serviceType === 'mechanic').length;
                const breakdownCount = result.mechanics.filter(m => m.serviceType === 'breakdown').length;

                setStats({
                    total: result.mechanics.length,
                    verified,
                    pending,
                    mechanics: mechanicsCount,
                    breakdown: breakdownCount
                });
            }
        } catch (error) {
            console.error('Failed to load mechanics:', error);
        } finally {
            setIsLoading(false);
        }
    }

    function filterMechanics() {
        let filtered = [...mechanics];

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(m =>
                m.name.toLowerCase().includes(query) ||
                m.email.toLowerCase().includes(query) ||
                m.phone.includes(query) ||
                m.city.toLowerCase().includes(query)
            );
        }

        // Service type filter
        if (serviceFilter !== 'all') {
            filtered = filtered.filter(m => m.serviceType === serviceFilter);
        }

        // Verification filter
        if (verificationFilter === 'verified') {
            filtered = filtered.filter(m => m.isVerified);
        } else if (verificationFilter === 'pending') {
            filtered = filtered.filter(m => m.verificationStatus === 'pending');
        } else if (verificationFilter === 'unverified') {
            filtered = filtered.filter(m => !m.isVerified && m.verificationStatus !== 'pending');
        }

        setFilteredMechanics(filtered);
    }

    async function handleVerificationAction() {
        if (!user?.id || !selectedMechanic || !dialogAction) return;

        setIsUpdating(true);
        try {
            const verified = dialogAction === 'verify';
            const result = await setMechanicVerificationStatus(user.id, selectedMechanic.id, verified);

            if (result.success) {
                // Update local state
                setMechanics(prev => prev.map(m =>
                    m.id === selectedMechanic.id
                        ? { ...m, isVerified: verified }
                        : m
                ));
                setDialogOpen(false);
            }
        } catch (error) {
            console.error('Failed to update verification:', error);
        } finally {
            setIsUpdating(false);
        }
    }

    const getVerificationBadge = (mechanic: MechanicListItem) => {
        if (mechanic.isVerified) {
            return <Badge className="bg-green-100 text-green-700 border-0"><BadgeCheck className="w-3 h-3 mr-1" /> Verified</Badge>;
        }
        switch (mechanic.verificationStatus) {
            case 'pending':
                return <Badge className="bg-amber-100 text-amber-700 border-0"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
            case 'approved':
                return <Badge className="bg-blue-100 text-blue-700 border-0"><CheckCircle className="w-3 h-3 mr-1" /> Approved</Badge>;
            case 'rejected':
                return <Badge className="bg-red-100 text-red-700 border-0"><XCircle className="w-3 h-3 mr-1" /> Rejected</Badge>;
            default:
                return <Badge variant="outline" className="text-gray-500"><XCircle className="w-3 h-3 mr-1" /> Unverified</Badge>;
        }
    };

    if (authLoading || isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-slate-100 rounded-lg">
                                <Users className="w-5 h-5 text-slate-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.total}</p>
                                <p className="text-xs text-gray-500">Total</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <BadgeCheck className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.verified}</p>
                                <p className="text-xs text-gray-500">Verified</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-amber-100 rounded-lg">
                                <Clock className="w-5 h-5 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.pending}</p>
                                <p className="text-xs text-gray-500">Pending</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Wrench className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.mechanics}</p>
                                <p className="text-xs text-gray-500">Mechanics</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-100 rounded-lg">
                                <AlertTriangle className="w-5 h-5 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.breakdown}</p>
                                <p className="text-xs text-gray-500">Breakdown</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <CardTitle>Mechanics Management</CardTitle>
                            <CardDescription>
                                Search, filter, and manage all registered mechanics
                            </CardDescription>
                        </div>
                        <Button variant="outline" onClick={loadMechanics} disabled={isLoading}>
                            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Filters */}
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                placeholder="Search by name, email, phone, or city..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={serviceFilter} onValueChange={(v) => setServiceFilter(v as any)}>
                            <SelectTrigger className="w-full md:w-[180px]">
                                <SelectValue placeholder="Service Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Services</SelectItem>
                                <SelectItem value="mechanic">Mechanics</SelectItem>
                                <SelectItem value="breakdown">Breakdown</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={verificationFilter} onValueChange={(v) => setVerificationFilter(v as any)}>
                            <SelectTrigger className="w-full md:w-[180px]">
                                <SelectValue placeholder="Verification" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="verified">Verified</SelectItem>
                                <SelectItem value="pending">Pending Review</SelectItem>
                                <SelectItem value="unverified">Unverified</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Table */}
                    <div className="rounded-lg border overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50">
                                    <TableHead>Mechanic</TableHead>
                                    <TableHead>Service</TableHead>
                                    <TableHead>Location</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Rating</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredMechanics.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                                            {mechanics.length === 0
                                                ? 'No mechanics registered yet'
                                                : 'No mechanics match your filters'
                                            }
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredMechanics.map((mechanic) => (
                                        <TableRow key={mechanic.id} className="hover:bg-slate-50/50">
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${mechanic.isOnline ? 'bg-green-500' : 'bg-slate-400'}`}>
                                                        {mechanic.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{mechanic.name}</p>
                                                        <p className="text-xs text-gray-500 flex items-center gap-1">
                                                            <Mail className="w-3 h-3" /> {mechanic.email}
                                                        </p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={mechanic.serviceType === 'breakdown' ? 'border-orange-200 text-orange-600' : 'border-blue-200 text-blue-600'}>
                                                    {mechanic.serviceType === 'breakdown' ? 'Breakdown' : 'Mechanic'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1 text-sm text-gray-600">
                                                    <MapPin className="w-3 h-3" />
                                                    {mechanic.city}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {getVerificationBadge(mechanic)}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                                    <span className="font-medium">{mechanic.rating.toFixed(1)}</span>
                                                    <span className="text-xs text-gray-400">({mechanic.reviewCount})</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreVertical className="w-4 h-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem onClick={() => window.open(`tel:${mechanic.phone}`)}>
                                                            <Phone className="w-4 h-4 mr-2" /> Call
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => window.open(`mailto:${mechanic.email}`)}>
                                                            <Mail className="w-4 h-4 mr-2" /> Email
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        {mechanic.isVerified ? (
                                                            <DropdownMenuItem
                                                                className="text-red-600"
                                                                onClick={() => {
                                                                    setSelectedMechanic(mechanic);
                                                                    setDialogAction('revoke');
                                                                    setDialogOpen(true);
                                                                }}
                                                            >
                                                                <XCircle className="w-4 h-4 mr-2" /> Revoke Verification
                                                            </DropdownMenuItem>
                                                        ) : (
                                                            <DropdownMenuItem
                                                                className="text-green-600"
                                                                onClick={() => {
                                                                    setSelectedMechanic(mechanic);
                                                                    setDialogAction('verify');
                                                                    setDialogOpen(true);
                                                                }}
                                                            >
                                                                <BadgeCheck className="w-4 h-4 mr-2" /> Set as Verified
                                                            </DropdownMenuItem>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Results count */}
                    <div className="mt-4 text-sm text-gray-500">
                        Showing {filteredMechanics.length} of {mechanics.length} mechanics
                    </div>
                </CardContent>
            </Card>

            {/* Confirmation Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {dialogAction === 'verify' ? 'Set as Verified' : 'Revoke Verification'}
                        </DialogTitle>
                        <DialogDescription>
                            {dialogAction === 'verify'
                                ? `Are you sure you want to manually verify ${selectedMechanic?.name}? This will mark them as verified without payment.`
                                : `Are you sure you want to revoke verification for ${selectedMechanic?.name}? They will no longer appear in search results.`
                            }
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant={dialogAction === 'revoke' ? 'destructive' : 'default'}
                            onClick={handleVerificationAction}
                            disabled={isUpdating}
                        >
                            {isUpdating ? (
                                <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
                            ) : (
                                dialogAction === 'verify' ? 'Verify' : 'Revoke'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
