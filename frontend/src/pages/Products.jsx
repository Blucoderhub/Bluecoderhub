import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import FadeInSection from '../components/animations/FadeInSection';
import LiquidBlob from '../components/animations/LiquidBlob';
import products from '../data/products.json';
import { MdSchool, MdAccountBalance } from 'react-icons/md';
import { FiCodepen, FiCpu, FiActivity, FiSettings, FiLayers, FiDatabase, FiZap, FiGlobe } from 'react-icons/fi';

const getProductIcon = (id) => {
    switch (id) {
        case 'bluelearnerhub': return <MdSchool />;
        case 'financeapp': return <MdAccountBalance />;
        default: return <MdAccountBalance />;
    }
};

export default function Products() {
    const [notifyEmail, setNotifyEmail] = useState('');
    const [notified, setNotified] = useState(false);

    const handleNotify = (e) => {
        e.preventDefault();
        setNotified(true);
    };

    return (
        <div className="min-h-screen pt-24 pb-20">
            {/* Hero */}
            <section className="relative py-20 px-4 text-center overflow-hidden">
                <div className="absolute inset-0 bg-hero-gradient" />
                <LiquidBlob color="#ffffff" size={500} className="top-0 left-0 opacity-5" />
                <LiquidBlob color="#ffffff" size={400} delay={3} className="bottom-0 right-0 opacity-5" />
                <div className="relative z-10 max-w-3xl mx-auto">
                    <div className="inline-block px-4 py-1.5 rounded-full border border-white/20 bg-white/5 text-white/70 text-sm font-medium mb-6">
                        Our Products
                    </div>
                    <h1 className="text-5xl lg:text-6xl font-display font-bold text-white mb-6">
                        Products That <span className="gradient-text">Transform</span>
                    </h1>
                    <p className="text-gray-400 text-lg leading-relaxed">
                        We build products that solve real problems at scale—from AI-powered learning platforms
                        to intelligent financial management tools.
                    </p>
                </div>
            </section>

            {/* Product Sections */}
            <div className="max-w-7xl mx-auto px-4 space-y-20 py-16">

                {/* Bluelearnerhub */}
                <FadeInSection id="bluelearnerhub">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <div className="inline-flex items-center gap-3 mb-6">
                                <div className="text-5xl text-brand-blue">{getProductIcon('bluelearnerhub')}</div>
                                <div>
                                    <div className="inline-block px-3 py-1 rounded-full bg-white text-black text-xs font-bold mb-1">
                                        LIVE
                                    </div>
                                    <a href="https://bluelearnerhub.com" target="_blank" rel="noopener noreferrer">
                                        <h2 className="text-3xl font-display font-bold text-white hover:text-white/80 transition-colors inline-block">Bluelearnerhub</h2>
                                    </a>
                                    <div className="text-white opacity-40 text-xs font-mono mt-1">FLAGSHIP SUBSIDIARY</div>
                                </div>
                            </div>
                            <p className="text-white opacity-60 font-medium mb-4">AI-Powered Learning Platform</p>
                            <p className="text-gray-400 leading-relaxed mb-6">
                                An intelligent learning platform that personalizes education through adaptive AI algorithms,
                                gamified experiences, and real-time progress tracking. Empowering learners worldwide with
                                interactive coding challenges, peer collaboration, and certified learning paths.
                            </p>

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-4 mb-8">
                                {Object.entries(products[0].stats).map(([key, val]) => (
                                    <div key={key} className="glassmorphism rounded-xl p-4 border border-white/10 text-center">
                                        <div className="text-2xl font-display font-bold text-white">{val}</div>
                                        <div className="text-xs text-gray-500 capitalize mt-1">{key === 'completion' ? 'Completion Rate' : key === 'users' ? 'Active Users' : 'Courses'}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Features */}
                            <div className="grid grid-cols-2 gap-2 mb-8">
                                {products[0].features.map(f => (
                                    <div key={f} className="flex items-center gap-2 text-sm text-gray-300">
                                        <span className="text-white opacity-50 text-xs">✦</span> {f}
                                    </div>
                                ))}
                            </div>

                            <a
                                href="https://bluelearnerhub.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-black bg-white hover:bg-gray-100 transition-all shadow-[0_10px_30px_rgba(255,255,255,0.1)]"
                            >
                                Visit Bluelearnerhub ↗
                            </a>
                        </div>

                        <div className="relative">
                            <div className="glassmorphism rounded-3xl border border-white/10 p-8 relative overflow-hidden"
                                style={{ boxShadow: '0 0 60px rgba(255,255,255,0.05)' }}>
                                <div className="absolute top-0 left-0 right-0 h-1 bg-white opacity-50" />
                                <div className="text-center mb-6">
                                    <div className="text-8xl mb-4 flex justify-center text-brand-blue">{getProductIcon('bluelearnerhub')}</div>
                                    <div className="text-2xl font-display font-bold text-white">Bluelearnerhub</div>
                                    <div className="text-white opacity-50 text-sm">Learn • Code • Grow</div>
                                </div>
                                <div className="space-y-3">
                                    {['React Development Path', 'Full Stack Mastery', 'AI & Machine Learning', 'DevOps Professional'].map((course, i) => (
                                        <motion.div
                                            key={course}
                                            initial={{ opacity: 0, x: -20 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                            className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10"
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-brand-blue">
                                                {[<FiCodepen />, <FiCpu />, <FiActivity />, <FiSettings />][i]}
                                            </div>
                                            <div>
                                                <div className="text-sm text-white font-medium">{course}</div>
                                                <div className="text-xs text-gray-500">{[24, 36, 18, 28][i]} modules</div>
                                            </div>
                                            <div className="ml-auto">
                                                <div className="h-1.5 w-16 bg-white/5 rounded-full overflow-hidden">
                                                    <div className="h-full bg-white rounded-full shadow-[0_0_10px_#ffffff]"
                                                        style={{ width: `${[85, 60, 45, 30][i]}%` }} />
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </FadeInSection>

                {/* Divider */}
                <div className="border-t border-white/5" />

                {/* Finance App - Coming Soon */}
                <FadeInSection id="financeapp">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div className="lg:order-2">
                            <div className="inline-flex items-center gap-3 mb-6">
                                <div className="text-5xl text-brand-blue">{getProductIcon('financeapp')}</div>
                                <div>
                                    <div className="inline-block px-3 py-1 rounded-full border border-white/20 text-gray-500 text-xs font-bold mb-1">
                                        COMING SOON
                                    </div>
                                    <h2 className="text-3xl font-display font-bold text-white">FinanceHub</h2>
                                </div>
                            </div>
                            <p className="text-white opacity-60 font-medium mb-4">Smart Financial Management Platform</p>
                            <p className="text-gray-400 leading-relaxed mb-6">
                                A revolutionary financial management platform currently in the prototype phase. We are focused on building
                                a robust core architecture before unveiling its full capabilities.
                                Currently in Prototype Phase.
                            </p>

                            {/* Progress */}
                            <div className="mb-6">
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-gray-400">Development Progress</span>
                                    <span className="text-white font-bold opacity-80">50%</span>
                                </div>
                                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        whileInView={{ width: '50%' }}
                                        transition={{ duration: 2, ease: 'easeOut' }}
                                        className="h-full bg-white rounded-full"
                                    />
                                </div>
                                <div className="text-xs text-gray-500 mt-2">500+ users on the waitlist</div>
                            </div>

                            {/* Prototype Info */}
                            <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8 text-center">
                                <span className="text-white font-medium block mb-2">Internal Prototype v0.1</span>
                                <p className="text-gray-500 text-xs">Features are currently under NDA and subject to initial testing.</p>
                            </div>

                            {/* Notify form */}
                            {notified ? (
                                <div className="p-4 bg-white/5 border border-white/20 rounded-xl text-white text-sm">
                                    ✓ You're on the list! We'll notify you at launch.
                                </div>
                            ) : (
                                <form onSubmit={handleNotify} className="flex gap-2">
                                    <input
                                        type="email"
                                        value={notifyEmail}
                                        onChange={e => setNotifyEmail(e.target.value)}
                                        placeholder="Enter your email for early access"
                                        required
                                        className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-white/50"
                                    />
                                    <button
                                        type="submit"
                                        className="px-5 py-3 rounded-xl text-sm font-bold text-black bg-white hover:bg-gray-100 whitespace-nowrap"
                                    >
                                        Notify Me
                                    </button>
                                </form>
                            )}
                        </div>

                        <div className="lg:order-1 relative">
                            <div className="glassmorphism rounded-3xl border border-white/10 p-8 relative overflow-hidden"
                                style={{ boxShadow: '0 0 60px rgba(255,255,255,0.03)' }}>
                                <div className="absolute top-0 left-0 right-0 h-1 bg-white opacity-20" />
                                <div className="absolute top-4 right-4 px-3 py-1.5 bg-white/10 border border-white/20 rounded-full text-white/60 text-xs font-bold">
                                    COMING SOON
                                </div>
                                <div className="text-center mb-6">
                                    <div className="text-8xl mb-4 flex justify-center text-brand-blue">{getProductIcon('financeapp')}</div>
                                    <div className="text-2xl font-display font-bold text-white">FinanceHub</div>
                                    <div className="text-white opacity-40 text-sm">Internal Prototype Phase</div>
                                </div>
                                <div className="space-y-3">
                                    {['Kernel Engine', 'Data Vault', 'Quantum Flow', 'Nexus Grid'].map((feat, i) => (
                                        <div key={feat} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                                            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-brand-blue text-sm">
                                                {[<FiLayers />, <FiDatabase />, <FiZap />, <FiGlobe />][i]}
                                            </div>
                                            <span className="text-sm text-gray-300 italic">{feat} (Internal)</span>
                                            <div className="ml-auto w-2 h-2 rounded-full bg-white opacity-40 animate-pulse" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </FadeInSection>
            </div>
        </div>
    );
}
