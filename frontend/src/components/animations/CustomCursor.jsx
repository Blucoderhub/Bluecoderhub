import { useEffect, useState } from 'react';
import { motion, useSpring, useMotionValue, AnimatePresence } from 'framer-motion';

export default function CustomCursor() {
    const [isHovering, setIsHovering] = useState(false);
    const [isClicking, setIsClicking] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    
    // Smooth trailing position
    const cursorX = useMotionValue(-100);
    const cursorY = useMotionValue(-100);
    
    const springConfig = { damping: 20, stiffness: 200, mass: 0.5 };
    const cursorXSpring = useSpring(cursorX, springConfig);
    const cursorYSpring = useSpring(cursorY, springConfig);

    useEffect(() => {
        const moveCursor = (e) => {
            cursorX.set(e.clientX);
            cursorY.set(e.clientY);
            if (!isVisible) setIsVisible(true);
        };

        const handleMouseDown = () => setIsClicking(true);
        const handleMouseUp = () => setIsClicking(false);

        const handleMouseOver = (e) => {
            const target = e.target;
            const isClickable = 
                target.tagName.toLowerCase() === 'button' ||
                target.tagName.toLowerCase() === 'a' ||
                target.closest('button') ||
                target.closest('a') ||
                target.classList.contains('clickable') ||
                window.getComputedStyle(target).cursor === 'pointer';
            
            setIsHovering(isClickable);
        };

        window.addEventListener('mousemove', moveCursor);
        window.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mouseup', handleMouseUp);
        window.addEventListener('mouseover', handleMouseOver);
        
        return () => {
            window.removeEventListener('mousemove', moveCursor);
            window.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('mouseover', handleMouseOver);
        };
    }, [isVisible]);

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-[9999] hidden lg:block">
            {/* The Outer Ring / Trailer */}
            <motion.div
                style={{
                    translateX: cursorXSpring,
                    translateY: cursorYSpring,
                    left: -20,
                    top: -20,
                }}
                animate={{
                    scale: isClicking ? 0.8 : (isHovering ? 1.5 : 1),
                    opacity: isHovering ? 0.8 : 0.4,
                    borderColor: isHovering ? '#3b82f6' : 'rgba(255, 255, 255, 0.4)',
                    borderWidth: isHovering ? 2 : 1,
                }}
                className="w-10 h-10 border rounded-full flex items-center justify-center"
            >
                {/* Subtle Pulse Inner Circle (only when hovering) */}
                <AnimatePresence>
                    {isHovering && (
                        <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            className="w-2 h-2 bg-blue-400 rounded-full"
                        />
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Click Ripple Effect */}
            <AnimatePresence>
                {isClicking && (
                    <motion.div
                        initial={{ opacity: 0.5, scale: 0.5 }}
                        animate={{ opacity: 0, scale: 2 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'absolute',
                            left: cursorX,
                            top: cursorY,
                            transform: 'translate(-50%, -50%)'
                        }}
                        className="w-12 h-12 border border-blue-400 rounded-full"
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
