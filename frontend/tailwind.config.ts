import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                // VIP Dark Theme - Executive Grade
                'black-primary': '#0a0a0a',
                'black-secondary': '#1a1a1a',
                'black-tertiary': '#2a2a2a',
                'black-border': '#3a3a3a',

                // Accent Colors - Surgical Precision
                'electric-blue': '#0ea5e9',
                'electric-blue-dark': '#0284c7',
                'emerald': '#10b981',
                'emerald-dark': '#059669',
                'amber': '#f59e0b',
                'amber-dark': '#d97706',
                'crimson': '#dc2626',
                'crimson-dark': '#b91c1c',

                // Glass effect bases
                'glass-white': 'rgba(255, 255, 255, 0.05)',
                'glass-border': 'rgba(255, 255, 255, 0.1)',
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-mesh': 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%)',
                'glass-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
            },
            backdropBlur: {
                'glass': '12px',
            },
            boxShadow: {
                'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
                'glow-blue': '0 0 20px rgba(14, 165, 233, 0.3)',
                'glow-emerald': '0 0 20px rgba(16, 185, 129, 0.3)',
                'neon': '0 0 5px theme("colors.electric-blue"), 0 0 20px theme("colors.electric-blue")',
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-in-out',
                'slide-up': 'slideUp 0.5s ease-out',
                'slide-in': 'slideIn 0.3s ease-out',
                'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
                'shimmer': 'shimmer 2s linear infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                slideIn: {
                    '0%': { transform: 'translateX(-20px)', opacity: '0' },
                    '100%': { transform: 'translateX(0)', opacity: '1' },
                },
                pulseGlow: {
                    '0%, 100%': { boxShadow: '0 0 20px rgba(14, 165, 233, 0.3)' },
                    '50%': { boxShadow: '0 0 30px rgba(14, 165, 233, 0.5)' },
                },
                shimmer: {
                    '0%': { backgroundPosition: '-1000px 0' },
                    '100%': { backgroundPosition: '1000px 0' },
                },
            },
        },
    },
    plugins: [],
};

export default config;
