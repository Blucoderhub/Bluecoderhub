import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import FadeInSection from '../components/animations/FadeInSection';
import { api } from '../utils/api';

function formatDate(value) {
    return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function BlogPostCard({ post }) {
    return (
        <FadeInSection>
            <Link
                to={`/blog/${post.slug || post.id}`}
                className="group block border-b border-white/5 py-12 hover:border-white/20 transition-all"
            >
                <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="text-xs font-mono uppercase tracking-widest text-brand-blue">{post.category}</span>
                            <span className="text-xs text-gray-500 font-mono">{formatDate(post.created_at)}</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4 group-hover:text-brand-blue transition-colors leading-tight">
                            {post.title}
                        </h2>
                        <p className="text-gray-400 text-lg leading-relaxed max-w-2xl">
                            {post.excerpt}
                        </p>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-bold text-white/40 group-hover:text-white transition-colors">
                        Read Article <span className="text-lg">-&gt;</span>
                    </div>
                </div>
            </Link>
        </FadeInSection>
    );
}

export function BlogPost() {
    const { postId } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        api.getBlog(postId)
            .then((data) => setPost(data.blog))
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [postId]);

    if (loading) return <div className="min-h-screen pt-32 text-center text-gray-400">Loading...</div>;
    if (error || !post) return (
        <div className="min-h-screen pt-32 text-center">
            <h1 className="text-white text-2xl font-display font-bold">{error || 'Post not found.'}</h1>
            <button onClick={() => navigate('/blog')} className="mt-6 px-6 py-2 rounded-xl bg-white text-black font-bold text-sm">Return to Blog</button>
        </div>
    );

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen pt-32 pb-20">
            <div className="max-w-3xl mx-auto px-6">
                <button onClick={() => navigate('/blog')} className="group flex items-center gap-2 text-gray-500 hover:text-white mb-12 transition-colors">
                    <span className="text-xl group-hover:-translate-x-1 transition-transform">&lt;-</span> Back to all posts
                </button>

                <header className="mb-16">
                    <div className="flex items-center gap-3 mb-6">
                        <span className="px-3 py-1 rounded-full border border-white/10 text-brand-blue text-xs font-mono uppercase tracking-widest">{post.category}</span>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-display font-bold text-white mb-8 leading-[1.1] tracking-tight">
                        {post.title}
                    </h1>
                    <div className="flex items-center gap-4 border-t border-white/5 pt-8">
                        <div className="w-10 h-10 rounded-full bg-brand-blue/20 flex items-center justify-center text-xl">A</div>
                        <div>
                            <div className="text-white font-bold">{post.author}</div>
                            <div className="text-gray-500 text-sm">{formatDate(post.created_at)}</div>
                        </div>
                    </div>
                </header>

                <article className="prose prose-invert prose-lg max-w-none">
                    <div className="text-gray-300 leading-relaxed space-y-8 whitespace-pre-wrap">
                        {post.content}
                    </div>
                </article>

                <footer className="mt-20 pt-10 border-t border-white/5 flex flex-wrap gap-3">
                    {post.tags?.map(tag => (
                        <span key={tag} className="text-xs font-mono text-gray-500">#{tag}</span>
                    ))}
                </footer>
            </div>
        </motion.div>
    );
}

export default function Blog() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        api.listBlogs()
            .then((data) => setPosts(data.blogs))
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="min-h-screen pt-32 pb-20">
            <div className="max-w-5xl mx-auto px-6">
                <header className="mb-20">
                    <h1 className="text-6xl md:text-8xl font-display font-bold text-white mb-8 tracking-tighter">
                        The <span className="text-brand-blue italic">Journal</span>
                    </h1>
                    <p className="text-gray-400 text-xl max-w-xl leading-relaxed">
                        Engineering notes, design decisions, and product thinking from Bluecoderhub.
                    </p>
                </header>

                {loading && <p className="text-gray-500">Loading posts...</p>}
                {error && <p className="text-red-400">{error}</p>}
                {!loading && !error && (
                    <div className="space-y-4">
                        {posts.length === 0 ? (
                            <div className="py-32 text-center border-y border-white/5">
                                <p className="text-gray-500 text-lg mb-6 italic">No published posts yet.</p>
                            </div>
                        ) : posts.map(post => (
                            <BlogPostCard key={post.id} post={post} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
