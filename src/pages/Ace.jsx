import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FadeInSection from '../components/animations/FadeInSection';
import LiquidBlob from '../components/animations/LiquidBlob';
import ParticleSystem from '../components/animations/ParticleSystem';
import { useAI } from '../hooks/useAI';
import { modifyContent } from '../utils/ai';

const features = [
    { icon: '🤖', title: 'Smart Content Editor', desc: 'Update any section of your website using plain English commands. No code required.', color: '#ffffff' },
    { icon: '📝', title: 'Text File Management', desc: 'Upload, edit, and manage .txt content files directly from the browser with auto-formatting.', color: '#999999' },
    { icon: '🖼️', title: 'Image Management', desc: 'Drag-and-drop image uploads with AI-powered optimization, smart cropping, and alt-text generation.', color: '#666666' },
    { icon: '🎨', title: 'Visual Section Builder', desc: 'Build and rearrange website sections visually with pre-built templates and custom layouts.', color: '#333333' },
    { icon: '💻', title: 'AI Code Modifier', desc: 'Describe a feature in plain language and ACE generates safe, reviewable code changes instantly.', color: '#aaaaaa' },
];

const useCases = [
    { icon: '📰', title: 'Blog Content Updates', desc: 'Update article headlines, body text, and metadata with a single instruction.' },
    { icon: '🛒', title: 'Product Descriptions', desc: 'Rewrite product copy for different audiences or campaigns using AI.' },
    { icon: '🖼️', title: 'Image Galleries', desc: 'Auto-optimize, tag, and organize image libraries for your website.' },
    { icon: '👥', title: 'Team Profiles', desc: 'Add or update team member profiles without touching any code.' },
    { icon: '💰', title: 'Pricing Tables', desc: 'Update pricing, features, and CTAs across multiple pages simultaneously.' },
    { icon: '❓', title: 'FAQ Sections', desc: 'Manage and reorder FAQ content with AI-assisted answer generation.' },
];

export default function Ace() {
    const [demoInput, setDemoInput] = useState('');
    const [demoOriginal] = useState('Building Tomorrow\'s Digital Solutions');
    const [demoResult, setDemoResult] = useState('');
    const { loading, error, call } = useAI();

    const handleDemo = async () => {
        if (!demoInput.trim()) return;
        try {
            const result = await call(modifyContent, demoInput, demoOriginal);
            setDemoResult(result);
        } catch {
            setDemoResult('⚠️ Please configure your Anthropic API key in .env to use live AI features.');
        }
    };

    return (
        <div className="min-h-screen pt-20">
            {/* ── Hero ── */}
            <section className="relative min-h-[65vh] flex items-center justify-center text-center overflow-hidden">
                <div className="absolute inset-0 bg-hero-gradient" />
                {/* Neural grid */}
                <div className="absolute inset-0 opacity-10"
                    style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
                <LiquidBlob color="#ffffff" size={700} className="-top-32 -left-32 opacity-5" />
                <LiquidBlob color="#ffffff" size={500} delay={2} className="-bottom-20 -right-20 opacity-5" />
                <ParticleSystem count={80} />
                <div className="relative z-10 max-w-4xl mx-auto px-4 py-24">
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 bg-white/5 text-white/80 text-sm font-medium mb-8">
                            <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }} className="w-2 h-2 bg-white rounded-full shadow-[0_0_8px_white]" />
                            AI-Powered Content Engine
                        </div>
                        <h1 className="text-6xl sm:text-7xl lg:text-8xl font-display font-bold text-white mb-6">
                            Meet <span className="gradient-text">ACE</span>
                        </h1>
                        <p className="text-2xl text-gray-300 mb-4 font-light">AI Content Engine</p>
                        <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
                            Manage, modify, and enhance every piece of your website's content using natural language.
                            No developers needed. Just tell ACE what you want.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a href="#demo" className="inline-flex items-center gap-2 px-7 py-4 rounded-2xl text-base font-semibold text-white border border-white/20 hover:bg-white/5 transition-all">
                                See Demo ↓
                            </a>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ── Features ── */}
            <section className="max-w-7xl mx-auto px-4 py-20">
                <FadeInSection>
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-display font-bold text-white mb-4">
                            AI-Powered <span className="gradient-text">Capabilities</span>
                        </h2>
                        <p className="text-gray-400 max-w-xl mx-auto">
                            ACE combines natural language understanding with your website's content to deliver instant, intelligent updates.
                        </p>
                    </div>
                </FadeInSection>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((f, i) => (
                        <FadeInSection key={f.title} delay={i * 0.1}>
                            <motion.div
                                whileHover={{ y: -8, boxShadow: `0 20px 60px ${f.color}20` }}
                                className="glassmorphism rounded-2xl border border-white/10 p-6 group cursor-pointer"
                            >
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform"
                                    style={{ background: `${f.color}15`, border: `1px solid ${f.color}30` }}>
                                    {f.icon}
                                </div>
                                <h3 className="font-display font-semibold text-white text-lg mb-2">{f.title}</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
                            </motion.div>
                        </FadeInSection>
                    ))}
                </div>
            </section>

            {/* ── Live Demo ── */}
            <section id="demo" className="max-w-4xl mx-auto px-4 py-16">
                <FadeInSection>
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-display font-bold text-white mb-4">
                            Try ACE <span className="gradient-text">Live</span>
                        </h2>
                        <p className="text-gray-400">Interact with a real AI content modification demo below.</p>
                    </div>
                </FadeInSection>

                <div className="glassmorphism rounded-3xl border border-white/10 overflow-hidden" style={{ boxShadow: '0 0 80px rgba(255,255,255,0.05)' }}>
                    <div className="border-b border-white/10 px-6 py-4 flex items-center gap-2 bg-white/5">
                        <div className="w-3 h-3 rounded-full bg-white/40" />
                        <div className="w-3 h-3 rounded-full bg-white/20" />
                        <div className="w-3 h-3 rounded-full bg-white/10" />
                        <span className="ml-4 font-mono text-xs text-gray-400">ACE Content Engine — Live Demo</span>
                    </div>
                    <div className="p-6 space-y-5">
                        <div>
                            <div className="text-xs text-white opacity-40 font-mono uppercase tracking-wider mb-2">Current Content</div>
                            <div className="bg-white/3 border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-300 font-mono">
                                "{demoOriginal}"
                            </div>
                        </div>
                        <div>
                            <div className="text-xs text-white opacity-40 font-mono uppercase tracking-wider mb-2">Your Instruction</div>
                            <input
                                value={demoInput}
                                onChange={e => setDemoInput(e.target.value)}
                                placeholder='e.g. "Make it more powerful and add a sense of urgency"'
                                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-white/50 transition-all font-mono"
                                onKeyDown={e => e.key === 'Enter' && handleDemo()}
                            />
                        </div>
                        <button
                            onClick={handleDemo}
                            disabled={loading || !demoInput.trim()}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-black bg-white hover:bg-gray-100 disabled:opacity-40 transition-all shadow-[0_10px_30px_rgba(255,255,255,0.1)]"
                        >
                            {loading ? <>
                                <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}
                                    className="w-4 h-4 border-2 border-black border-t-transparent rounded-full" />
                                Processing...
                            </> : '🤖 Generate with ACE'}
                        </button>

                        <AnimatePresence>
                            {(demoResult || error) && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                                    <div className="text-xs text-white opacity-50 font-mono uppercase tracking-wider mb-2">AI Result</div>
                                    <div className="bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-sm text-white font-mono">
                                        "{demoResult || error}"
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </section>

            {/* ── Use Cases ── */}
            <section className="max-w-7xl mx-auto px-4 py-16 pb-24">
                <FadeInSection>
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-display font-bold text-white mb-4">
                            Real-World <span className="gradient-text">Use Cases</span>
                        </h2>
                    </div>
                </FadeInSection>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {useCases.map((u, i) => (
                        <FadeInSection key={u.title} delay={i * 0.08}>
                            <motion.div whileHover={{ scale: 1.04 }}
                                className="glassmorphism rounded-2xl border border-white/10 p-5">
                                <div className="text-3xl mb-3">{u.icon}</div>
                                <h3 className="font-semibold text-white text-sm mb-1">{u.title}</h3>
                                <p className="text-gray-500 text-xs leading-relaxed">{u.desc}</p>
                            </motion.div>
                        </FadeInSection>
                    ))}
                </div>
            </section>
        </div>
    );
}
