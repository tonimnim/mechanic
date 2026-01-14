'use client';

import { useState, useEffect } from 'react';
import { getAllMechanics, setMechanicVerificationStatus, type MechanicListItem } from '@/app/admin-actions';
import {
    Search,
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
    RefreshCw
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

interface Props {
    adminId: string;
}

export default function MechanicsContent({ adminId }: Props) {
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
        loadMechanics();
    }, [adminId]);

    useEffect(() => {
        filterMechanics();
    }, [mechanics, searchQuery, serviceFilter, verificationFilter]);

    async function loadMechanics() {
        if (!adminId) return;

        setIsLoading(true);
        try {
            const result = await getAllMechanics(adminId);
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

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(m =>
                m.name.toLowerCase().includes(query) ||
                m.email.toLowerCase().includes(query) ||
                m.phone.includes(query) ||
                m.city.toLowerCase().includes(query)
            );
        }

        if (serviceFilter !== 'all') {
            filtered = filtered.filter(m => m.serviceType === serviceFilter);
        }

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
        if (!adminId || !selectedMechanic || !dialogAction) return;

        setIsUpdating(true);
        try {
            const verified = dialogAction === 'verify';
            const result = await setMechanicVerificationStatus(adminId, selectedMechanic.id, verified);

            if (result.success) {
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
            return <Badge className="bg-green-500/20 text-green-400 border-0"><BadgeCheck className="w-3 h-3 mr-1" /> Verified</Badge>;
        }
        switch (mechanic.verificationStatus) {
            case 'pending':
                return <Badge className="bg-amber-500/20 text-amber-400 border-0"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
            case 'approved':
                return <Badge className="bg-blue-500/20 text-blue-400 border-0"><CheckCircle className="w-3 h-3 mr-1" /> Approved</Badge>;
            case 'rejected':
                return <Badge className="bg-red-500/20 text-red-400 border-0"><XCircle className="w-3 h-3 mr-1" /> Rejected</Badge>;
            default:
                return <Badge variant="outline" className="text-slate-500 border-slate-700"><XCircle className="w-3 h-3 mr-1" /> Unverified</Badge>;
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <RefreshCw className="w-8 h-8 animate-spin text-slate-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Main Table Card */}
            <Card className="bg-slate-900 border-slate-800">
                <CardContent className="pt-6">
                    {/* Filters */}
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <Input
                                placeholder="Search by name, email, phone, or city..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                            />
                        </div>
                        <Select value={serviceFilter} onValueChange={(v: 'all' | 'mechanic' | 'breakdown') => setServiceFilter(v)}>
                            <SelectTrigger className="w-full md:w-[180px] bg-slate-800 border-slate-700 text-white">
                                <SelectValue placeholder="Service Type" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-700">
                                <SelectItem value="all">All Services</SelectItem>
                                <SelectItem value="mechanic">Mechanics</SelectItem>
                                <SelectItem value="breakdown">Breakdown</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={verificationFilter} onValueChange={(v: 'all' | 'verified' | 'pending' | 'unverified') => setVerificationFilter(v)}>
                            <SelectTrigger className="w-full md:w-[180px] bg-slate-800 border-slate-700 text-white">
                                <SelectValue placeholder="Verification" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-700">
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="verified">Verified</SelectItem>
                                <SelectItem value="pending">Pending Review</SelectItem>
                                <SelectItem value="unverified">Unverified</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button variant="outline" onClick={loadMechanics} disabled={isLoading} className="border-slate-700 text-slate-300 hover:bg-slate-800">
                            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                    </div>

                    {/* Table */}
                    <div className="rounded-lg border border-slate-800 overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/50">
                                    <TableHead className="text-slate-300">Mechanic</TableHead>
                                    <TableHead className="text-slate-300">Service</TableHead>
                                    <TableHead className="text-slate-300">Location</TableHead>
                                    <TableHead className="text-slate-300">Status</TableHead>
                                    <TableHead className="text-slate-300">Rating</TableHead>
                                    <TableHead className="text-right text-slate-300">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredMechanics.length === 0 ? (
                                    <TableRow className="border-slate-800">
                                        <TableCell colSpan={6} className="text-center py-12 text-slate-500">
                                            {mechanics.length === 0
                                                ? 'No mechanics registered yet'
                                                : 'No mechanics match your filters'
                                            }
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredMechanics.map((mechanic) => (
                                        <TableRow key={mechanic.id} className="border-slate-800 hover:bg-slate-800/30">
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${mechanic.isOnline ? 'bg-green-600' : 'bg-slate-600'}`}>
                                                        {mechanic.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-white">{mechanic.name}</p>
                                                        <p className="text-xs text-slate-400 flex items-center gap-1">
                                                            <Mail className="w-3 h-3" /> {mechanic.email}
                                                        </p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={mechanic.serviceType === 'breakdown' ? 'border-orange-500/50 text-orange-400' : 'border-blue-500/50 text-blue-400'}>
                                                    {mechanic.serviceType === 'breakdown' ? 'Breakdown' : 'Mechanic'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1 text-sm text-slate-400">
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
                                                    <span className="font-medium text-white">{mechanic.rating.toFixed(1)}</span>
                                                    <span className="text-xs text-slate-500">({mechanic.reviewCount})</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-slate-800">
                                                            <MoreVertical className="w-4 h-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                                                        <DropdownMenuLabel className="text-slate-300">Actions</DropdownMenuLabel>
                                                        <DropdownMenuSeparator className="bg-slate-700" />
                                                        <DropdownMenuItem onClick={() => window.open(`tel:${mechanic.phone}`)} className="text-slate-300 focus:bg-slate-700 focus:text-white">
                                                            <Phone className="w-4 h-4 mr-2" /> Call
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => window.open(`mailto:${mechanic.email}`)} className="text-slate-300 focus:bg-slate-700 focus:text-white">
                                                            <Mail className="w-4 h-4 mr-2" /> Email
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator className="bg-slate-700" />
                                                        {mechanic.isVerified ? (
                                                            <DropdownMenuItem
                                                                className="text-red-400 focus:bg-red-500/20 focus:text-red-400"
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
                                                                className="text-green-400 focus:bg-green-500/20 focus:text-green-400"
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
                    <div className="mt-4 text-sm text-slate-500">
                        Showing {filteredMechanics.length} of {mechanics.length} mechanics
                    </div>
                </CardContent>
            </Card>

            {/* Confirmation Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="bg-slate-900 border-slate-700 text-white">
                    <DialogHeader>
                        <DialogTitle>
                            {dialogAction === 'verify' ? 'Set as Verified' : 'Revoke Verification'}
                        </DialogTitle>
                        <DialogDescription className="text-slate-400">
                            {dialogAction === 'verify'
                                ? `Are you sure you want to manually verify ${selectedMechanic?.name}? This will mark them as verified without payment.`
                                : `Are you sure you want to revoke verification for ${selectedMechanic?.name}? They will no longer appear in search results.`
                            }
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)} className="border-slate-700 text-slate-300 hover:bg-slate-800">
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
