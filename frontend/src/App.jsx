import { BrowserRouter, Routes, Route, useLocation, Link, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, lazy, Suspense } from 'react';
import ErrorBoundary from './components/layout/ErrorBoundary';
import { initSelfHealing } from './utils/selfHealing';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import { isAdminAuthenticated } from './security/auth';
import Home from './pages/Home';
import { ROUTES } from './config/routes';
import { PAGE_TRANSITION } from './config/constants';

const Products = lazy(() => import('./pages/Products'));
const About = lazy(() => import('./pages/About'));
const Careers = lazy(() => import('./pages/Careers'));
const Ace = lazy(() => import('./pages/Ace'));
const Blog = lazy(() => import('./pages/Blog').then(m => ({ default: m.Blog })));
const BlogPost = lazy(() => import('./pages/Blog').then(m => ({ default: m.BlogPost })));
const Admin = lazy(() => import('./pages/Admin'));

function LoadingFallback() {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
    );
}

function ProtectedAdminRoute({ children }) {
    const isAuth = isAdminAuthenticated();
    if (!isAuth) {
        return <Navigate to={ROUTES.ADMIN} replace />;
    }
    return children;
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

function AppRoutes() {
    const location = useLocation();
    const isAdminRoute = location.pathname.startsWith('/admin');

    return (
        <div className="relative min-h-screen">
            <div className="bg-glow-top" />
            <div className="bg-glow-bottom" />
            <div className="noise-overlay" />
            {!isAdminRoute && <Navbar />}
            <AnimatePresence mode="wait">
                <Suspense fallback={<LoadingFallback />}>
                    <Routes location={location} key={location.pathname}>
                        <Route path={ROUTES.HOME} element={<PageWrapper><Home /></PageWrapper>} />
                        <Route path={ROUTES.PRODUCTS} element={<PageWrapper><Products /></PageWrapper>} />
                        <Route path={ROUTES.ABOUT} element={<PageWrapper><About /></PageWrapper>} />
                        <Route path={ROUTES.CAREERS} element={<PageWrapper><Careers /></PageWrapper>} />
                        <Route path={ROUTES.ACE} element={<PageWrapper><Ace /></PageWrapper>} />
                        <Route path={ROUTES.BLOG} element={<PageWrapper><Blog /></PageWrapper>} />
                        <Route path={ROUTES.BLOG_POST} element={<PageWrapper><BlogPost /></PageWrapper>} />
                        <Route path={ROUTES.ADMIN} element={<Admin />} />
                        <Route path="*" element={<PageWrapper><NotFound /></PageWrapper>} />
                    </Routes>
                </Suspense>
            </AnimatePresence>
            {!isAdminRoute && <Footer />}
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
