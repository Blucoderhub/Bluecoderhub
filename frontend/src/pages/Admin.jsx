import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { api, clearAuthToken, getAuthToken, setAuthToken } from '../utils/api';

const emptyBlog = {
    title: '',
    slug: '',
    category: 'Technology',
    author: 'Bluecoderhub',
    excerpt: '',
    content: '',
    tags: '',
    published: true
};

function LoginScreen({ onLogin }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const submit = async (event) => {
        event.preventDefault();
        setError('');
        setLoading(true);
        try {
            const data = await api.login(email, password);
            setAuthToken(data.token);
            onLogin(data.user);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
            setPassword('');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-hero-gradient px-4">
            <form onSubmit={submit} className="w-full max-w-sm glassmorphism rounded-2xl border border-white/10 p-8 space-y-4">
                <div>
                    <h1 className="text-2xl font-display font-bold text-white">Admin Login</h1>
                    <p className="text-sm text-gray-500 mt-1">Server-side authentication required.</p>
                </div>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@example.com"
                    autoComplete="username"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm"
                />
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    autoComplete="current-password"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm"
                />
                {error && <p className="text-sm text-red-400">{error}</p>}
                <button disabled={loading} className="w-full py-3 rounded-xl text-sm font-bold text-black bg-white disabled:opacity-50">
                    {loading ? 'Signing in...' : 'Sign in'}
                </button>
            </form>
        </div>
    );
}

function BlogManager() {
    const [blogs, setBlogs] = useState([]);
    const [form, setForm] = useState(emptyBlog);
    const [editingId, setEditingId] = useState(null);
    const [error, setError] = useState('');
    const [saved, setSaved] = useState('');

    const load = useCallback(async () => {
        const data = await api.listAdminBlogs();
        setBlogs(data.blogs);
    }, []);

    useEffect(() => {
        load().catch((err) => setError(err.message));
    }, [load]);

    const submit = async (event) => {
        event.preventDefault();
        setError('');
        const payload = {
            ...form,
            tags: form.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
            published: Boolean(form.published)
        };
        try {
            if (editingId) await api.updateBlog(editingId, payload);
            else await api.createBlog(payload);
            setForm(emptyBlog);
            setEditingId(null);
            setSaved('Blog saved.');
            await load();
        } catch (err) {
            setError(err.message);
        }
    };

    const edit = (blog) => {
        setEditingId(blog.id);
        setForm({
            title: blog.title,
            slug: blog.slug,
            category: blog.category,
            author: blog.author,
            excerpt: blog.excerpt,
            content: blog.content,
            tags: (blog.tags || []).join(', '),
            published: blog.published
        });
    };

    const remove = async (id) => {
        if (!window.confirm('Delete this blog post?')) return;
        await api.deleteBlog(id);
        await load();
    };

    return (
        <div className="space-y-8">
            <form onSubmit={submit} className="glassmorphism rounded-2xl border border-white/10 p-6 space-y-4">
                <div className="flex items-center justify-between gap-4">
                    <h2 className="text-xl font-display font-bold text-white">{editingId ? 'Edit Blog' : 'Create Blog'}</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                    <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Title" required className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm" />
                    <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="Slug (optional)" className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm" />
                    <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Category" required className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm" />
                    <input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} placeholder="Author" required className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm" />
                </div>
                <textarea value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} placeholder="Excerpt" rows={2} required className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm" />
                <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Content" rows={8} required className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm" />
                <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="Tags, comma separated" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm" />
                <label className="flex items-center gap-2 text-sm text-gray-300">
                    <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} />
                    Published
                </label>
                {error && <p className="text-sm text-red-400">{error}</p>}
                {saved && <p className="text-sm text-green-400">{saved}</p>}
                <div className="flex gap-3">
                    <button className="px-6 py-3 rounded-xl text-sm font-bold text-black bg-white">Save</button>
                    {editingId && <button type="button" onClick={() => { setEditingId(null); setForm(emptyBlog); }} className="px-6 py-3 rounded-xl text-sm text-gray-300 border border-white/10">Cancel</button>}
                </div>
            </form>

            <div className="space-y-3">
                {blogs.map((blog) => (
                    <div key={blog.id} className="glassmorphism rounded-xl border border-white/10 p-4 flex items-center justify-between gap-4">
                        <div>
                            <div className="font-semibold text-white">{blog.title}</div>
                            <div className="text-xs text-gray-500">{blog.slug} - {blog.published ? 'Published' : 'Draft'}</div>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => edit(blog)} className="px-3 py-2 rounded-lg text-sm text-white border border-white/10">Edit</button>
                            <button onClick={() => remove(blog.id)} className="px-3 py-2 rounded-lg text-sm text-red-300 border border-red-400/20">Delete</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function ApplicationsManager() {
    const [applications, setApplications] = useState([]);
    const [error, setError] = useState('');

    const load = useCallback(async () => {
        const data = await api.listApplications();
        setApplications(data.applications);
    }, []);

    useEffect(() => {
        load().catch((err) => setError(err.message));
    }, [load]);

    const setStatus = async (id, status) => {
        await api.updateApplicationStatus(id, status);
        await load();
    };

    return (
        <div>
            <h2 className="text-xl font-display font-bold text-white mb-4">Applications</h2>
            {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
            <div className="space-y-3">
                {applications.map((app) => (
                    <div key={app.id} className="glassmorphism rounded-xl border border-white/10 p-5">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                            <div>
                                <div className="text-white font-semibold">{app.name}</div>
                                <div className="text-sm text-gray-400">{app.email} - {app.position}</div>
                                <p className="text-sm text-gray-500 mt-3 max-w-3xl">{app.cover_letter}</p>
                            </div>
                            <select value={app.status} onChange={(e) => setStatus(app.id, e.target.value)} className="px-3 py-2 rounded-lg bg-black border border-white/10 text-white text-sm">
                                {['pending', 'reviewed', 'rejected', 'accepted'].map((status) => <option key={status} value={status}>{status}</option>)}
                            </select>
                        </div>
                    </div>
                ))}
                {applications.length === 0 && <p className="text-gray-500">No applications submitted.</p>}
            </div>
        </div>
    );
}

function SubscribersManager() {
    const [subscribers, setSubscribers] = useState([]);
    const [error, setError] = useState('');

    const load = useCallback(async () => {
        const data = await api.listSubscribers();
        setSubscribers(data.subscribers);
    }, []);

    useEffect(() => {
        load().catch((err) => setError(err.message));
    }, [load]);

    const remove = async (id) => {
        await api.deleteSubscriber(id);
        await load();
    };

    return (
        <div>
            <h2 className="text-xl font-display font-bold text-white mb-4">Subscribers</h2>
            {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
            <div className="space-y-2">
                {subscribers.map((subscriber) => (
                    <div key={subscriber.id} className="glassmorphism rounded-xl border border-white/10 px-4 py-3 flex items-center justify-between">
                        <span className="text-white text-sm">{subscriber.email}</span>
                        <button onClick={() => remove(subscriber.id)} className="text-xs text-red-300">Remove</button>
                    </div>
                ))}
                {subscribers.length === 0 && <p className="text-gray-500">No subscribers yet.</p>}
            </div>
        </div>
    );
}

export default function Admin() {
    const [user, setUser] = useState(null);
    const [checking, setChecking] = useState(Boolean(getAuthToken()));
    const [active, setActive] = useState('blogs');
    const navigate = useNavigate();

    useEffect(() => {
        if (!getAuthToken()) return;
        api.me()
            .then((data) => setUser(data.user))
            .catch(() => clearAuthToken())
            .finally(() => setChecking(false));
    }, []);

    if (checking) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Checking session...</div>;
    if (!user) return <LoginScreen onLogin={setUser} />;

    const logout = () => {
        clearAuthToken();
        setUser(null);
    };

    return (
        <div className="min-h-screen bg-brand-gray-900">
            <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
                <div>
                    <div className="text-white font-display font-bold">Bluecoderhub Admin</div>
                    <div className="text-xs text-gray-500">{user.email} - {user.role}</div>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => navigate('/')} className="px-4 py-2 rounded-lg text-sm text-gray-300 border border-white/10">Website</button>
                    <button onClick={logout} className="px-4 py-2 rounded-lg text-sm text-black bg-white">Logout</button>
                </div>
            </header>
            <main className="max-w-6xl mx-auto px-4 py-8">
                <div className="flex gap-2 mb-8 border-b border-white/10">
                    {[
                        ['blogs', 'Blogs'],
                        ['applications', 'Applications'],
                        ['subscribers', 'Subscribers']
                    ].map(([id, label]) => (
                        <button key={id} onClick={() => setActive(id)} className={`px-4 py-3 text-sm ${active === id ? 'text-white border-b-2 border-white' : 'text-gray-500'}`}>
                            {label}
                        </button>
                    ))}
                </div>
                <motion.div key={active} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                    {active === 'blogs' && <BlogManager />}
                    {active === 'applications' && <ApplicationsManager />}
                    {active === 'subscribers' && <SubscribersManager />}
                </motion.div>
            </main>
        </div>
    );
}
