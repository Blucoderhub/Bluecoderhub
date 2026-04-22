import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { TypeAnimation } from 'react-type-animation';
import LiquidBlob from '../components/animations/LiquidBlob';
import FadeInSection from '../components/animations/FadeInSection';
import Button from '../components/common/Button';
import products from '../data/products.json';
import { Link } from 'react-router-dom';
import { MdSchool } from 'react-icons/md';
import { FiUser } from 'react-icons/fi';

export default function Home() {
    return (
        <div className="flex flex-col min-h-screen">
            {/* ─── LEVEL 1: PRESENTATION LAYER (TOP TIER) ─── */}
            <section className="relative min-h-screen flex items-center pt-24 pb-12 lg:pt-32 overflow-hidden">
                <div className="relative z-10 max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                        className="text-center lg:text-left"
                    >
                        <motion.span 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] sm:text-xs font-mono mb-8 uppercase tracking-widest"
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                            Established Excellence
                        </motion.span>
                        <h1 className="text-5xl sm:text-7xl lg:text-[100px] font-display font-bold text-white mb-8 leading-[1] lg:leading-[0.85] tracking-tight">
                            Engineering <br />
                            <span className="italic text-gray-500">Digital Trust.</span>
                        </h1>
                        <p className="text-lg sm:text-xl text-gray-400 max-w-lg mx-auto lg:mx-0 mb-10 leading-relaxed font-light">
                            Bluecoderhub PVT LTD isn't just a software house. We are the architects of 
                            sustainable digital growth for global leaders.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 sm:gap-6">
                            <Button size="lg" className="w-full sm:w-auto" href="/careers">Work With Us →</Button>
                            <Button variant="ghost" size="lg" className="w-full sm:w-auto" href="/about">Our Vision</Button>
                        </div>
                    </motion.div>

                    {/* Social Proof Overlay with Perspective Tilt - Visible on all screens now */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                        className="perspective-1000"
                    >
                        <motion.div 
                            whileHover={{ rotateX: 5, rotateY: -5, scale: 1.02 }}
                            className="glassmorphism p-8 sm:p-12 rounded-[30px] sm:rounded-[40px] border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.5)] relative overflow-hidden group"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[60px] group-hover:bg-blue-500/20 transition-colors" />
                            
                            <div className="flex items-center gap-1 mb-6">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <motion.span 
                                        key={i} 
                                        initial={{ opacity: 0, scale: 0 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.8 + (i * 0.1) }}
                                        className="text-blue-400 text-lg"
                                    >
                                        ★
                                    </motion.span>
                                ))}
                            </div>
                            <blockquote className="text-xl sm:text-2xl font-display font-medium text-white/90 mb-10 leading-snug">
                                "At Bluecoderhub, we don't just build software; we build the digital nervous systems 
                                that allow enterprises to thrive in an era of rapid disruption."
                            </blockquote>
                            <div className="flex items-center gap-5">
                                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xl text-white shadow-lg">
                                    <FiUser />
                                </div>
                                <div>
                                    <div className="text-sm sm:text-base font-bold text-white tracking-wide">Shankar R</div>
                                    <div className="text-[10px] sm:text-xs text-gray-500 font-mono uppercase tracking-widest mt-1">CEO, Bluecoderhub PVT LTD</div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>


            {/* ─── LEVEL 2: APPLICATION/BUSINESS LAYER (MIDDLE TIER) ─── */}
            <section className="section-light py-20 lg:py-32">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-16 lg:mb-20 gap-8">
                        <div className="max-w-2xl">
                            <span className="text-accent-cyan font-bold tracking-[0.2em] uppercase text-[10px] sm:text-xs mb-4 block">Our Product</span>
                            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold mb-6">Bluelearnerhub: <br className="hidden sm:block" />Transforming Education.</h2>
                            <p className="text-base sm:text-lg text-gray-600">
                                Our flagship product is an intelligent learning platform that personalizes education through adaptive learning paths, gamified experiences, and real-time progress tracking.
                            </p>
                        </div>
                        <a href="https://bluelearnerhub.com" target="_blank" rel="noopener noreferrer" className="text-black font-bold border-b-2 border-black pb-1 hover:opacity-60 transition-all text-sm sm:text-base whitespace-nowrap">
                            Visit Bluelearnerhub →
                        </a>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
                        {products.map((p, i) => (
                            <motion.div 
                                key={p.id}
                                whileHover={{ y: -10 }}
                                className="group p-8 rounded-3xl bg-white border border-black/5 hover:border-blue-500/20 transition-all shadow-sm hover:shadow-xl"
                            >
                                <div className="text-5xl sm:text-6xl mb-6 group-hover:scale-110 transition-transform duration-500 origin-left text-brand-blue">
                                    {<MdSchool />}
                                </div>
                                <h3 className="text-xl sm:text-2xl font-display font-bold mb-3">{p.name}</h3>
                                <p className="text-sm sm:text-base text-gray-500 mb-6 line-clamp-3 leading-relaxed">
                                    {p.description}
                                </p>
                                <div className="flex items-center gap-3">
                                    <a href={p.url} target="_blank" rel="noopener noreferrer" className="text-xs sm:text-sm font-bold hover:text-accent-cyan transition-colors">
                                        Learn More
                                    </a>
                                    <span className="w-0 h-[1px] bg-accent-cyan group-hover:w-12 transition-all duration-500" />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>


            {/* ─── LEVEL 3: DATA LAYER (BOTTOM TIER) ─── */}
            <section className="section-dark py-20 lg:py-32 relative overflow-hidden">
                <LiquidBlob color="#3b82f6" size={800} className="-bottom-64 -right-64 opacity-10" />
                
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <span className="text-white/40 font-mono text-[10px] sm:text-xs mb-4 block">Infrastructure & Security</span>
                            <h2 className="text-3xl sm:text-4xl font-display font-bold text-white mb-6">The Granite Foundation <br />of Your Data.</h2>
                            <p className="text-sm sm:text-base text-gray-400 mb-10 leading-relaxed font-light max-w-xl">
                                Our data layer is engineered for zero-failure performance. We utilize 
                                redundant distributed architectures that safeguard your most critical 
                                enterprise assets.
                            </p>
                            
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 sm:p-6 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]" />
                                    <span className="text-xs sm:text-sm text-white font-medium">Core Nodes Active</span>
                                </div>
                                <span className="text-[10px] sm:text-xs text-white/30 font-mono">LATENCY: 12ms</span>
                            </div>
                        </div>
                        <div className="hidden lg:flex justify-end">
                            <div className="w-full max-w-sm aspect-square glassmorphism rounded-[40px] flex items-center justify-center border border-white/5">
                                <div className="text-white/10 text-9xl font-display font-bold">CORE</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA / Urgency Layer */}
            <section className="py-20 lg:py-32 section-light text-center border-t border-black/5">
                <div className="max-w-3xl mx-auto px-6">
                    <h2 className="text-3xl sm:text-4xl font-display font-bold mb-6">Ready to Engineer the Future?</h2>
                    <p className="text-base sm:text-lg text-gray-600 mb-10 leading-relaxed">
                        We only accept two new enterprise partnerships per quarter to maintain our standards. <br className="hidden sm:block" />
                        <strong> Current availability: 1 slot remaining for Q2 2026.</strong>
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Button size="lg" href="/contact" className="w-full sm:w-auto">Get In Touch</Button>
                        <Button variant="outline" size="lg" href="/careers" className="w-full sm:w-auto text-black border-black hover:bg-black/5">View Openings</Button>
                    </div>
                </div>
            </section>
        </div>
    );
}
