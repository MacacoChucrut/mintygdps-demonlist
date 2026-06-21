import list from '../pages/list.js';
import leaderboard from '../pages/leaderboard.js';
import roulette from '../pages/roulette.js';
import packs from '../pages/packs.js';

export default [
    { path: '/', component: list },
    { path: '/leaderboard', component: leaderboard },
    { path: '/roulette', component: roulette },
    { path: '/packs', component: packs }
];