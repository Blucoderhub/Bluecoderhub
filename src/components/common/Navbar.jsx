import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useScroll } from '../../hooks/useScroll';

const navLinks = [
    { label: 'Home', path: '/' },
    {
        label: 'Products', path: '/products', dropdown: [
            { label: '🎓 Bluelearnerhub', path: '/products', anchor: 'bluelearnerhub', external: 'https://bluelearnerhub.com' },
            { label: '💰 FinanceHub', path: '/products', anchor: 'financeapp' },
        ]
    },
    { label: 'About', path: '/about' },
    { label: 'Careers', path: '/careers' },
    { label: 'ACE', path: '/ace' },
    { label: 'Blog', path: '/blog' },
    { label: 'Contact', path: '/contact' },
];

import Logo from './Logo';

export default function Navbar() {
    const { isScrolled } = useScroll();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const location = useLocation();

    useEffect(() => {
        setMobileOpen(false);
        setActiveDropdown(null);
    }, [location]);

    return (
        <motion.header
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${isScrolled
                ? 'bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-black/5 dark:border-white/5 shadow-sm'
                : 'bg-transparent'
                }`}
        >
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 lg:h-20">

                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-3 group">
                        <Logo className="w-10 h-10 lg:w-12 lg:h-12" />
                        <div>
                            <span className="font-display font-bold text-lg text-white leading-none">
                                Bluecoderhub
                            </span>
                            <div className="text-xs text-white/50 font-mono">PVT LTD</div>
                        </div>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden lg:flex items-center gap-1">
                        {navLinks.map((link) => (
                            <div
                                key={link.path + link.label}
                                className="relative"
                                onMouseEnter={() => link.dropdown && setActiveDropdown(link.label)}
                                onMouseLeave={() => setActiveDropdown(null)}
                            >
                                <NavLink
                                    to={link.path}
                                    className={({ isActive }) =>
                                        `px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1 ${isActive
                                            ? 'text-white bg-white/10'
                                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                                        }`
                                    }
                                >
                                    {link.label}
                                    {link.dropdown && <span className="text-xs opacity-60">▾</span>}
                                </NavLink>

                                {link.dropdown && (
                                    <AnimatePresence>
                                        {activeDropdown === link.label && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                className="absolute top-full left-0 mt-2 w-56 glassmorphism rounded-2xl p-2 border border-white/20 shadow-[0_20px_40px_rgba(255,255,255,0.05)] overflow-hidden"
                                            >
                                                {link.dropdown.map((item) => (
                                                    item.external ? (
                                                        <a
                                                            key={item.label}
                                                            href={item.external}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-2 px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-all"
                                                        >
                                                            {item.label}
                                                            <span className="ml-auto text-xs opacity-50">↗</span>
                                                        </a>
                                                    ) : (
                                                        <Link
                                                            key={item.label}
                                                            to={item.path}
                                                            className="flex items-center gap-2 px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-all"
                                                        >
                                                            {item.label}
                                                        </Link>
                                                    )
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* CTA + Mobile Toggle */}
                    <div className="flex items-center gap-3">
                        <Link
                            to="/contact"
                            className="hidden sm:flex btn-shine items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-black bg-white hover:bg-gray-100 hover:shadow-[0_15px_30px_rgba(255,255,255,0.2)] transition-all duration-300"
                        >
                            Get Started
                        </Link>
                        <button
                            onClick={() => setMobileOpen(!mobileOpen)}
                            className="lg:hidden p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-all"
                            aria-label="Toggle menu"
                        >
                            <div className="w-5 space-y-1.5">
                                <motion.span
                                    animate={mobileOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
                                    className="block h-0.5 bg-current rounded-full"
                                />
                                <motion.span
                                    animate={mobileOpen ? { opacity: 0 } : { opacity: 1 }}
                                    className="block h-0.5 bg-current rounded-full"
                                />
                                <motion.span
                                    animate={mobileOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
                                    className="block h-0.5 bg-current rounded-full"
                                />
                            </div>
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="lg:hidden glassmorphism border-t border-white/5"
                    >
                        <div className="px-4 py-4 space-y-1 max-h-[80vh] overflow-y-auto">
                            {navLinks.map((link) => (
                                <div key={link.path + link.label}>
                                    <Link
                                        to={link.path}
                                        className={`relative px-4 py-2 text-sm font-medium transition-all hover:text-white ${location.pathname === link.path ? 'text-white' : 'text-gray-400'}`}
                                    >
                                        {link.label}
                                        {location.pathname === link.path && (
                                            <motion.div layoutId="activeNav" className="absolute -bottom-1 left-4 right-4 h-0.5 bg-white rounded-full shadow-[0_0_10px_#ffffff]" />
                                        )}
                                    </Link>
                                    {link.dropdown && (
                                        <div className="ml-4 space-y-1">
                                            {link.dropdown.map((item) => (
                                                item.external ? (
                                                    <a
                                                        key={item.label}
                                                        href={item.external}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="block px-4 py-2 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                                                    >
                                                        {item.label} ↗
                                                    </a>
                                                ) : (
                                                    <Link
                                                        key={item.label}
                                                        to={item.path}
                                                        className="block px-4 py-2 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                                                    >
                                                        {item.label}
                                                    </Link>
                                                )
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                            <div className="pt-3 border-t border-white/10">
                                <Link
                                    to="/contact"
                                    className="flex items-center justify-center px-4 py-3 rounded-xl text-sm font-semibold text-black bg-white"
                                >
                                    Get Started →
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.header>
    );
}
