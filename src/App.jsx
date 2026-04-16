import { BrowserRouter, Routes, Route, useLocation, Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';
import ErrorBoundary from './components/layout/ErrorBoundary';
import { initSelfHealing } from './utils/selfHealing';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import Home from './pages/Home';
import Products from './pages/Products';
import About from './pages/About';
import Careers from './pages/Careers';
import Ace from './pages/Ace';
import Blog, { BlogPost } from './pages/Blog';
import Admin from './pages/Admin';
import { ROUTES } from './config/routes';
import { PAGE_TRANSITION } from './config/constants';

function PageWrapper({ children }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={PAGE_TRANSITION}
        >
            {children}
        </motion.div>
    );
}

function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center text-center px-4">
            <div>
                <div className="text-8xl font-display font-bold gradient-text mb-4">404</div>
                <h1 className="text-2xl font-display font-bold text-white mb-3">Page Not Found</h1>
                <p className="text-gray-400 mb-6">
                    The page you're looking for doesn't exist or has been moved.
                </p>
                <Link
                    to={ROUTES.HOME}
                    className="px-6 py-3 rounded-xl text-sm font-bold text-black bg-white hover:bg-gray-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                >
                    Back to Home →
                </Link>
            </div>
        </div>
    );
}

function AppRoutes() {
    const location = useLocation();
    const isAdmin = location.pathname.startsWith('/admin');

    return (
        <div className="relative min-h-screen">
            <div className="bg-glow-top" />
            <div className="bg-glow-bottom" />
            <div className="noise-overlay" />
            {!isAdmin && <Navbar />}
            <AnimatePresence mode="wait">
                <Routes location={location} key={location.pathname}>
                    <Route path={ROUTES.HOME} element={<PageWrapper><Home /></PageWrapper>} />
                    <Route path={ROUTES.PRODUCTS} element={<PageWrapper><Products /></PageWrapper>} />
                    <Route path={ROUTES.ABOUT} element={<PageWrapper><About /></PageWrapper>} />
                    <Route path={ROUTES.CAREERS} element={<PageWrapper><Careers /></PageWrapper>} />
                    <Route path={ROUTES.ACE} element={<PageWrapper><Ace /></PageWrapper>} />
                    <Route path={ROUTES.BLOG} element={<PageWrapper><Blog /></PageWrapper>} />
                    <Route path="/blog/:postId" element={<PageWrapper><BlogPost /></PageWrapper>} />
                    <Route path={ROUTES.ADMIN} element={<Admin />} />
                    <Route path="*" element={<PageWrapper><NotFound /></PageWrapper>} />
                </Routes>
            </AnimatePresence>
            {!isAdmin && <Footer />}
        </div>
    );
}

export default function App() {
    // Boot the self-healing engine once on app startup.
    // Admin must be authenticated to pause/stop it from Admin panel.
    useEffect(() => {
        initSelfHealing();
    }, []);

    return (
        <ErrorBoundary>
            <BrowserRouter>
                <AppRoutes />
            </BrowserRouter>
        </ErrorBoundary>
    );
}
