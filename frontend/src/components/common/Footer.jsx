import { Link } from 'react-router-dom';
import { sanitizeURL } from '../../security/sanitize';
import { api } from '../../utils/api';

const footerLinks = {
    Company: [
        { label: 'About Us', path: '/about' },
        { label: 'Careers', path: '/careers' },
        { label: 'Blog', path: '/blog' },
    ],
    Product: [
        { label: 'Bluelearnerhub', external: 'https://bluelearnerhub.com' },
    ],
};
import Logo from './Logo';

export default function Footer() {
    const handleSubscribe = async (event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        try {
            await api.subscribe(String(form.get('email') || ''), 'footer');
            event.currentTarget.reset();
            alert('Subscribed.');
        } catch (err) {
            alert(err.message || 'Subscription failed.');
        }
    };

    return (
        <footer className="bg-brand-gray-900 border-t border-white/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

                {/* Top: Logo + Description */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 mb-12">
                    <div className="lg:col-span-1">
                        <Link to="/" className="flex items-center gap-3 mb-4">
                            <Logo className="w-10 h-10" />
                            <div>
                                <span className="font-display font-bold text-lg text-white">
                                    Blue<span>coderhub</span>
                                </span>
                                <div className="text-xs text-gray-500 font-mono">PVT LTD</div>
                            </div>
                        </Link>
                        <p className="text-gray-400 text-sm leading-relaxed mb-6">
                            The strategic parent company powering a global ecosystem of innovation,
                            including our flagship subsidiary, <a href="https://bluelearnerhub.com" target="_blank" rel="noopener noreferrer" className="text-white hover:underline underline-offset-4 decoration-white/20">Bluelearnerhub</a>.
                        </p>
                        <div className="flex gap-3">
                            {/* Social links removed */}
                        </div>
                    </div>

                    {/* Nav Links */}
                    {Object.entries(footerLinks).map(([category, links]) => (
                        <div key={category}>
                            <h3 className="text-white font-semibold font-display mb-4 text-sm tracking-wider uppercase">
                                {category}
                            </h3>
                            <ul className="space-y-2">
                                {links.map(link => (
                                    <li key={link.label}>
                                        {link.external && sanitizeURL(link.external) ? (
                                            <a
                                                href={sanitizeURL(link.external)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-gray-400 hover:text-white text-sm transition-colors duration-200"
                                            >
                                                {link.label} ↗
                                            </a>
                                        ) : link.external ? null : (
                                            <Link
                                                to={link.path}
                                                className="text-gray-400 hover:text-white text-sm transition-colors duration-200"
                                            >
                                                {link.label}
                                            </Link>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Newsletter */}
                <div className="glassmorphism rounded-2xl p-6 mb-12 flex flex-col sm:flex-row items-center justify-between gap-4 border border-white/10 bg-white/5 shadow-[0_0_40px_rgba(255,255,255,0.05)]">
                    <div>
                        <h3 className="font-display font-semibold text-white mb-1">Stay in the loop</h3>
                        <p className="text-gray-400 text-sm">Get the latest updates on our products and tech insights.</p>
                    </div>
                    <form className="flex gap-2 w-full sm:w-auto" onSubmit={handleSubscribe}>
                        <input
                            name="email"
                            type="email"
                            placeholder="your@email.com"
                            required
                            className="flex-1 sm:w-64 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-white/50 transition-all"
                        />
                        <button
                            type="submit"
                            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-black bg-white whitespace-nowrap hover:bg-gray-100 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                        >
                            Subscribe
                        </button>
                    </form>
                </div>

                {/* Bottom bar */}
                <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-gray-500 text-sm">
                        © {new Date().getFullYear()} Bluecoderhub PVT LTD. All rights reserved.
                    </p>
                    <div className="flex gap-6 text-sm">
                        <Link to="/privacy" className="text-gray-500 hover:text-gray-300 transition-colors">Privacy Policy</Link>
                        <Link to="/terms" className="text-gray-500 hover:text-gray-300 transition-colors">Terms of Service</Link>
                        <Link to="/cookies" className="text-gray-500 hover:text-gray-300 transition-colors">Cookie Policy</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
