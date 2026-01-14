// Get redirect path based on user role
export function getRedirectPath(role: string): string {
    switch (role) {
        case 'admin':
            return '/admin'
        case 'mechanic':
        case 'breakdown':
            return '/dashboard'
        case 'shop':
            return '/dashboard/shop'
        case 'client':
        default:
            return '/'
    }
}
