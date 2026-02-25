import { useState, useCallback } from 'react';

export function useAI() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [result, setResult] = useState(null);

    const call = useCallback(async (fn, ...args) => {
        setLoading(true);
        setError(null);
        try {
            const res = await fn(...args);
            setResult(res);
            return res;
        } catch (err) {
            setError(err.message || 'AI call failed');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const reset = useCallback(() => {
        setResult(null);
        setError(null);
        setLoading(false);
    }, []);

    return { loading, error, result, call, reset };
}
