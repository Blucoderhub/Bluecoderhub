import { motion } from 'framer-motion';

const variants = {
    primary: 'bg-white text-black hover:bg-gray-100 hover:shadow-[0_15px_40px_rgba(255,255,255,0.25)]',
    secondary: 'bg-black border border-white text-white hover:bg-gray-900',
    outline: 'bg-transparent border border-white text-white hover:bg-white/10',
    ghost: 'bg-transparent text-gray-400 hover:text-white hover:bg-white/5',
    danger: 'bg-transparent border border-gray-600 text-gray-400 hover:border-white hover:text-white',
};

const sizes = {
    sm: 'px-3 py-1.5 text-xs rounded-lg',
    md: 'px-5 py-2.5 text-sm rounded-xl',
    lg: 'px-7 py-3.5 text-base rounded-xl',
    xl: 'px-9 py-4 text-lg rounded-2xl',
};

export default function Button({
    children,
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    onClick,
    type = 'button',
    className = '',
    href,
    target,
}) {
    const classes = `
    btn-shine inline-flex items-center justify-center gap-2 font-semibold font-body
    transition-all duration-300 cursor-pointer select-none
    disabled:opacity-40 disabled:cursor-not-allowed
    ${variants[variant]} ${sizes[size]} ${className}
  `;

    const content = loading ? (
        <>
            <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
            />
            {children}
        </>
    ) : children;

    if (href) {
        return (
            <motion.a
                href={href}
                target={target}
                rel={target === '_blank' ? 'noopener noreferrer' : undefined}
                whileHover={{ scale: disabled ? 1 : 1.03 }}
                whileTap={{ scale: disabled ? 1 : 0.97 }}
                className={classes}
            >
                {content}
            </motion.a>
        );
    }

    return (
        <motion.button
            type={type}
            onClick={onClick}
            disabled={disabled || loading}
            whileHover={{ scale: disabled ? 1 : 1.03 }}
            whileTap={{ scale: disabled ? 1 : 0.97 }}
            className={classes}
        >
            {content}
        </motion.button>
    );
}
