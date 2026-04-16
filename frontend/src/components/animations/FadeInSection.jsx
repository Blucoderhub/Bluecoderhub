import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

export default function FadeInSection({ children, delay = 0, direction = 'up', className = '' }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '0px 0px -80px 0px' });

    const directions = {
        up: { y: 40, x: 0 },
        down: { y: -40, x: 0 },
        left: { x: 40, y: 0 },
        right: { x: -40, y: 0 },
        none: { x: 0, y: 0 },
    };

    const initial = { opacity: 0, ...directions[direction] };

    return (
        <motion.div
            ref={ref}
            initial={initial}
            animate={isInView ? { opacity: 1, x: 0, y: 0 } : initial}
            transition={{ duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
            className={className}
        >
            {children}
        </motion.div>
    );
}
