import type { Config } from 'tailwindcss'

const config: Config = {
    content: [
        './app/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                'vino': {
                    // Dark section backgrounds (hero, footer, dark cards)
                    'dark': '#0B0B0B',
                    'darker': '#121212',
                    'darkest': '#1B1B1B',
                    // Accents
                    'accent': '#8B1E3F',
                    'accent-light': '#A8304F',
                    'gold': '#C89B3C',
                    'gold-light': '#E8D4A8',
                    // Light section backgrounds (categories, features)
                    'cream': '#FAF7F2',
                    'cream-dark': '#F2EDE4',
                    'parchment': '#EDE4D6',
                    // Text
                    'gray': '#E8E8E8',
                    'gray-dark': '#A0A0A0',
                    'brown': '#5C4033',
                    'brown-light': '#8B6E5A',
                },
            },
            fontFamily: {
                'serif': ['Playfair Display', 'Georgia', 'serif'],
                'sans': ['Inter', 'system-ui', 'sans-serif'],
            },
            fontSize: {
                'xs': ['12px', { lineHeight: '16px' }],
                'sm': ['14px', { lineHeight: '20px' }],
                'base': ['16px', { lineHeight: '24px' }],
                'lg': ['18px', { lineHeight: '28px' }],
                'xl': ['20px', { lineHeight: '28px' }],
                '2xl': ['24px', { lineHeight: '32px' }],
                '3xl': ['32px', { lineHeight: '40px' }],
                '4xl': ['40px', { lineHeight: '48px' }],
                '5xl': ['56px', { lineHeight: '64px' }],
                '6xl': ['72px', { lineHeight: '80px' }],
            },
            spacing: {
                'gutter': '2rem',
                'gutter-lg': '3rem',
                'gutter-xl': '4rem',
                'gutter-2xl': '6rem',
            },
            animation: {
                'fade-in': 'fadeIn 0.6s ease-out',
                'slide-up': 'slideUp 0.6s ease-out',
                'fade-in-up': 'fadeInUp 0.8s ease-out',
            },
            keyframes: {
                fadeIn: {
                    'from': { opacity: '0' },
                    'to': { opacity: '1' },
                },
                slideUp: {
                    'from': { transform: 'translateY(30px)', opacity: '0' },
                    'to': { transform: 'translateY(0)', opacity: '1' },
                },
                fadeInUp: {
                    'from': { transform: 'translateY(40px)', opacity: '0' },
                    'to': { transform: 'translateY(0)', opacity: '1' },
                },
            },
        },
    },
    plugins: [],
}

export default config
