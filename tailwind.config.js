/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'brand-teal': '#ffffff',
                'brand-cyan': '#ffffff',
                'brand-dark-teal': '#000000',
                'brand-black': '#000000',
                'brand-gray-900': '#000000',
                'brand-gray-800': '#0a0a0a',
                'brand-gray-700': '#1a1a1a',
                'brand-gray-600': '#333333',
                'brand-success': '#ffffff',
                'brand-warning': '#666666',
                'brand-error': '#444444',
            },
            fontFamily: {
                display: ['Space Grotesk', 'system-ui', 'sans-serif'],
                body: ['Inter', 'system-ui', 'sans-serif'],
                mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
            },
            animation: {
                'float': 'float 3s ease-in-out infinite',
                'glow-pulse': 'glowPulse 2s ease-in-out infinite',
                'blob': 'blob 7s infinite',
                'gradient-shift': 'gradientShift 8s ease infinite',
                'fadeInUp': 'fadeInUp 0.6s ease forwards',
                'spin-slow': 'spin 8s linear infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(-10px)' },
                    '50%': { transform: 'translateY(0)' },
                },
                glowPulse: {
                    '0%, 100%': { filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.3))' },
                    '50%': { filter: 'drop-shadow(0 0 16px rgba(255, 255, 255, 0.5))' },
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
                'hero-gradient': 'linear-gradient(135deg, #000000 0%, #0a0a0a 50%, #000000 100%)',
                'card-gradient': 'linear-gradient(135deg, #000000 0%, #0a0a0a 100%)',
                'teal-gradient': 'linear-gradient(135deg, #ffffff 0%, #333333 100%)',
            },
        },
    },
    plugins: [],
}
