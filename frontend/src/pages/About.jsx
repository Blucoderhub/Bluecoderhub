import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FadeInSection from '../components/animations/FadeInSection';
import LiquidBlob from '../components/animations/LiquidBlob';
import { gsap, ScrollTrigger, useGSAPContext } from '../hooks/useScrollTrigger';
import { FiTarget, FiEye, FiAward, FiUser, FiLinkedin, FiGithub, FiTwitter } from 'react-icons/fi';
import team from '../data/team.json';

const SocialIcon = ({ platform }) => {
    switch (platform) {
        case 'linkedin': return <FiLinkedin />;
        case 'github': return <FiGithub />;
        case 'twitter': return <FiTwitter />;
        default: return <FiUser />;
    }
};

const timeline = [
    { id: '1', title: 'The Genesis', desc: 'Bluecoderhub PVT LTD established as a center for technological innovation and strategic product development.' },
    { id: '2', title: 'The Awakening', desc: 'Our first flagship product is about to launch, marking the beginning of our journey to transform digital experiences.' },
];

const values = [
    { icon: <FiTarget />, title: 'Mission', desc: 'To empower businesses with cutting-edge technology that drives growth, efficiency, and innovation.' },
    { icon: <FiEye />, title: 'Vision', desc: 'To be the most trusted technology partner for startups and enterprises worldwide.' },
    { icon: <FiAward />, title: 'Values', desc: 'Excellence, integrity, continuous learning, collaboration, and user-centric thinking in everything we do.' },
];

const quotes = [
    "Most people are average because they fear being obsessed. We chose obsession.",
    "The world is built by people no smarter than you. We are the architects now.",
    "Code is the magic of the 21st century. We are the sorcerers.",
    "We don't build products. We build legacies that outlive their makers.",
    "If you want to change the world, you have to be crazy enough to believe you can."
];

export default function About() {
    const [quoteIndex, setQuoteIndex] = useState(0);
    const timelineRef = useRef(null);
    const teamGridRef = useRef(null);
    const valuesRef = useRef(null);

    useEffect(() => {
        const timer = setInterval(() => {
            setQuoteIndex((prev) => (prev + 1) % quotes.length);
        }, 6000);
        return () => clearInterval(timer);
    }, []);

    // ── ScrollTrigger animations ──────────────────────────────────────────────
    useGSAPContext(() => {
        // 1. Timeline vertical line: scaleY from 0 → 1 as user scrolls through section
        if (timelineRef.current) {
            const line = timelineRef.current.querySelector('.st-timeline-line');
            if (line) {
                gsap.fromTo(line,
                    { scaleY: 0, transformOrigin: 'top center' },
                    {
                        scaleY: 1,
                        ease: 'none',
                        scrollTrigger: {
                            trigger: timelineRef.current,
                            start: 'top 70%',
                            end: 'bottom 70%',
                            scrub: 0.5,
                        },
                    }
                );
            }

            // Timeline items pop in sequentially as line passes them
            const items = timelineRef.current.querySelectorAll('.st-timeline-item');
            items.forEach((item, i) => {
                gsap.fromTo(item,
                    { opacity: 0, x: -40 },
                    {
                        opacity: 1,
                        x: 0,
                        duration: 0.5,
                        ease: 'power2.out',
                        scrollTrigger: {
                            trigger: item,
                            start: 'top 80%',
                            toggleActions: 'play none none none',
                        },
                    }
                );
            });
        }

        // 2. Team cards — stagger cascade from bottom
        if (teamGridRef.current) {
            gsap.fromTo(
                teamGridRef.current.querySelectorAll('.st-team-card'),
                { opacity: 0, y: 50 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.5,
                    stagger: { amount: 0.6, from: 'start' },
                    ease: 'power2.out',
                    scrollTrigger: {
                        trigger: teamGridRef.current,
                        start: 'top 80%',
                        toggleActions: 'play none none none',
                    },
                }
            );
        }

        // 3. Values cards — scale in with a slight bounce
        if (valuesRef.current) {
            gsap.fromTo(
                valuesRef.current.querySelectorAll('.st-value-card'),
                { opacity: 0, scale: 0.85 },
                {
                    opacity: 1,
                    scale: 1,
                    duration: 0.5,
                    stagger: 0.12,
                    ease: 'back.out(1.4)',
                    scrollTrigger: {
                        trigger: valuesRef.current,
                        start: 'top 80%',
                        toggleActions: 'play none none none',
                    },
                }
            );
        }
    }, []);

    return (
        <div className="min-h-screen pt-24 pb-20">
            {/* Hero */}
            <section className="relative py-20 px-4 text-center overflow-hidden">
                <div className="absolute inset-0 bg-hero-gradient" />
                <LiquidBlob color="#ffffff" size={600} className="top-0 left-0 opacity-5" />
                <LiquidBlob color="#ffffff" size={400} delay={3} className="bottom-0 right-0 opacity-5" />
                <div className="relative z-10 max-w-4xl mx-auto flex flex-col justify-center">
                    <h1 className="text-5xl lg:text-6xl font-display font-bold text-white mb-8">
                        Built by Builders, <br /><span className="gradient-text">for Builders</span>
                    </h1>

                    <div className="relative h-32 sm:h-24">
                        <AnimatePresence mode="wait">
                            <motion.p
                                key={quoteIndex}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.6, ease: "easeInOut" }}
                                className="text-gray-400 text-lg leading-relaxed absolute inset-0 italic"
                            >
                                "{quotes[quoteIndex]}"
                            </motion.p>
                        </AnimatePresence>
                    </div>
                </div>
            </section>

            {/* Mission / Vision / Values */}
            <section className="max-w-7xl mx-auto px-4 py-16">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6" ref={valuesRef}>
                    {values.map((v, i) => (
                        <div key={v.title} className="st-value-card glassmorphism rounded-2xl border border-white/10 p-8 text-center">
                            <div className="text-4xl mb-6 flex justify-center text-brand-blue">{v.icon}</div>
                            <h3 className="font-display font-bold text-white text-xl mb-3">{v.title}</h3>
                            <p className="text-gray-400 text-sm leading-relaxed">{v.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Team */}
            <section className="max-w-7xl mx-auto px-4 py-16">
                <FadeInSection>
                    <div className="text-center mb-16">
                        <div className="inline-block px-4 py-1.5 rounded-full border border-white/30 bg-white/5 text-white text-sm font-medium mb-4">
                            The Team
                        </div>
                        <h2 className="text-4xl font-display font-bold text-white mb-4">
                            Meet the <span className="gradient-text">Minds</span>
                        </h2>
                        <p className="text-gray-400 max-w-2xl mx-auto">
                            A diverse team of passionate technologists, thinkers, and builders from around the world.
                        </p>
                    </div>
                </FadeInSection>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" ref={teamGridRef}>
                    {team.map((member, i) => (
                        <motion.div
                            key={member.id}
                            whileHover={{ y: -8, boxShadow: '0 20px 60px rgba(255,255,255,0.1)' }}
                            className="st-team-card glassmorphism rounded-2xl border border-white/20 p-6 text-center group transition-all duration-300"
                            >
                                <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-4xl text-brand-blue">
                                    <FiUser />
                                </div>
                                <h3 className="font-display font-bold text-white text-lg mb-1">{member.name}</h3>
                                <p className="text-white opacity-60 text-sm font-medium mb-3">{member.role}</p>
                                <p className="text-gray-400 text-xs leading-relaxed mb-4">{member.bio}</p>
                                <div className="flex justify-center gap-3">
                                    {Object.entries(member.social).map(([platform, url]) => (
                                        <a
                                            key={platform}
                                            href={url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:border-brand-blue transition-all"
                                            aria-label={platform}
                                        >
                                            <SocialIcon platform={platform} />
                                        </a>
                                    ))}
                                </div>
                            </motion.div>
                    ))}
                </div>
            </section>

            {/* Timeline */}
            <section className="max-w-4xl mx-auto px-4 py-16" ref={timelineRef}>
                <FadeInSection>
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-display font-bold text-white mb-4">
                            Our <span className="gradient-text">Journey</span>
                        </h2>
                    </div>
                </FadeInSection>
                <div className="relative">
                    {/* Animated line — scaleY driven by ScrollTrigger scrub */}
                    <div className="st-timeline-line absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-white/60 via-white/20 to-transparent" />
                    <div className="space-y-8">
                        {timeline.map((item, i) => (
                            <div key={item.id} className="st-timeline-item flex gap-6 pl-10 relative">
                                <div className="absolute left-0 w-12 h-12 rounded-xl bg-white flex items-center justify-center text-black font-bold text-xs font-mono flex-shrink-0 mt-1 shadow-[0_0_30px_rgba(255,255,255,0.4)]">
                                    PH {i + 1}
                                </div>
                                <div className="glassmorphism rounded-2xl border border-white/10 p-5 flex-1">
                                    <h3 className="font-display font-semibold text-white text-base mb-2">{item.title}</h3>
                                    <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
