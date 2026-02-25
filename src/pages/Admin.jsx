import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { storage } from '../utils/storage';
import { modifyContent, generateBlogContent } from '../utils/ai';
import { useAI } from '../hooks/useAI';
import {
    verifyPassword,
    getStoredPasswordHash,
    setAdminSession,
    getAdminSession,
    clearAdminSession,
} from '../security/auth';
import { checkRateLimit, recordCall, formatWaitTime } from '../security/rateLimit';

const sections = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard' },
    { id: 'content', icon: '✏️', label: 'Content Editor' },
    { id: 'images', icon: '🖼️', label: 'Images' },
    { id: 'blog', icon: '📝', label: 'Blog Posts' },
    { id: 'applications', icon: '👥', label: 'Applications' },
    { id: 'subscribers', icon: '📧', label: 'Subscribers' },
    { id: 'ace', icon: '🤖', label: 'ACE AI Engine' },
];

function LoginScreen({ onLogin }) {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [shake, setShake] = useState(false);
    const [loading, setLoading] = useState(false);
    const [lockoutMs, setLockoutMs] = useState(0);

    // Countdown timer for lockout
    useEffect(() => {
        if (lockoutMs <= 0) return;
        const timer = setInterval(() => {
            setLockoutMs(prev => {
                if (prev <= 1000) { clearInterval(timer); return 0; }
                return prev - 1000;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [lockoutMs]);

    const handleLogin = useCallback(async (e) => {
        e.preventDefault();
        setError('');

        // Rate limit check
        const { allowed, waitMs, locked } = checkRateLimit('admin_login');
        if (!allowed) {
            setLockoutMs(waitMs);
            setError(locked
                ? `Too many failed attempts. Locked for ${formatWaitTime(waitMs)}.`
                : `Please wait ${formatWaitTime(waitMs)} before trying again.`
            );
            return;
        }

        if (!password.trim()) {
            setError('Password is required.');
            return;
        }

        setLoading(true);
        try {
            const storedHash = await getStoredPasswordHash();
            if (!storedHash) {
                setError('Admin password not configured. Set VITE_ADMIN_PASSWORD in your .env file.');
                setLoading(false);
                return;
            }

            const valid = await verifyPassword(password, storedHash);
            recordCall('admin_login');

            if (valid) {
                setAdminSession();
                onLogin();
            } else {
                setError('Incorrect password. Please try again.');
                setShake(true);
                setTimeout(() => setShake(false), 500);
            }
        } catch {
            setError('Authentication error. Please try again.');
        } finally {
            setLoading(false);
            setPassword('');
        }
    }, [password, onLogin]);

    const isLocked = lockoutMs > 0;

    return (
        <div className="min-h-screen flex items-center justify-center bg-hero-gradient relative overflow-hidden">
            <div className="absolute inset-0 opacity-5"
                style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
            <motion.div
                animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
                transition={{ duration: 0.3 }}
                className="w-full max-w-sm mx-4"
            >
                <div className="glassmorphism rounded-3xl border border-white/10 p-8" style={{ boxShadow: '0 0 60px rgba(255,255,255,0.05)' }}>
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-3xl mx-auto mb-4">
                            🔐
                        </div>
                        <h1 className="text-2xl font-display font-bold text-white">Admin Access</h1>
                        <p className="text-gray-500 text-sm mt-1">Bluecoderhub CMS & ACE Engine</p>
                    </div>
                    <form onSubmit={handleLogin} className="space-y-4" autoComplete="off">
                        {/* Honeypot — bots fill this, humans don't */}
                        <input type="text" name="username" className="hidden" tabIndex="-1" aria-hidden="true" />
                        <div>
                            <label className="text-xs text-gray-400 mb-1 block">Admin Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={e => { setPassword(e.target.value); setError(''); }}
                                placeholder="Enter admin password"
                                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-white/50 transition-all"
                                autoFocus
                                disabled={isLocked || loading}
                                maxLength={128}
                                autoComplete="current-password"
                            />
                            {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
                            {isLocked && (
                                <p className="text-yellow-500/80 text-xs mt-1">
                                    Retry in {Math.ceil(lockoutMs / 1000)}s…
                                </p>
                            )}
                        </div>
                        <button
                            type="submit"
                            disabled={isLocked || loading}
                            className="w-full py-3 rounded-xl text-sm font-bold text-black bg-white hover:bg-gray-200 hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? '🔄 Verifying…' : isLocked ? '🔒 Locked' : 'Enter Dashboard →'}
                        </button>
                    </form>
                    <p className="text-xs text-gray-600 text-center mt-4">
                        Configure via <code className="font-mono text-gray-500">VITE_ADMIN_PASSWORD</code> env var
                    </p>
                </div>
            </motion.div>
        </div>
    );
}

function DashboardSection() {
    const apps = storage.getApplications();
    const subs = storage.getSubscribers();
    const images = storage.getImages();
    const content = storage.getAllPageContent();
    const pages = Object.keys(content);

    const stats = [
        { icon: '👥', label: 'Job Applications', value: apps.length, color: '#ffffff' },
        { icon: '📧', label: 'Newsletter Subscribers', value: subs.length, color: '#dddddd' },
        { icon: '🖼️', label: 'Images Uploaded', value: images.length, color: '#999999' },
        { icon: '📄', label: 'Pages Configured', value: pages.length, color: '#666666' },
    ];

    return (
        <div>
            <h2 className="text-2xl font-display font-bold text-white mb-6">Dashboard Overview</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {stats.map(s => (
                    <div key={s.label} className="glassmorphism rounded-2xl border border-white/10 p-5"
                        style={{ boxShadow: `0 0 20px ${s.color}10` }}>
                        <div className="text-3xl mb-3">{s.icon}</div>
                        <div className="text-3xl font-display font-bold" style={{ color: s.color }}>{s.value}</div>
                        <div className="text-xs text-gray-500 mt-1">{s.label}</div>
                    </div>
                ))}
            </div>

            <div className="glassmorphism rounded-2xl border border-white/10 p-6">
                <h3 className="font-semibold text-white mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                        { icon: '✏️', label: 'Edit Content', onClick: () => { } },
                        { icon: '🖼️', label: 'Upload Image', onClick: () => { } },
                        { icon: '📝', label: 'New Blog Post', onClick: () => { } },
                        { icon: '🤖', label: 'Use ACE AI', onClick: () => { } },
                    ].map(a => (
                        <button key={a.label} onClick={a.onClick}
                            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/30 hover:bg-white/5 transition-all">
                            <span className="text-2xl">{a.icon}</span>
                            <span className="text-xs text-gray-400">{a.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

function ContentEditor() {
    const [page, setPage] = useState('home');
    const [section, setSection] = useState('hero_title');
    const [currentText, setCurrentText] = useState('Building Tomorrow\'s Digital Solutions');
    const [aiInstruction, setAiInstruction] = useState('');
    const [saved, setSaved] = useState(false);
    const { loading, call } = useAI();

    const handleSave = () => {
        storage.savePageContent(page, section, currentText);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const handleAI = async () => {
        if (!aiInstruction.trim()) return;
        try {
            const result = await call(modifyContent, aiInstruction, currentText);
            if (result) setCurrentText(result);
        } catch { }
    };

    return (
        <div>
            <h2 className="text-2xl font-display font-bold text-white mb-6">Content Editor</h2>
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs text-gray-400 mb-1 block">Page</label>
                        <select value={page} onChange={e => setPage(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none">
                            {['home', 'products', 'services', 'about', 'careers', 'blog', 'contact'].map(p => (
                                <option key={p} value={p} className="bg-brand-gray-800 capitalize">{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs text-gray-400 mb-1 block">Section</label>
                        <input value={section} onChange={e => setSection(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none"
                            placeholder="e.g. hero_title, cta_text" />
                    </div>
                </div>

                <div>
                    <label className="text-xs text-gray-400 mb-1 block">Content</label>
                    <textarea value={currentText} onChange={e => setCurrentText(e.target.value)} rows={5}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none resize-none" />
                </div>

                <div className="glassmorphism rounded-2xl border border-white/20 p-5">
                    <div className="text-xs text-white opacity-60 font-mono uppercase tracking-wider mb-3 flex items-center gap-2">
                        <span>🤖</span> ACE AI Enhancement
                    </div>
                    <div className="flex gap-3">
                        <input value={aiInstruction} onChange={e => setAiInstruction(e.target.value)}
                            placeholder='e.g. "Make it more compelling and add urgency"'
                            className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-white/50" />
                        <button onClick={handleAI} disabled={loading}
                            className="px-5 py-2.5 rounded-xl text-sm font-bold text-black bg-white hover:bg-gray-200 disabled:opacity-40 whitespace-nowrap">
                            {loading ? '⏳ AI...' : '✨ Enhance'}
                        </button>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button onClick={handleSave}
                        className="px-6 py-3 rounded-xl text-sm font-bold text-black bg-white hover:bg-gray-200">
                        {saved ? '✓ Saved!' : 'Save Changes'}
                    </button>
                    <button onClick={() => { setCurrentText(''); setSaved(false); }}
                        className="px-6 py-3 rounded-xl text-sm font-semibold text-gray-400 border border-white/10 hover:text-white transition-all">
                        Clear
                    </button>
                </div>
            </div>
        </div>
    );
}

function ApplicationsSection() {
    const apps = storage.getApplications();

    return (
        <div>
            <h2 className="text-2xl font-display font-bold text-white mb-6">Job Applications ({apps.length})</h2>
            {apps.length === 0 ? (
                <div className="glassmorphism rounded-2xl border border-white/10 p-12 text-center text-gray-500">
                    <div className="text-4xl mb-3">📭</div>
                    <div>No applications yet. They will appear here when candidates apply through the Careers page.</div>
                </div>
            ) : (
                <div className="space-y-3">
                    {apps.map((app, i) => (
                        <div key={i} className="glassmorphism rounded-2xl border border-white/10 p-5 flex items-center justify-between">
                            <div>
                                <div className="font-semibold text-white">{app.name}</div>
                                <div className="text-xs text-gray-500">{app.email} • Applied for: {app.position}</div>
                            </div>
                            <span className="text-xs px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white opacity-70">New</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function SubscribersSection() {
    const subs = storage.getSubscribers();

    return (
        <div>
            <h2 className="text-2xl font-display font-bold text-white mb-6">Newsletter Subscribers ({subs.length})</h2>
            {subs.length === 0 ? (
                <div className="glassmorphism rounded-2xl border border-white/10 p-12 text-center text-gray-500">
                    <div className="text-4xl mb-3">📧</div>
                    <div>No subscribers yet. They will appear here when people subscribe through the Footer or Contact form.</div>
                </div>
            ) : (
                <div className="space-y-2">
                    {subs.map((s, i) => (
                        <div key={i} className="glassmorphism rounded-xl border border-white/10 px-5 py-3 flex items-center justify-between">
                            <span className="text-sm text-white font-mono">{s.email}</span>
                            <span className="text-xs text-gray-500">{new Date(s.date).toLocaleDateString()}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function AceSection() {
    const [instruction, setInstruction] = useState('');
    const [topic, setTopic] = useState('');
    const [result, setResult] = useState('');
    const { loading, call } = useAI();

    const handleGenerate = async () => {
        try {
            const content = await call(generateBlogContent, topic || 'Technology trends');
            if (content) setResult(content);
        } catch {
            setResult('⚠️ Configure VITE_ANTHROPIC_API_KEY to enable AI features.');
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-display font-bold text-white mb-2 flex items-center gap-2">
                <span>🤖</span> ACE AI Engine
            </h2>
            <p className="text-gray-400 text-sm mb-6">Use Claude AI to generate and enhance content for your website.</p>

            <div className="space-y-5">
                <div className="glassmorphism rounded-2xl border border-white/10 p-6">
                    <h3 className="font-semibold text-white mb-4">Blog Content Generator</h3>
                    <div className="space-y-3">
                        <input value={topic} onChange={e => setTopic(e.target.value)}
                            placeholder='Blog topic, e.g. "The future of AI in web development"'
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-white/50" />
                        <button onClick={handleGenerate} disabled={loading}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-black bg-white hover:bg-gray-200 disabled:opacity-40">
                            {loading ? '⏳ Generating...' : '✨ Generate Blog Content'}
                        </button>
                        {result && (
                            <div className="bg-white/3 border border-white/10 rounded-xl p-4 text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                                {result}
                            </div>
                        )}
                    </div>
                </div>

                <div className="glassmorphism rounded-2xl border border-white/10 p-6">
                    <h3 className="font-semibold text-white mb-3">API Configuration</h3>
                    <div className="text-sm text-gray-400 leading-relaxed">
                        <p>To enable AI features, set up your Anthropic API key:</p>
                        <div className="mt-3 p-3 bg-black/30 rounded-xl font-mono text-xs text-white opacity-60 border border-white/5">
                            VITE_ANTHROPIC_API_KEY=your_api_key_here
                        </div>
                        <p className="mt-3 text-xs text-gray-500">
                            Add this to your <code className="font-mono">.env</code> file in the project root.
                            Get your API key from <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-gray-400">console.anthropic.com</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function Admin() {
    const [authenticated, setAuthenticated] = useState(() => {
        // Restore session if still valid (survives HMR / page reloads within same tab)
        return getAdminSession() !== null;
    });
    const [activeSection, setActiveSection] = useState('dashboard');
    const navigate = useNavigate();

    // Auto-logout when session expires (check every minute)
    useEffect(() => {
        if (!authenticated) return;
        const interval = setInterval(() => {
            if (getAdminSession() === null) {
                setAuthenticated(false);
            }
        }, 60_000);
        return () => clearInterval(interval);
    }, [authenticated]);

    const handleLogout = () => {
        clearAdminSession();
        setAuthenticated(false);
    };

    const renderContent = () => {
        switch (activeSection) {
            case 'dashboard': return <DashboardSection />;
            case 'content': return <ContentEditor />;
            case 'applications': return <ApplicationsSection />;
            case 'subscribers': return <SubscribersSection />;
            case 'ace': return <AceSection />;
            default:
                return (
                    <div className="text-center py-20 text-gray-500">
                        <div className="text-4xl mb-3">🚧</div>
                        <div>This section is coming soon.</div>
                    </div>
                );
        }
    };

    if (!authenticated) return <LoginScreen onLogin={() => setAuthenticated(true)} />;

    return (
        <div className="min-h-screen bg-brand-gray-900 flex">
            {/* Sidebar */}
            <div className="w-64 flex-shrink-0 glassmorphism border-r border-white/5 flex flex-col">
                <div className="p-5 border-b border-white/5">
                    <div className="font-display font-bold text-white">Bluecoderhub</div>
                    <div className="text-xs text-white opacity-40">Admin Dashboard</div>
                </div>
                <nav className="flex-1 p-3 space-y-1">
                    {sections.map(s => (
                        <button
                            key={s.id}
                            onClick={() => setActiveSection(s.id)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${activeSection === s.id ? 'bg-white/10 text-white border border-white/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                        >
                            <span>{s.icon}</span>
                            {s.label}
                        </button>
                    ))}
                </nav>
                <div className="p-4 border-t border-white/5 space-y-2">
                    <button onClick={() => navigate('/')}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-gray-500 hover:text-white hover:bg-white/5 transition-all">
                        ← Back to Website
                    </button>
                    <button onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-gray-400 hover:text-white hover:bg-white/5 transition-all">
                        🔓 Logout
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto">
                <div className="p-8">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeSection}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            {renderContent()}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
