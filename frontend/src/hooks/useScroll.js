import { useState, useEffect } from 'react';

export function useScroll() {
    const [scrollY, setScrollY] = useState(0);
    const [scrollDirection, setScrollDirection] = useState('up');
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        let lastY = window.scrollY;

        const handleScroll = () => {
            const currentY = window.scrollY;
            setScrollY(currentY);
            setScrollDirection(currentY > lastY ? 'down' : 'up');
            setIsScrolled(currentY > 50);
            lastY = currentY;
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return { scrollY, scrollDirection, isScrolled };
}
