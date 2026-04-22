import { useEffect, useState, memo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import FadeInSection from '../components/animations/FadeInSection';
import { api } from '../utils/api';
import { sanitizeBlogContent } from '../utils/sanitize';
import blogData from '../data/blog.json';

function formatDate(value) {
    return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/**
 * A simple "Mini-Markdown" renderer to handle headers and paragraphs
 * without needing an external dependency or bypassing security sanitizers.
 */
const BlogContentRenderer = ({ content }) => {
    if (!content) return null;
    
    // Split by double newline for paragraphs
    const blocks = content.split('\n\n');
    
    return (
        <div className="space-y-8">
            {blocks.map((block, i) => {
                // Check for headers (e.g., ### Header)
                if (block.startsWith('### ')) {
                    return (
                        <h3 key={i} className="text-3xl font-display font-bold text-white mt-12 mb-6">
                            {block.replace('### ', '')}
                        </h3>
                    );
                }
                if (block.startsWith('## ')) {
                    return (
                        <h2 key={i} className="text-4xl font-display font-bold text-white mt-16 mb-8">
                            {block.replace('## ', '')}
                        </h2>
                    );
                }
                // Regular paragraph
                return (
                    <p key={i} className="text-gray-300 leading-relaxed font-light text-xl">
                        {block}
                    </p>
                );
            })}
        </div>
    );
};

const PostCard = memo(({ post, index }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.1 }}
    >
        <Link
            to={`/blog/${post.slug || post.id}`}
            className="group block relative h-full glassmorphism p-8 rounded-3xl border border-white/5 hover:border-blue-500/30 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(59,130,246,0.1)] overflow-hidden"
        >
            {/* Background Glow */}
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-500/5 blur-[80px] group-hover:bg-blue-500/10 transition-colors" />
            
            <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center justify-between mb-6">
                    <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-mono uppercase tracking-widest">
                        {post.category}
                    </span>
                    <span className="text-[10px] text-gray-500 font-mono">
                        {formatDate(post.created_at)}
                    </span>
                </div>
                
                <h3 className="text-2xl font-display font-bold text-white mb-4 group-hover:text-blue-400 transition-colors line-clamp-2">
                    {post.title}
                </h3>
                
                <p className="text-gray-400 text-sm leading-relaxed mb-8 line-clamp-3">
                    {post.excerpt}
                </p>
                
                <div className="mt-auto flex items-center justify-between pt-6 border-t border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs font-bold text-white">
                            {post.author?.[0] || 'A'}
                        </div>
                        <span className="text-xs text-gray-300 font-medium">{post.author}</span>
                    </div>
                    <span className="text-blue-400 group-hover:translate-x-1 transition-transform">
                        →
                    </span>
                </div>
            </div>
        </Link>
    </motion.div>
));

PostCard.displayName = 'PostCard';

export function BlogPost() {
    const { postId } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        setLoading(true);
        // Try API first
        api.getBlog(postId)
            .then((data) => {
                if (data.blog) setPost(data.blog);
                else throw new Error('Not found');
            })
            .catch(() => {
                // Fallback to local data
                const localPost = blogData.find(p => p.id === postId || p.slug === postId);
                if (localPost) setPost(localPost);
                else setError('Post not found.');
            })
            .finally(() => setLoading(false));
    }, [postId]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-black">
            <div className="w-12 h-12 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
        </div>
    );

    if (error || !post) return (
        <div className="min-h-screen flex items-center justify-center bg-black px-6">
            <div className="text-center">
                <h1 className="text-4xl font-display font-bold text-white mb-6">{error || 'Post not found.'}</h1>
                <button 
                    onClick={() => navigate('/blog')} 
                    className="px-8 py-3 rounded-xl bg-white text-black font-bold text-sm hover:bg-gray-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                >
                    Return to Journal
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-black text-white selection:bg-blue-500/30">
            {/* Hero Section */}
            <div className="relative pt-40 pb-20 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[500px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />
                
                <div className="max-w-4xl mx-auto px-6 relative z-10">
                    <motion.button 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        onClick={() => navigate('/blog')} 
                        className="group flex items-center gap-2 text-gray-500 hover:text-white mb-12 transition-colors font-mono text-xs uppercase tracking-widest"
                    >
                        <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Journal
                    </motion.button>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="flex items-center gap-4 mb-8">
                            <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono uppercase tracking-widest">
                                {post.category}
                            </span>
                            <span className="h-px w-8 bg-white/10" />
                            <span className="text-gray-500 text-xs font-mono">{formatDate(post.created_at)}</span>
                        </div>
                        
                        <h1 className="text-5xl md:text-7xl font-display font-bold text-white mb-10 leading-[1.1] tracking-tight">
                            {post.title}
                        </h1>

                        <div className="flex items-center gap-4 py-8 border-y border-white/5">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-lg font-bold">
                                {post.author?.[0]}
                            </div>
                            <div>
                                <div className="text-white font-bold">{post.author}</div>
                                <div className="text-gray-500 text-xs uppercase tracking-wider">Author</div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Content Section */}
            <div className="max-w-4xl mx-auto px-6 pb-32">
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <BlogContentRenderer content={post.content} />
                </motion.div>

                {post.tags && (
                    <motion.footer 
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        className="mt-24 pt-10 border-t border-white/5 flex flex-wrap gap-4"
                    >
                        {post.tags.map(tag => (
                            <span key={tag} className="px-4 py-2 rounded-lg bg-white/5 text-xs font-mono text-gray-500 hover:text-blue-400 transition-colors">
                                #{tag}
                            </span>
                        ))}
                    </motion.footer>
                )}
            </div>
        </div>
    );
}

export default function Blog() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        setLoading(true);
        // Try API first
        api.listBlogs()
            .then((data) => {
                if (data.blogs && data.blogs.length > 0) {
                    setPosts(data.blogs);
                } else {
                    setPosts(blogData);
                }
            })
            .catch(() => {
                setPosts(blogData);
            })
            .finally(() => setLoading(false));
    }, []);

    const featuredPost = posts[0];
    const remainingPosts = posts.slice(1);

    return (
        <div className="min-h-screen bg-black pt-24 lg:pt-32 pb-32 overflow-hidden relative">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-full lg:w-[800px] h-[600px] lg:h-[800px] bg-blue-500/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-full lg:w-[600px] h-[600px] bg-blue-600/5 blur-[100px] rounded-full translate-y-1/3 -translate-x-1/4 pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <header className="mb-16 lg:mb-24 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <span className="text-blue-400 font-mono text-[10px] sm:text-xs uppercase tracking-[0.3em] mb-6 block">Our Insights</span>
                        <h1 className="text-5xl sm:text-7xl md:text-9xl font-display font-bold text-white mb-8 tracking-tighter">
                            The <span className="italic text-gray-500">Journal.</span>
                        </h1>
                        <p className="text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed font-light">
                            Perspectives on the intersection of engineering, design, and business from the team at Bluecoderhub.
                        </p>
                    </motion.div>
                </header>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-10 h-10 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                    </div>
                ) : (
                    <div className="space-y-16 lg:space-y-32">
                        {/* Featured Post */}
                        {featuredPost && (
                            <FadeInSection>
                                <Link 
                                    to={`/blog/${featuredPost.slug || featuredPost.id}`}
                                    className="group block relative rounded-[30px] lg:rounded-[40px] overflow-hidden border border-white/5 hover:border-blue-500/30 transition-all duration-700"
                                >
                                    <div className="grid lg:grid-cols-2 min-h-[400px] lg:min-h-[500px]">
                                        <div className="relative bg-white/5 overflow-hidden min-h-[200px] lg:min-h-0">
                                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 opacity-20 group-hover:scale-110 transition-transform duration-700" />
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <span className="text-7xl lg:text-9xl font-display font-bold text-white/5 uppercase">Focus</span>
                                            </div>
                                        </div>
                                        <div className="p-8 lg:p-20 flex flex-col justify-center glassmorphism border-0">
                                            <div className="flex items-center gap-4 mb-6 lg:mb-8">
                                                <span className="px-3 lg:px-4 py-1 lg:py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] lg:text-xs font-mono uppercase tracking-widest">
                                                    Featured
                                                </span>
                                                <span className="text-[10px] lg:text-xs text-gray-500 font-mono">{formatDate(featuredPost.created_at)}</span>
                                            </div>
                                            <h2 className="text-2xl sm:text-3xl lg:text-5xl font-display font-bold text-white mb-4 lg:mb-6 group-hover:text-blue-400 transition-colors leading-tight">
                                                {featuredPost.title}
                                            </h2>
                                            <p className="text-sm lg:text-lg text-gray-400 leading-relaxed mb-8 lg:mb-10 line-clamp-3 lg:line-clamp-none">
                                                {featuredPost.excerpt}
                                            </p>
                                            <div className="flex items-center gap-4 text-white font-bold text-sm lg:text-base">
                                                Read Article <span className="group-hover:translate-x-2 transition-transform duration-300">→</span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </FadeInSection>
                        )}

                        {/* Recent Posts Grid */}
                        {remainingPosts.length > 0 && (
                            <section>
                                <div className="flex items-end justify-between mb-10 lg:mb-16 px-2">
                                    <div>
                                        <h3 className="text-2xl lg:text-3xl font-display font-bold text-white mb-2">Recent Thinking</h3>
                                        <div className="h-1 w-10 lg:w-12 bg-blue-500 rounded-full" />
                                    </div>
                                </div>
                                
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                                    {remainingPosts.map((post, index) => (
                                        <PostCard key={post.id} post={post} index={index} />
                                    ))}
                                </div>
                            </section>
                        )}

                        {posts.length === 0 && !error && (
                            <div className="py-32 text-center border border-white/5 rounded-[40px] glassmorphism">
                                <p className="text-gray-500 text-xl font-light italic">The ink is still drying. Check back soon.</p>
                            </div>
                        )}
                    </div>
                )}
                
                {error && (
                    <div className="py-20 text-center">
                        <p className="text-red-400/60 font-mono text-sm">{error}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
