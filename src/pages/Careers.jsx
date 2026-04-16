import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FadeInSection from '../components/animations/FadeInSection';
import LiquidBlob from '../components/animations/LiquidBlob';
import ParticleSystem from '../components/animations/ParticleSystem';



const cultureSlides = [
    { title: 'Innovation First', desc: 'We believe in pushing boundaries and embracing new technologies. Every project is a chance to innovate.', icon: '🚀' },
    { title: 'Collaborative Environment', desc: 'Ideas come from everywhere. We have a flat hierarchy where every voice matters and collaboration thrives.', icon: '🤝' },
    { title: 'Continuous Learning', desc: 'We invest in our people. From learning budgets to weekly knowledge-sharing sessions, growth never stops.', icon: '📚' },
    { title: 'Work-Life Balance', desc: 'Sustainable pace, flexible hours, and a focus on personal wellness. We work hard and recharge well.', icon: '⚖️' },
    { title: 'Global Impact', desc: 'Our products reach users in 5+ countries. The work you do here reaches and inspires people worldwide.', icon: '🌍' },
];


export default function Careers() {
    const [cultureSlide, setCultureSlide] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCultureSlide((prev) => (prev + 1) % cultureSlides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);


    return (
        <div className="min-h-screen pt-20">
            {/* ── Hero ── */}
            <section className="relative min-h-[60vh] flex items-center justify-center text-center overflow-hidden">
                <div className="absolute inset-0 bg-hero-gradient" />
                <div className="absolute inset-0 opacity-5"
                    style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                <LiquidBlob color="#ffffff" size={600} className="-top-20 -left-20 opacity-5" />
                <LiquidBlob color="#ffffff" size={500} delay={3} className="-bottom-20 -right-20 opacity-5" />
                <ParticleSystem count={50} />
                <div className="relative z-10 max-w-4xl mx-auto px-4 py-24">
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 bg-white/5 text-white/80 text-sm font-medium mb-8">
                            Global Innovation
                        </div>
                        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-bold text-white mb-6 leading-none">
                            Build Your <span className="gradient-text">Future</span>
                        </h1>
                        <p className="text-gray-400 text-xl mb-8 max-w-2xl mx-auto">
                            Join Bluecoderhub PVT LTD and work on products that matter,
                            with people who care, from anywhere in the world.
                        </p>
                    </motion.div>
                </div>
            </section>


            {/* ── Why Join Us ── */}
            <section className="max-w-7xl mx-auto px-4 py-20">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <FadeInSection>
                        <div className="inline-block px-4 py-1.5 rounded-full border border-white/20 bg-white/5 text-white/70 text-sm font-medium mb-6">
                            Why Bluecoderhub?
                        </div>
                        <h2 className="text-4xl font-display font-bold text-white mb-6">
                            A Place Where <span className="gradient-text">Talent Thrives</span>
                        </h2>
                        <div className="space-y-4">
                            {['Cutting-edge technology stack always', 'Global clients, meaningful projects', 'Culture of continuous learning', 'Remote-first, flexible work hours', 'Transparent career progression', 'Competitive pay + equity options'].map((point, i) => (
                                <motion.div key={point} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                                    className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white text-xs flex-shrink-0">✓</div>
                                    <span className="text-gray-300 text-sm">{point}</span>
                                </motion.div>
                            ))}
                        </div>
                    </FadeInSection>
                    <FadeInSection direction="left">
                        <div className="h-full">
                            <div className="glassmorphism rounded-3xl border border-white/10 p-8 h-full flex items-center justify-center" style={{ boxShadow: '0 0 60px rgba(255,255,255,0.05)' }}>
                                <div className="text-center">
                                    <div className="text-5xl mb-4">🌍</div>
                                    <h3 className="text-xl font-display font-bold text-white mb-2">Global Impact</h3>
                                    <p className="text-gray-400 text-sm">Join a borderless team building for a global audience.</p>
                                </div>
                            </div>
                        </div>
                    </FadeInSection>
                </div>
            </section>

            {/* ── Culture Carousel ── */}
            <section className="py-16 bg-brand-gray-800/30">
                <div className="max-w-5xl mx-auto px-4">
                    <FadeInSection>
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-display font-bold text-white mb-4">Our <span className="gradient-text">Culture</span></h2>
                        </div>
                    </FadeInSection>
                    <div className="glassmorphism rounded-3xl border border-white/10 overflow-hidden">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={cultureSlide}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.4 }}
                                className="p-12 text-center min-h-[220px] flex flex-col items-center justify-center"
                            >
                                <div className="text-6xl mb-6">{cultureSlides[cultureSlide].icon}</div>
                                <h3 className="text-2xl font-display font-bold text-white mb-4">{cultureSlides[cultureSlide].title}</h3>
                                <p className="text-gray-400 max-w-xl leading-relaxed">{cultureSlides[cultureSlide].desc}</p>
                            </motion.div>
                        </AnimatePresence>
                        <div className="border-t border-white/5 p-4 flex items-center justify-center gap-2">
                            {cultureSlides.map((_, i) => (
                                <button key={i} onClick={() => setCultureSlide(i)}
                                    className={`w-2.5 h-2.5 rounded-full transition-all ${i === cultureSlide ? 'bg-white scale-125 shadow-[0_0_10px_white]' : 'bg-white/10 hover:bg-white/30'}`} />
                            ))}
                        </div>
                    </div>
                </div>
            </section>



        </div>
    );
}
