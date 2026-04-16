import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FadeInSection from '../components/animations/FadeInSection';
import LiquidBlob from '../components/animations/LiquidBlob';
import { sanitizeInput, sanitizeLongText, sanitizeEmail } from '../security/sanitize';
import { checkRateLimit, recordCall, formatWaitTime } from '../security/rateLimit';
import { validateEmail, validateRequired } from '../utils/validators';
import { storage } from '../utils/storage';

const contactMethods = [
    { icon: '📧', title: 'Email Us', value: 'connect@bluecoderhub.com', href: 'mailto:connect@bluecoderhub.com', desc: 'For general enquiries and partnerships' },
    { icon: '💼', title: 'Work With Us', value: 'connect@bluecoderhub.com', href: 'mailto:connect@bluecoderhub.com', desc: 'For career and job opportunities' },
    { icon: '🐛', title: 'Support', value: 'connect@bluecoderhub.com', href: 'mailto:connect@bluecoderhub.com', desc: 'Technical support & bug reports' },
    { icon: '📍', title: 'Location', value: 'Chennai, Tamil Nadu, India', href: '#', desc: 'Remote-first team, global reach' },
];

const faqs = [
    { q: 'How long does it take to build a project?', a: 'Project timelines vary based on complexity. A simple website can take 2–4 weeks, while complex enterprise software may take 3–6 months. We provide a detailed timeline during our initial discovery call.' },
    { q: 'Do you work with startups?', a: 'Absolutely! We love working with startups. We offer flexible payment plans and have experience scaling products from 0 to launch. Many of our best clients started as early-stage startups.' },
    { q: 'What technologies do you use?', a: 'We specialize in React, Node.js, Python, React Native, and cloud platforms (AWS, GCP, Azure). We always recommend the best stack for your specific use case, not just what we\'re comfortable with.' },
    { q: 'Do you provide ongoing maintenance?', a: 'Yes! We offer monthly retainer packages for ongoing support, maintenance, security updates, and feature additions. Most clients sign a 6-month or 1-year retainer post-launch.' },
    { q: 'How does your pricing work?', a: 'We offer both fixed-price and time-and-materials models depending on the project scope. We\'re completely transparent about costs — no hidden charges. Contact us for a free quote.' },
];

export default function Contact() {
    const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', service: '', budget: '', message: '' });
    const [honeypot, setHoneypot] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [openFaq, setOpenFaq] = useState(null);
    const [formError, setFormError] = useState('');
    const [rateLimitMsg, setRateLimitMsg] = useState('');

    const services = ['Web Development', 'App Development', 'Software Development', 'UI/UX Design', 'AI Integration', 'Consulting', 'Other'];
    const budgets = ['< ₹50K', '₹50K – ₹2L', '₹2L – ₹10L', '₹10L – ₹50L', '₹50L+'];

    const handleSubmit = (e) => {
        e.preventDefault();
        setFormError('');
        setRateLimitMsg('');

        // Honeypot check — bots fill this, humans don't
        if (honeypot) return;

        // Rate limit: 1 submission per minute
        const { allowed, waitMs } = checkRateLimit('contact_form');
        if (!allowed) {
            setRateLimitMsg(`Please wait ${formatWaitTime(waitMs)} before submitting again.`);
            return;
        }

        // Validate required fields
        if (!validateRequired(form.name)) { setFormError('Please enter your name.'); return; }
        const cleanEmail = sanitizeEmail(form.email);
        if (!cleanEmail || !validateEmail(form.email)) { setFormError('Please enter a valid email address.'); return; }
        if (!validateRequired(form.service)) { setFormError('Please select a service.'); return; }
        if (!validateRequired(form.message)) { setFormError('Please describe your project.'); return; }

        // Sanitize all inputs before storage
        const cleanData = {
            name: sanitizeInput(form.name, 100),
            email: cleanEmail,
            phone: sanitizeInput(form.phone, 20),
            company: sanitizeInput(form.company, 100),
            service: sanitizeInput(form.service, 50),
            budget: sanitizeInput(form.budget, 20),
            message: sanitizeLongText(form.message),
        };

        storage.saveApplication({ ...cleanData, type: 'contact' });
        recordCall('contact_form');
        setSubmitted(true);
    };

    return (
        <div className="min-h-screen pt-24 pb-20">
            {/* Hero */}
            <section className="relative py-16 px-4 text-center overflow-hidden">
                <div className="absolute inset-0 bg-hero-gradient" />
                <LiquidBlob color="#ffffff" size={600} className="top-0 left-0 opacity-5" />
                <LiquidBlob color="#ffffff" size={400} delay={2} className="bottom-0 right-0 opacity-5" />
                <div className="relative z-10 max-w-2xl mx-auto">
                    <div className="inline-block px-4 py-1.5 rounded-full border border-white/20 bg-white/5 text-white/70 text-sm font-medium mb-5">
                        Let's Connect
                    </div>
                    <h1 className="text-5xl lg:text-6xl font-display font-bold text-white mb-4">
                        Start a <span className="gradient-text">Conversation</span>
                    </h1>
                    <p className="text-gray-400 text-lg">
                        Tell us about your project and we'll get back to you within 24 hours with a detailed quote.
                    </p>
                </div>
            </section>

            {/* Contact Cards */}
            <section className="max-w-6xl mx-auto px-4 py-10">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {contactMethods.map((m, i) => (
                        <FadeInSection key={m.title} delay={i * 0.08}>
                            <motion.a whileHover={{ y: -4 }} href={m.href}
                                className="glassmorphism rounded-2xl border border-white/10 p-5 group cursor-pointer block">
                                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">{m.icon}</div>
                                <div className="font-semibold text-white text-sm mb-1">{m.title}</div>
                                <div className="text-white opacity-60 text-xs mb-1 font-mono truncate">{m.value}</div>
                                <div className="text-gray-500 text-xs">{m.desc}</div>
                            </motion.a>
                        </FadeInSection>
                    ))}
                </div>
            </section>

            {/* Main Form */}
            <section className="max-w-6xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

                    {/* Left sidebar */}
                    <div className="lg:col-span-2">
                        <FadeInSection>
                            <div className="glassmorphism rounded-3xl border border-white/10 p-8 sticky top-28">
                                <h2 className="text-2xl font-display font-bold text-white mb-2">Let's Work Together</h2>
                                <p className="text-gray-400 text-sm leading-relaxed mb-8">
                                    We work with startups, growing companies, and enterprises to build digital products
                                    that make a difference. No project is too small or too ambitious.
                                </p>
                                <div className="space-y-5">
                                    {[
                                        { icon: '⚡', text: 'Response within 24 hours' },
                                        { icon: '💬', text: 'Free 30-min consultation call' },
                                        { icon: '📋', text: 'Detailed project proposal' },
                                        { icon: '🔐', text: 'NDA available on request' },
                                    ].map(s => (
                                        <div key={s.text} className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-sm flex-shrink-0">
                                                {s.icon}
                                            </div>
                                            <span className="text-gray-300 text-sm">{s.text}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="border-t border-white/5 mt-8 pt-6">
                                    <div className="text-xs text-gray-500 mb-3">Follow Us</div>
                                    <div className="flex gap-3">
                                        {[['🐦', 'https://twitter.com'], ['💼', 'https://linkedin.com'], ['🐙', 'https://github.com']].map(([icon, url]) => (
                                            <a key={url} href={url} target="_blank" rel="noopener noreferrer"
                                                className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-sm hover:border-white/50 hover:text-white transition-all">
                                                {icon}
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </FadeInSection>
                    </div>

                    {/* Right form */}
                    <div className="lg:col-span-3">
                        <FadeInSection direction="left">
                            {submitted ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="glassmorphism rounded-3xl border border-white/20 p-12 text-center"
                                    style={{ boxShadow: '0 0 60px rgba(255,255,255,0.05)' }}
                                >
                                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2 }} className="text-7xl mb-6">🎉</motion.div>
                                    <h3 className="text-2xl font-display font-bold text-white mb-3">Message Sent!</h3>
                                    <p className="text-gray-400 mb-6">Thank you for reaching out. Our team will review your project details and get back to you within 24 hours.</p>
                                    <button onClick={() => { setSubmitted(false); setForm({ name: '', email: '', phone: '', company: '', service: '', budget: '', message: '' }); }}
                                        className="px-6 py-3 rounded-xl text-sm font-semibold text-white border border-white hover:bg-white/10 transition-all">
                                        Send Another Message
                                    </button>
                                </motion.div>
                            ) : (
                                <form onSubmit={handleSubmit} className="glassmorphism rounded-3xl border border-white/10 p-8 space-y-5">
                                    <h2 className="text-2xl font-display font-bold text-white mb-2">Tell Us About Your Project</h2>
                                    {/* Honeypot — hidden from humans, filled by bots */}
                                    <input
                                        type="text"
                                        name="website"
                                        value={honeypot}
                                        onChange={e => setHoneypot(e.target.value)}
                                        className="hidden"
                                        tabIndex="-1"
                                        aria-hidden="true"
                                    />
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {[
                                            { key: 'name', label: 'Full Name *', placeholder: 'Your full name', type: 'text', required: true, max: 100 },
                                            { key: 'email', label: 'Email Address *', placeholder: 'your@email.com', type: 'email', required: true, max: 254 },
                                            { key: 'phone', label: 'Phone Number', placeholder: '+91 9876543210', type: 'tel', required: false, max: 20 },
                                            { key: 'company', label: 'Company / Startup', placeholder: 'Company name (optional)', type: 'text', required: false, max: 100 },
                                        ].map(({ key, label, placeholder, type, required, max }) => (
                                            <div key={key}>
                                                <label className="text-xs text-gray-400 mb-1 block">{label}</label>
                                                <input
                                                    type={type}
                                                    required={required}
                                                    value={form[key]}
                                                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                                                    placeholder={placeholder}
                                                    maxLength={max}
                                                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-white focus:bg-white/10 transition-all font-mono"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs text-gray-400 mb-1 block">Service Needed *</label>
                                            <select required value={form.service} onChange={e => setForm(f => ({ ...f, service: e.target.value }))}
                                                className="w-full px-4 py-2.5 rounded-xl bg-gray-900 border border-white/10 text-white text-sm focus:outline-none focus:border-white/50 transition-all">
                                                <option value="" className="bg-gray-900">Select a service</option>
                                                {services.map(s => <option key={s} value={s} className="bg-gray-900">{s}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-400 mb-1 block">Budget Range</label>
                                            <select value={form.budget} onChange={e => setForm(f => ({ ...f, budget: e.target.value }))}
                                                className="w-full px-4 py-2.5 rounded-xl bg-gray-900 border border-white/10 text-white text-sm focus:outline-none focus:border-white/50 transition-all">
                                                <option value="" className="bg-gray-900">Select budget range</option>
                                                {budgets.map(b => <option key={b} value={b} className="bg-gray-900">{b}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-400 mb-1 block">Project Details *</label>
                                        <textarea required value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                                            rows={5} placeholder="Describe your project, goals, and timeline..."
                                            maxLength={5000}
                                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-white focus:bg-white/10 transition-all resize-none font-mono" />
                                    </div>
                                    {formError && <p className="text-red-400 text-xs">{formError}</p>}
                                    {rateLimitMsg && <p className="text-yellow-500/80 text-xs">{rateLimitMsg}</p>}
                                    <button type="submit"
                                        className="w-full py-4 rounded-xl text-base font-bold text-black bg-white hover:bg-gray-200 transition-all">
                                        Send Project Inquiry →
                                    </button>
                                    <p className="text-xs text-gray-600 text-center">We respect your privacy. Your information is never shared with third parties.</p>
                                </form>
                            )}
                        </FadeInSection>
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="max-w-3xl mx-auto px-4 py-16">
                <FadeInSection>
                    <h2 className="text-3xl font-display font-bold text-white text-center mb-10">
                        Frequently Asked <span className="gradient-text">Questions</span>
                    </h2>
                </FadeInSection>
                <div className="space-y-3">
                    {faqs.map((faq, i) => (
                        <FadeInSection key={i} delay={i * 0.06}>
                            <div className="glassmorphism rounded-2xl border border-white/10 overflow-hidden">
                                <button
                                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                    className="w-full px-6 py-4 flex items-center justify-between text-left">
                                    <span className="font-medium text-white text-sm pr-4">{faq.q}</span>
                                    <motion.span animate={{ rotate: openFaq === i ? 180 : 0 }} className="text-gray-400 flex-shrink-0">▾</motion.span>
                                </button>
                                <AnimatePresence>
                                    {openFaq === i && (
                                        <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                                            <div className="px-6 pb-4 text-sm text-gray-400 leading-relaxed border-t border-white/5 pt-3">
                                                {faq.a}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </FadeInSection>
                    ))}
                </div>
            </section>
        </div>
    );
}
