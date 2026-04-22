import { useState, useEffect, memo } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useScroll } from '../../hooks/useScroll';
import Logo from './Logo';

const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'About', path: '/about' },
    { label: 'Careers', path: '/careers' },
    { label: 'Blog', path: '/blog' },
];

import { Magnetic } from '../animations';

// Desktop Nav Link Item
const NavLinkItem = memo(({ link }) => {
    const location = useLocation();
    const isActive = location.pathname === link.path;

    return (
        <Magnetic strength={0.2}>
            <NavLink
                to={link.path}
                className="relative px-4 py-2 text-sm font-medium transition-all duration-200 group"
            >
                {({ isActive }) => (
                    <>
                        <span className={`transition-colors duration-200 ${isActive
                            ? 'text-white'
                            : 'text-gray-400 group-hover:text-white'
                            }`}>
                            {link.label}
                        </span>
                        {/* Active underline indicator */}
                        {isActive && (
                            <motion.div
                                layoutId="activeNavIndicator"
                                className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-gradient-to-r from-blue-400 to-blue-500"
                                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                            />
                        )}
                        {/* Hover underline */}
                        {!isActive && (
                            <span className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-white/30 scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left" />
                        )}
                    </>
                )}
            </NavLink>
        </Magnetic>
    );
});

NavLinkItem.displayName = 'NavLinkItem';

function Navbar() {
    const { isScrolled } = useScroll();
    const [mobileOpen, setMobileOpen] = useState(false);
    const location = useLocation();

    // Close mobile menu on route change
    useEffect(() => {
        setMobileOpen(false);
    }, [location]);

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        document.body.style.overflow = mobileOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [mobileOpen]);

    return (
        <>
            <motion.header
                initial={{ y: -80, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${isScrolled
                    ? 'bg-black/40 backdrop-blur-2xl border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)]'
                    : 'bg-transparent backdrop-blur-sm'
                    }`}
            >
                <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16 lg:h-[70px] gap-4">

                        {/* ── Logo ── */}
                        <Magnetic strength={0.15}>
                            <Link
                                to="/"
                                className="flex items-center gap-2.5 shrink-0 group"
                                aria-label="Bluecoderhub Home"
                            >
                                <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-lg overflow-hidden ring-1 ring-white/10 group-hover:ring-blue-400/40 transition-all duration-300">
                                    <Logo className="w-full h-full" animated={false} />
                                </div>
                                <div className="leading-none">
                                    <span className="block font-bold text-[15px] text-white tracking-tight group-hover:text-blue-100 transition-colors duration-200">
                                        Bluecoderhub
                                    </span>
                                    <span className="block text-[10px] text-white/40 font-mono tracking-widest uppercase mt-0.5">
                                        PVT LTD
                                    </span>
                                </div>
                            </Link>
                        </Magnetic>

                        {/* ── Desktop Nav Links (centre) ── */}
                        <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
                            {navLinks.map((link) => (
                                <NavLinkItem key={link.path} link={link} />
                            ))}
                        </div>

                        {/* ── Right: CTA + Hamburger ── */}
                        <div className="flex items-center gap-2 shrink-0">

                            {/* CTA Buttons – desktop */}
                            <div className="hidden md:flex items-center gap-2">
                                <Magnetic strength={0.2}>
                                    <Link
                                        to="/contact"
                                        className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors duration-200 rounded-lg hover:bg-white/5"
                                    >
                                        Contact
                                    </Link>
                                </Magnetic>
                                <Magnetic strength={0.3}>
                                    <Link
                                        to="/careers"
                                        className="px-4 py-2 text-sm font-semibold text-black bg-white rounded-lg hover:bg-blue-100 transition-all duration-200 shadow-[0_0_16px_rgba(255,255,255,0.15)] hover:shadow-[0_0_24px_rgba(255,255,255,0.25)]"
                                    >
                                        Join Us →
                                    </Link>
                                </Magnetic>
                            </div>

                            {/* Hamburger – mobile only */}
                            <button
                                id="mobile-menu-toggle"
                                onClick={() => setMobileOpen(!mobileOpen)}
                                className="md:hidden flex flex-col items-center justify-center w-9 h-9 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200"
                                aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                                aria-expanded={mobileOpen}
                            >
                                <motion.span
                                    animate={mobileOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
                                    className="block w-5 h-0.5 bg-current rounded-full mb-1.5"
                                />
                                <motion.span
                                    animate={mobileOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
                                    className="block w-5 h-0.5 bg-current rounded-full mb-1.5"
                                />
                                <motion.span
                                    animate={mobileOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
                                    className="block w-5 h-0.5 bg-current rounded-full"
                                />
                            </button>
                        </div>
                    </div>
                </nav>
            </motion.header>

            {/* ── Mobile Menu Overlay ── */}
            <AnimatePresence>
                {mobileOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            key="backdrop"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="fixed inset-0 z-[98] bg-black/60 backdrop-blur-sm md:hidden"
                            onClick={() => setMobileOpen(false)}
                        />

                        {/* Menu panel */}
                        <motion.div
                            key="mobile-menu"
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            className="fixed top-0 right-0 bottom-0 z-[99] w-72 md:hidden flex flex-col"
                            style={{
                                background: 'rgba(5, 5, 5, 0.95)',
                                backdropFilter: 'blur(24px)',
                                borderLeft: '1px solid rgba(255,255,255,0.08)',
                            }}
                        >
                            {/* Panel header */}
                            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-white/5">
                                <span className="text-sm font-semibold text-white/60 uppercase tracking-widest">
                                    Menu
                                </span>
                                <button
                                    onClick={() => setMobileOpen(false)}
                                    className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                                    aria-label="Close menu"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Nav links */}
                            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
                                {navLinks.map((link, i) => (
                                    <motion.div
                                        key={link.path}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.06 + 0.1 }}
                                    >
                                        <Link
                                            to={link.path}
                                            onClick={() => setMobileOpen(false)}
                                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${location.pathname === link.path
                                                ? 'text-white bg-white/10 border border-white/10'
                                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                                }`}
                                        >
                                            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                                            {link.label}
                                        </Link>
                                    </motion.div>
                                ))}
                            </div>

                            {/* CTA buttons at bottom */}
                            <div className="px-4 pb-8 pt-4 border-t border-white/5 space-y-3">
                                <Link
                                    to="/contact"
                                    onClick={() => setMobileOpen(false)}
                                    className="block w-full text-center px-4 py-2.5 text-sm font-medium text-gray-300 border border-white/10 rounded-xl hover:bg-white/5 hover:text-white transition-all duration-200"
                                >
                                    Contact Us
                                </Link>
                                <Link
                                    to="/careers"
                                    onClick={() => setMobileOpen(false)}
                                    className="block w-full text-center px-4 py-2.5 text-sm font-semibold text-black bg-white rounded-xl hover:bg-blue-100 transition-all duration-200 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                                >
                                    Join Us →
                                </Link>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}

export default memo(Navbar);
