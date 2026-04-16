import { useState, useRef, useEffect } from 'react';

export function useIntersection(options = {}) {
    const [isIntersecting, setIsIntersecting] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsIntersecting(true);
                    if (options.once) observer.disconnect();
                } else if (!options.once) {
                    setIsIntersecting(false);
                }
            },
            {
                threshold: options.threshold || 0.1,
                rootMargin: options.rootMargin || '0px',
            }
        );

        const el = ref.current;
        if (el) observer.observe(el);
        return () => { if (el) observer.unobserve(el); };
    }, [options.once, options.threshold, options.rootMargin]);

    return [ref, isIntersecting];
}
