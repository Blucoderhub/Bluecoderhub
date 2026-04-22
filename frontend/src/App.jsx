import { BrowserRouter, Routes, Route, useLocation, Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { lazy, Suspense } from 'react';
import ErrorBoundary from './components/layout/ErrorBoundary';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import Home from './pages/Home';
import { ROUTES } from './config/routes';
import { PAGE_TRANSITION } from './config/constants';

const About = lazy(() => import('./pages/About'));
const Careers = lazy(() => import('./pages/Careers'));
const Blog = lazy(() => import('./pages/Blog'));
const BlogPost = lazy(() => import('./pages/Blog').then(m => ({ default: m.BlogPost })));

function LoadingFallback() {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
    );
}

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

import { PremiumBackground, CustomCursor } from './components/animations';

function AppRoutes() {
    const location = useLocation();

    return (
        <div className="relative min-h-screen">
            <PremiumBackground />
            <CustomCursor />
            <div className="noise-overlay" />
            <Navbar />
            <AnimatePresence mode="wait">
                <Suspense fallback={<LoadingFallback />}>
                    <Routes location={location} key={location.pathname}>
                        <Route path={ROUTES.HOME} element={<PageWrapper><Home /></PageWrapper>} />
                        <Route path={ROUTES.ABOUT} element={<PageWrapper><About /></PageWrapper>} />
                        <Route path={ROUTES.CAREERS} element={<PageWrapper><Careers /></PageWrapper>} />
                        <Route path={ROUTES.BLOG} element={<PageWrapper><Blog /></PageWrapper>} />
                        <Route path={ROUTES.BLOG_POST} element={<PageWrapper><BlogPost /></PageWrapper>} />
                        <Route path="*" element={<PageWrapper><NotFound /></PageWrapper>} />
                    </Routes>
                </Suspense>
            </AnimatePresence>
            <Footer />
        </div>
    );
}

export default function App() {
    return (
        <ErrorBoundary>
            <BrowserRouter>
                <AppRoutes />
            </BrowserRouter>
        </ErrorBoundary>
    );
}
