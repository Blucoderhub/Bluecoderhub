import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { TypeAnimation } from 'react-type-animation';
import LiquidBlob from '../components/animations/LiquidBlob';
import FadeInSection from '../components/animations/FadeInSection';
import Button from '../components/common/Button';
import products from '../data/products.json';
import { Link } from 'react-router-dom';

export default function Home() {
    return (
        <div className="flex flex-col min-h-screen">
            {/* ─── LEVEL 1: PRESENTATION LAYER (TOP TIER) ─── */}
            {/* Focus: Emotional Design, Storytelling, Z-Pattern, Leadership */}
            <section className="relative min-h-screen flex items-center pt-24 section-dark">
                <div className="absolute inset-0 z-0">
                    <img
                        src="/hero_team_professional_1776320162550.png"
                        alt="Expert Engineering Team"
                        className="w-full h-full object-cover opacity-40 grayscale-[20%]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/60 text-xs font-mono mb-6 uppercase tracking-widest">
                            Established Excellence
                        </span>
                        <h1 className="text-7xl lg:text-8xl font-serif font-bold text-white mb-6 leading-[0.9] tracking-tight">
                            Engineering <br />
                            <span className="italic text-gray-400">Digital Trust.</span>
                        </h1>
                        <p className="text-xl text-gray-400 max-w-lg mb-8 leading-relaxed font-light">
                            Bluecoderhub PVT LTD isn't just a software house. We are the architects of 
                            sustainable digital growth for global leaders.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <Button href="/products" size="xl" className="font-bold">
                                View Ecosystem
                            </Button>
                            <Button href="/contact" size="xl" variant="secondary">
                                Partner With Us
                            </Button>
                        </div>
                    </motion.div>

                    {/* Social Proof Overlay (Emotional Design / Trust) */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5, duration: 1 }}
                        className="hidden lg:block glassmorphism p-8 rounded-3xl border border-white/10"
                    >
                        <div className="flex items-center gap-1 mb-4">
                            {[1, 2, 3, 4, 5].map(i => <span key={i} className="text-white text-lg">★</span>)}
                        </div>
                        <blockquote className="text-lg font-serif italic text-white/90 mb-6">
                            "At Bluecoderhub, we don't just build software; we build the digital nervous systems 
                            that allow enterprises to thrive in an era of rapid disruption."
                        </blockquote>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-xl">👤</div>
                            <div>
                                <div className="text-sm font-bold text-white">Shankar R</div>
                                <div className="text-xs text-gray-400">CEO, Bluecoderhub PVT LTD</div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>


            {/* ─── LEVEL 2: APPLICATION/BUSINESS LAYER (MIDDLE TIER) ─── */}
            {/* Focus: Clarity, White Space, Cognitive Load Reduction, Choices */}
            <section className="section-light py-32">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col lg:flex-row justify-between items-end mb-20 gap-8">
                        <div className="max-w-2xl">
                            <span className="text-accent-cyan font-bold tracking-[0.2em] uppercase text-xs mb-4 block">Product Ecosystem</span>
                            <h2 className="text-5xl lg:text-6xl font-serif font-bold mb-6">Built for Purpose, <br />Scalable by Design.</h2>
                            <p className="text-lg text-gray-600">
                                We limit our focus to three core industries to ensure absolute mastery. 
                                Explore our specialized software tiers.
                            </p>
                        </div>
                        <Link to="/products" className="text-black font-bold border-b-2 border-black pb-1 hover:opacity-60 transition-all">
                            View All Platforms →
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {products.map((p, i) => (
                            <motion.div 
                                key={p.id}
                                whileHover={{ y: -10 }}
                                className="group"
                            >
                                <div className="text-6xl mb-8 group-hover:scale-110 transition-transform duration-500 origin-left">{p.icon}</div>
                                <h3 className="text-2xl font-serif font-bold mb-3">{p.name}</h3>
                                <p className="text-gray-500 mb-6 line-clamp-3 leading-relaxed">
                                    {p.description}
                                </p>
                                <div className="flex items-center gap-3">
                                    <Link to={`/products#${p.id}`} className="text-sm font-bold hover:text-accent-cyan transition-colors">
                                        Learn More
                                    </Link>
                                    <span className="w-0 h-[1px] bg-accent-cyan group-hover:w-12 transition-all duration-500" />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>


            {/* ─── LEVEL 3: DATA LAYER (BOTTOM TIER) ─── */}
            {/* Focus: Security, Data, Infrastructure, Technical Authority, Scarcity */}
            <section className="section-dark py-32 relative overflow-hidden">
                <LiquidBlob color="#3b82f6" size={800} className="-bottom-64 -right-64 opacity-10" />
                
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-20 items-center">
                        <div className="order-2 lg:order-1">
                            <div className="grid grid-cols-2 gap-8">
                                {[
                                    { label: 'Uptime SLA', val: '99.9%' },
                                    { label: 'Global Clients', val: '50+' },
                                    { label: 'Secure Datapoints', val: '12M+' },
                                    { label: 'Engineering Hours', val: '400k+' }
                                ].map(s => (
                                    <div key={s.label} className="border-l border-white/10 pl-6 py-4">
                                        <div className="text-4xl font-display font-bold text-white mb-2">{s.val}</div>
                                        <div className="text-xs text-gray-500 font-mono uppercase tracking-widest">{s.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="order-1 lg:order-2">
                            <span className="text-white/40 font-mono text-xs mb-4 block">Infrastructure & Security</span>
                            <h2 className="text-4xl font-serif font-bold text-white mb-6">The Granite Foundation <br />of Your Data.</h2>
                            <p className="text-gray-400 mb-10 leading-relaxed font-light">
                                Our data layer is engineered for zero-failure performance. We utilize 
                                redundant distributed architectures that safeguard your most critical 
                                enterprise assets.
                            </p>
                            
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]" />
                                    <span className="text-sm text-white font-medium">Core Nodes Active</span>
                                </div>
                                <span className="text-xs text-white/30 font-mono">LATENCY: 12ms</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA / Urgency Layer */}
            <section className="py-24 section-light text-center border-t border-black/5">
                <div className="max-w-3xl mx-auto px-6">
                    <h2 className="text-4xl font-serif font-bold mb-6">Ready to Engineer the Future?</h2>
                    <p className="text-lg text-gray-600 mb-10">
                        We only accept two new enterprise partnerships per quarter to maintain our standards. 
                        <strong> Current availability: 1 slot remaining for Q2 2026.</strong>
                    </p>
                    <div className="flex justify-center flex-col sm:flex-row gap-4">
                        <Button href="/contact" size="xl">Request Consultation</Button>
                        <Button href="/careers" size="xl" variant="secondary">Join the Engineers</Button>
                    </div>
                </div>
            </section>
        </div>
    );
}
