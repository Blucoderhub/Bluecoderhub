import { useState, useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import FadeInSection from '../components/animations/FadeInSection';
import LiquidBlob from '../components/animations/LiquidBlob';
import blog from '../data/blog.json';
import { storage } from '../utils/storage';

const allPosts = [...blog, ...(storage.getBlogPosts() || [])].sort((a, b) => new Date(b.date) - new Date(a.date));

const categories = ['All', 'Technology', 'Engineering', 'Design', 'Mobile', 'Company', 'Security'];
const categoryIcons = { Technology: '🤖', Engineering: '⚙️', Design: '🎨', Mobile: '📱', Company: '🏢', Security: '🔒' };
const cardGradients = [
    'from-white/5', 'from-white/10', 'from-gray-900/40',
    'from-gray-800/40', 'from-[#000000]', 'from-[#111111]'
];

function BlogCard({ post, index }) {
    return (
        <FadeInSection delay={index * 0.08}>
            <motion.article
                whileHover={{ y: -6 }}
                className="group glassmorphism rounded-2xl border border-white/10 overflow-hidden h-full flex flex-col"
            >
                <div className={`h-44 bg-gradient-to-br ${cardGradients[index % cardGradients.length]} to-transparent flex items-center justify-center text-7xl opacity-80 relative overflow-hidden`}>
                    <span className="opacity-30">{categoryIcons[post.category] || '📄'}</span>
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                        <span className="px-2 py-1 bg-black/50 backdrop-blur-sm rounded-full text-xs text-white opacity-70 border border-white/20">{post.category}</span>
                    </div>
                    <div className="absolute top-3 right-3 text-xs text-gray-400 bg-black/40 rounded px-2 py-1">{post.readTime} read</div>
                </div>
                <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                        <span>{post.author}</span>
                        <span>•</span>
                        <span>{new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <h2 className="font-display font-semibold text-white mb-2 group-hover:text-gray-300 transition-colors line-clamp-2 flex-1">
                        {post.title}
                    </h2>
                    <p className="text-gray-400 text-xs leading-relaxed line-clamp-2 mb-4">{post.excerpt}</p>
                    <div className="flex items-center justify-between">
                        <div className="flex gap-1.5 flex-wrap">
                            {post.tags.slice(0, 2).map(t => (
                                <span key={t} className="px-2 py-0.5 rounded-md bg-white/10 text-white opacity-60 text-xs">{t}</span>
                            ))}
                        </div>
                        <Link to={`/blog/${post.id}`} className="text-xs font-semibold text-white opacity-80 hover:opacity-100 transition-colors">
                            Read →
                        </Link>
                    </div>
                </div>
            </motion.article>
        </FadeInSection>
    );
}

export function BlogPost() {
    const { postId } = useParams();
    const navigate = useNavigate();
    const post = allPosts.find(p => p.id === postId);

    if (!post) return (
        <div className="min-h-screen pt-32 text-center text-gray-400">
            <p>Post not found.</p>
            <button onClick={() => navigate('/blog')} className="mt-4 text-white hover:text-gray-400 font-medium">← Back to Blog</button>
        </div>
    );

    const related = allPosts.filter(p => p.id !== post.id && p.category === post.category).slice(0, 3);

    return (
        <div className="min-h-screen pt-28 pb-20">
            <div className="max-w-3xl mx-auto px-4">
                <button onClick={() => navigate('/blog')} className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-8 transition-colors">
                    ← Back to Blog
                </button>
                <div className="mb-4">
                    <span className="px-3 py-1 rounded-full border border-white/20 bg-white/5 text-white opacity-70 text-xs">{post.category}</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-display font-bold text-white mb-4 leading-tight">{post.title}</h1>
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                    <span className="font-medium text-gray-300">{post.author}</span>
                    <span>•</span>
                    <span>{new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                    <span>•</span>
                    <span>{post.readTime} read</span>
                </div>
                <div className="flex gap-2 mb-10">
                    {post.tags.map(t => (
                        <span key={t} className="px-2 py-0.5 rounded-md bg-white/10 text-white opacity-60 text-xs">{t}</span>
                    ))}
                </div>

                <div className="glassmorphism rounded-2xl border border-white/10 p-8 mb-12 prose prose-invert max-w-none">
                    <p className="text-gray-300 text-base leading-relaxed">{post.excerpt}</p>
                    <br />
                    <p className="text-gray-400 leading-relaxed">{post.content || 'Full article content coming soon. This is an excerpt preview of the article that will be available in the complete version.'}</p>
                    <br />
                    <p className="text-gray-400 leading-relaxed">
                        At Bluecoderhub, we constantly strive to share our knowledge and insights with the developer community.
                        Follow us on social media for more updates and stay tuned for the complete version of this article.
                    </p>
                </div>

                {related.length > 0 && (
                    <div>
                        <h3 className="font-display font-semibold text-white text-xl mb-6">Related Articles</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {related.map((p, i) => <BlogCard key={p.id} post={p} index={i} />)}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function Blog() {
    const [category, setCategory] = useState('All');
    const [search, setSearch] = useState('');

    const filtered = useMemo(() => allPosts.filter(p => {
        const matchCat = category === 'All' || p.category === category;
        const q = search.toLowerCase();
        return matchCat && (!q || p.title.toLowerCase().includes(q) || p.tags.some(t => t.toLowerCase().includes(q)));
    }), [category, search]);

    return (
        <div className="min-h-screen pt-24 pb-20">
            {/* Hero */}
            <section className="relative py-16 px-4 text-center overflow-hidden">
                <div className="absolute inset-0 bg-hero-gradient" />
                <LiquidBlob color="#ffffff" size={500} className="top-0 right-0 opacity-5" />
                <div className="relative z-10 max-w-2xl mx-auto">
                    <div className="inline-block px-4 py-1.5 rounded-full border border-white/20 bg-white/5 text-white opacity-80 text-sm font-medium mb-4">
                        Tech Insights
                    </div>
                    <h1 className="text-5xl font-display font-bold text-white mb-4">
                        The <span className="gradient-text">Blog</span>
                    </h1>
                    <p className="text-gray-400">Thoughts on software, design, and the future of digital products.</p>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-4 py-12">
                {/* Filters + Search */}
                <div className="flex flex-col sm:flex-row gap-4 mb-10">
                    <div className="flex gap-2 flex-wrap">
                        {categories.map(c => (
                            <button key={c} onClick={() => setCategory(c)}
                                className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-all ${category === c ? 'bg-white text-black font-bold' : 'bg-white/5 text-gray-400 hover:text-white border border-white/10 hover:bg-white/10'}`}>
                                {c}
                            </button>
                        ))}
                    </div>
                    <div className="relative ml-auto">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">🔍</span>
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search articles..."
                            className="pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-white focus:bg-white/10 w-56 transition-all" />
                    </div>
                </div>

                {filtered.length === 0 ? (
                    <div className="text-center py-20 text-gray-500">No articles found.</div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filtered.map((post, i) => <BlogCard key={post.id} post={post} index={i} />)}
                    </div>
                )}
            </div>
        </div>
    );
}
