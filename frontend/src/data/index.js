/**
 * Barrel export for data files.
 * Provides a single import path for all static data.
 * 
 * Usage:
 *   import { products, jobs, team } from './data';
 */

import products from './products.json';
import jobs from './jobs.json';
import team from './team.json';
import blog from './blog.json';
import services from './services.json';

export const data = {
    products,
    jobs,
    team,
    blog,
    services,
};

export { products, jobs, team, blog, services };