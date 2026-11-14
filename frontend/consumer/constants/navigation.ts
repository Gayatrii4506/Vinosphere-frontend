export interface NavDropdownItem {
    label: string
    href: string
    description: string
}

export interface NavItem {
    label: string
    href?: string
    items?: NavDropdownItem[]
}

export const NAVIGATION_ITEMS: NavItem[] = [
    {
        label: 'Home',
        href: '/',
    },
    {
        label: 'Discover',
        items: [
            {
                label: 'Wine Catalog',
                href: '/discover/wines',
                description: 'Explore wines & find your match',
            },
            {
                label: 'Wineries',
                href: '/wineries',
                description: 'Explore estates & vineyards',
            },
        ],
    },
    {
        label: 'Food Pairing',
        href: '/food-pairing',
    },
    {
        label: 'Estate Journeys',
        href: '/events',
    },
    {
        label: 'About Us',
        href: '/about',
    },
]

