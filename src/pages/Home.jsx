import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TypeAnimation } from 'react-type-animation';
import CountUp from 'react-countup';
import { useInView } from 'react-intersection-observer';
import LiquidBlob from '../components/animations/LiquidBlob';
import ParticleSystem from '../components/animations/ParticleSystem';
import FadeInSection from '../components/animations/FadeInSection';
import Button from '../components/common/Button';
import { sanitizeURL } from '../security/sanitize';
import { gsap, ScrollTrigger, useGSAPContext } from '../hooks/useScrollTrigger';
import products from '../data/products.json';
import blog from '../data/blog.json';


const blogColors = ['from-white/5', 'from-white/10', 'from-gray-900/40'];

export default function Home() {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const heroBgRef = useRef(null);
    const heroTextRef = useRef(null);
    const productsSectionRef = useRef(null);
    const blogSectionRef = useRef(null);
    const ctaSectionRef = useRef(null);

    useEffect(() => {
        const handler = (e) => {
            setMousePos({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
        };
        window.addEventListener('mousemove', handler);
        return () => window.removeEventListener('mousemove', handler);
    }, []);

    // ── ScrollTrigger animations ──────────────────────────────────────────────
    useGSAPContext(() => {
        // 1. Hero background parallax — image moves at 40% of scroll speed
        if (heroBgRef.current) {
            gsap.to(heroBgRef.current, {
                yPercent: 40,
                ease: 'none',
                scrollTrigger: {
                    trigger: heroBgRef.current.parentElement,
                    start: 'top top',
                    end: 'bottom top',
                    scrub: true,
                },
            });
        }

        // 2. Hero text subtle upward drift as user scrolls away
        if (heroTextRef.current) {
            gsap.to(heroTextRef.current, {
                yPercent: -20,
                opacity: 0,
                ease: 'none',
                scrollTrigger: {
                    trigger: heroTextRef.current,
                    start: 'top top',
                    end: '60% top',
                    scrub: true,
                },
            });
        }

        // 3. Products section — cards stagger in with a smooth fade up
        if (productsSectionRef.current) {
            gsap.fromTo(
                productsSectionRef.current.querySelectorAll('.st-card'),
                { opacity: 0, y: 60 },
                {
                    opacity: 1,
                    y: 0,
                    rotateX: 0,
                    duration: 0.7,
                    stagger: 0.15,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: productsSectionRef.current,
                        start: 'top 75%',
                        toggleActions: 'play none none none',
                    },
                }
            );
        }

        // 4. Blog section — cards slide in from alternating sides
        if (blogSectionRef.current) {
            const cards = blogSectionRef.current.querySelectorAll('.st-blog-card');
            cards.forEach((card, i) => {
                gsap.fromTo(
                    card,
                    { opacity: 0, x: i % 2 === 0 ? -50 : 50 },
                    {
                        opacity: 1,
                        x: 0,
                        duration: 0.6,
                        ease: 'power2.out',
                        scrollTrigger: {
                            trigger: card,
                            start: 'top 85%',
                            toggleActions: 'play none none none',
                        },
                    }
                );
            });
        }

        // 5. CTA section — scale up from 92% + fade in
        if (ctaSectionRef.current) {
            gsap.fromTo(
                ctaSectionRef.current.querySelector('.st-cta-content'),
                { opacity: 0, scale: 0.92 },
                {
                    opacity: 1,
                    scale: 1,
                    duration: 0.8,
                    ease: 'power2.out',
                    scrollTrigger: {
                        trigger: ctaSectionRef.current,
                        start: 'top 80%',
                        toggleActions: 'play none none none',
                    },
                }
            );
        }
    }, []);

    return (
        <div className="min-h-screen">
            {/* ═══════════ HERO SECTION ═══════════ */}
            <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
                {/* Background Image Container */}
                <div className="absolute inset-0 z-0" ref={heroBgRef}>
                    <img
                        src="/src/assets/car-wireframe.jpg"
                        alt="Background"
                        className="w-full h-full object-cover object-right opacity-60 scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black" />
                </div>

                {/* Subtle Grid - kept for technical feel but reduced opacity */}
                <div className="absolute inset-0 opacity-[0.03] z-1"
                    style={{
                        backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                        backgroundSize: '80px 80px'
                    }}
                />

                {/* Hero Content */}
                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full" ref={heroTextRef}>
                    <div className="max-w-3xl">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                        >
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/[0.03] text-white/50 text-xs font-mono mb-8 backdrop-blur-sm"
                            >
                                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse shadow-[0_0_8px_#fff]" />
                                ECOSYSTEM FOR DIGITAL EVOLUTION
                            </motion.div>

                            <motion.h1
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4, duration: 0.8 }}
                                className="text-6xl sm:text-7xl lg:text-9xl font-display font-bold text-white mb-6 leading-[0.9] tracking-tighter"
                            >
                                SHAPING
                                <br />
                                <span className="gradient-text">THE FUTURE</span>
                                <br />
                                OF CODE
                            </motion.h1>

                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.8 }}
                                className="text-lg sm:text-xl text-white/40 font-mono mb-8 h-8 flex items-center gap-3"
                            >
                                <span className="w-8 h-[1px] bg-white/20" />
                                <TypeAnimation
                                    sequence={[
                                        'Engineering Digital Excellence.', 2000,
                                        'Innovation by Design.', 2000,
                                        'Scalable Software Ecosystems.', 2000,
                                    ]}
                                    repeat={Infinity}
                                    speed={60}
                                />
                            </motion.div>

                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1 }}
                                className="text-gray-400 text-lg max-w-xl mb-10 leading-relaxed font-light"
                            >
                                Bluecoderhub PVT LTD is the architectural force behind high-performance digital entities.
                                We don't just build applications; we engineer sustainable growth.
                            </motion.p>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1.1 }}
                                className="flex flex-col sm:flex-row gap-4"
                            >
                                <Button
                                    href="/products"
                                    size="lg"
                                    className="px-10"
                                >
                                    Get Started
                                </Button>
                                <Button
                                    href="/contact"
                                    size="lg"
                                    variant="secondary"
                                    className="px-10"
                                >
                                    Contact Sales
                                </Button>
                            </motion.div>
                        </motion.div>
                    </div>

                    {/* Scroll indicator - Moved to side for more professional look */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 2 }}
                        className="absolute bottom-10 right-8 hidden lg:block"
                    >
                        <div className="flex flex-col items-center gap-4">
                            <span className="text-[10px] font-mono text-white/20 uppercase tracking-[0.3em] vertical-text">Scroll Down</span>
                            <motion.div
                                animate={{ y: [0, 10, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                                className="w-[1px] h-20 bg-gradient-to-b from-white/40 to-transparent"
                            />
                        </div>
                    </motion.div>
                </div>
            </section>


            {/* ═══════════ FEATURED PRODUCTS ═══════════ */}
            <section className="section-padding max-w-7xl mx-auto px-4" ref={productsSectionRef}>
                <FadeInSection>
                    <div className="text-center mb-16">
                        <div className="inline-block px-4 py-1.5 rounded-full border border-white/20 bg-white/5 text-white/70 text-sm font-medium mb-4">
                            Our Products
                        </div>
                        <h2 className="text-4xl lg:text-5xl font-display font-bold text-white mb-4">
                            Products That <span className="gradient-text">Empower</span>
                        </h2>
                        <p className="text-gray-400 max-w-2xl mx-auto">
                            We build products that solve real problems at scale. Explore our growing suite of digital tools.
                        </p>
                    </div>
                </FadeInSection>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product, i) => (
                        <div key={product.id} className="st-card">
                            <motion.div
                                className="relative group glassmorphism rounded-2xl border border-white/10 p-6 cursor-pointer h-full"
                                style={{
                                    background: product.status === 'live'
                                        ? 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(0,0,0,1) 100%)'
                                        : product.status === 'coming-soon'
                                            ? 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(0,0,0,1) 100%)'
                                            : '#000000'
                                }}
                            >
                                {product.status === 'coming-soon' && (
                                    <div className="absolute top-4 right-4 px-3 py-1 bg-white/10 border border-white/20 rounded-full text-white/60 text-xs font-bold">
                                        COMING SOON
                                    </div>
                                )}
                                {product.status === 'planned' && (
                                    <div className="absolute top-4 right-4 px-3 py-1 bg-white/5 border border-white/20 rounded-full text-gray-400 text-xs font-bold">
                                        PLANNED
                                    </div>
                                )}

                                <div className="text-4xl mb-4">{product.icon}</div>
                                {product.status === 'live' && sanitizeURL(product.url) ? (
                                    <a href={sanitizeURL(product.url)} target="_blank" rel="noopener noreferrer">
                                        <h3 className="font-display font-bold text-white text-xl mb-2 hover:text-white/80 transition-colors inline-block">{product.name}</h3>
                                    </a>
                                ) : (
                                    <h3 className="font-display font-bold text-white text-xl mb-2">{product.name}</h3>
                                )}
                                <p className="text-white opacity-60 text-sm font-medium mb-3">{product.tagline}</p>
                                <p className="text-gray-400 text-sm leading-relaxed mb-4">{product.description}</p>

                                {product.progress && (
                                    <div className="mb-4">
                                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                                            <span>Development Progress</span>
                                            <span>{product.progress}%</span>
                                        </div>
                                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                whileInView={{ width: `${product.progress}%` }}
                                                transition={{ duration: 1.5, ease: 'easeOut' }}
                                                className="h-full bg-white rounded-full shadow-[0_0_10px_#ffffff]"
                                            />
                                        </div>
                                    </div>
                                )}

                                <ul className="space-y-1 mb-6">
                                    {product.features.slice(0, 3).map(f => (
                                        <li key={f} className="flex items-center gap-2 text-xs text-gray-400">
                                            <span className="text-white opacity-40">✓</span> {f}
                                        </li>
                                    ))}
                                </ul>

                                {product.status === 'live' && sanitizeURL(product.url) ? (
                                    <a
                                        href={sanitizeURL(product.url)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 text-sm font-semibold text-white hover:text-gray-400 transition-colors group-hover:gap-3"
                                    >
                                        Visit Platform →
                                    </a>
                                ) : product.status === 'coming-soon' ? (
                                    <Link to="/products" className="inline-flex items-center gap-2 text-sm font-semibold text-white/70 hover:text-white transition-colors">
                                        Notify Me →
                                    </Link>
                                ) : (
                                    <span className="text-sm text-gray-500">In Planning</span>
                                )}
                            </motion.div>
                        </div>
                    ))}
                </div>
            </section>


            {/* ═══════════ BLOG PREVIEW ═══════════ */}
            <section className="section-padding max-w-7xl mx-auto px-4" ref={blogSectionRef}>
                <FadeInSection>
                    <div className="flex items-center justify-between mb-16">
                        <div>
                            <div className="inline-block px-4 py-1.5 rounded-full border border-white/20 bg-white/5 text-white/70 text-sm font-medium mb-4">
                                Latest Insights
                            </div>
                            <h2 className="text-4xl font-display font-bold text-white">
                                From Our <span className="gradient-text">Blog</span>
                            </h2>
                        </div>
                        <Link to="/blog" className="text-white hover:text-gray-400 text-sm font-semibold transition-colors hidden md:block">
                            View All Posts →
                        </Link>
                    </div>
                </FadeInSection>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {blog.slice(0, 3).map((post, i) => (
                        <motion.div
                            key={post.id}
                            whileHover={{ y: -6 }}
                            className="st-blog-card group glassmorphism rounded-2xl border border-white/10 overflow-hidden"
                            >
                                <div className={`h-48 bg-gradient-to-br ${blogColors[i % blogColors.length]} to-transparent relative overflow-hidden`}>
                                    <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-30">
                                        {post.category === 'Technology' ? '🤖' : post.category === 'Engineering' ? '⚙️' : post.category === 'Design' ? '🎨' : '📱'}
                                    </div>
                                    <div className="absolute top-3 left-3">
                                        <span className="px-2 py-1 bg-black/40 backdrop-blur-sm rounded-full text-xs text-white opacity-70 border border-white/20">
                                            {post.category}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-5">
                                    <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                                        <span>{post.author}</span>
                                        <span>•</span>
                                        <span>{post.readTime} read</span>
                                        <span>•</span>
                                        <span>{new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                    </div>
                                    <h3 className="font-display font-semibold text-white mb-2 group-hover:text-white transition-colors line-clamp-2 text-sm">
                                        {post.title}
                                    </h3>
                                    <p className="text-gray-400 text-xs leading-relaxed line-clamp-2 mb-4">{post.excerpt}</p>
                                    <Link to={`/blog/${post.id}`} className="text-xs font-semibold text-white/70 hover:text-white transition-colors">
                                        Read Article →
                                    </Link>
                                </div>
                            </motion.div>
                    ))}
                </div>
            </section>

            {/* ═══════════ CTA SECTION ═══════════ */}
            <section className="section-padding relative overflow-hidden border-t border-white/10" ref={ctaSectionRef}>
                <div className="absolute inset-0 bg-black" />
                <LiquidBlob color="#ffffff" size={600} className="top-0 left-1/2 -translate-x-1/2 opacity-5" />
                <div className="relative z-10 max-w-3xl mx-auto px-4 text-center st-cta-content">
                        <h2 className="text-4xl sm:text-5xl font-display font-bold text-white mb-6">
                            Ready to Build Something <span className="gradient-text">Amazing?</span>
                        </h2>
                        <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                            Let's turn your vision into reality. Our team of experts is ready to help you build
                            the next generation of digital products.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button href="/contact" size="xl" className="font-bold">
                                Get a Free Quote →
                            </Button>
                            <Button href="/careers" size="xl" variant="secondary">
                                Join Our Team
                            </Button>
                        </div>
                </div>
            </section>
        </div>
    );
}
