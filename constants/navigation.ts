export const NAVIGATION_ITEMS = [
    {
        label: 'Discover',
        href: '/discover',
        submenu: [
            { label: 'Wines', href: '/discover/wines' },
            { label: 'Collections', href: '/discover/collections' },
            { label: 'Regions', href: '/discover/regions' },
        ],
    },
    {
        label: 'Learning',
        href: '/learning',
        submenu: [
            { label: 'Wine Guide', href: '/learning/guide' },
            { label: 'Blog', href: '/blog' },
            { label: 'Masterclasses', href: '/learning/masterclasses' },
        ],
    },
    {
        label: 'Experiences',
        href: '/experiences',
        submenu: [
            { label: 'Tastings', href: '/experiences/tastings' },
            { label: 'Events', href: '/experiences/events' },
            { label: 'Tours', href: '/experiences/tours' },
        ],
    },
    {
        label: 'Corporate',
        href: '/corporate',
    },
] as const
