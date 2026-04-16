/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'brand-blue': '#3b82f6',
                'brand-teal': '#ffffff',
                'brand-cyan': '#ffffff',
                'brand-dark-teal': '#000000',
                'brand-black': '#050505',
                'brand-gray-900': '#0a0a0a',
                'brand-gray-800': '#111827',
                'brand-gray-700': '#1f2937',
                'brand-gray-600': '#374151',
                'brand-success': '#10b981',
                'brand-warning': '#f59e0b',
                'brand-error': '#ef4444',
            },
            fontFamily: {
                display: ['Outfit', 'system-ui', 'sans-serif'],
                body: ['Inter', 'system-ui', 'sans-serif'],
                mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
            },
            animation: {
                'float': 'float 3s ease-in-out infinite',
                'glow-pulse': 'glowPulse 3s ease-in-out infinite',
                'blob': 'blob 7s infinite',
                'gradient-shift': 'gradientShift 8s ease infinite',
                'fadeInUp': 'fadeInUp 0.6s ease forwards',
                'spin-slow': 'spin 12s linear infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(-10px)' },
                    '50%': { transform: 'translateY(0)' },
                },
                glowPulse: {
                    '0%, 100%': { opacity: '0.4', filter: 'blur(40px)' },
                    '50%': { opacity: '0.7', filter: 'blur(60px)' },
                },
                blob: {
                    '0%': { borderRadius: '60% 40% 30% 70%/60% 30% 70% 40%' },
                    '50%': { borderRadius: '30% 60% 70% 40%/50% 60% 30% 60%' },
                    '100%': { borderRadius: '60% 40% 30% 70%/60% 30% 70% 40%' },
                },
                gradientShift: {
                    '0%, 100%': { backgroundPosition: '0% 50%' },
                    '50%': { backgroundPosition: '100% 50%' },
                },
                fadeInUp: {
                    from: { opacity: '0', transform: 'translateY(30px)' },
                    to: { opacity: '1', transform: 'translateY(0)' },
                },
            },
            backgroundImage: {
                'hero-gradient': 'radial-gradient(circle at 50% 0%, #0c1421 0%, #050505 100%)',
                'card-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 100%)',
                'blue-gradient': 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                'dark-gradient': 'linear-gradient(180deg, #050505 0%, #0a0a0a 100%)',
            },
        },
    },
    plugins: [],
}
