import { motion } from 'framer-motion';

export default function LiquidBlob({ color = '#ffffff', size = 400, delay = 0, className = '' }) {
    return (
        <motion.div
            className={`absolute rounded-full blur-[80px] opacity-20 ${className}`}
            style={{
                width: size,
                height: size,
                background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
            }}
            animate={{
                borderRadius: [
                    '60% 40% 30% 70% / 60% 30% 70% 40%',
                    '30% 60% 70% 40% / 50% 60% 30% 60%',
                    '60% 40% 30% 70% / 60% 30% 70% 40%',
                ],
                scale: [1, 1.08, 1],
                rotate: [0, 180, 360],
            }}
            transition={{
                duration: 8,
                repeat: Infinity,
                ease: 'easeInOut',
                delay,
            }}
        />
    );
}
