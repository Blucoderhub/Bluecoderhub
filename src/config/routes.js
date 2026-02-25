/**
 * Named route constants — prevents typo bugs in Link to=... props.
 */

export const ROUTES = {
    HOME: '/',
    PRODUCTS: '/products',
    ABOUT: '/about',
    CAREERS: '/careers',
    ACE: '/ace',
    BLOG: '/blog',
    BLOG_POST: (id) => `/blog/${id}`,
    CONTACT: '/contact',
    ADMIN: '/admin',
};
