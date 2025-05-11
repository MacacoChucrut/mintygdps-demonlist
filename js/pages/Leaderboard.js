import { fetchLeaderboard } from '../content.js';
import { localize } from '../util.js';

import Spinner from '../components/Spinner.js';

export default {
    components: {
        Spinner,
    },
    data: () => ({
        leaderboard: [],
        loading: true,
        selected: 0,
        err: [],
    }),
    template: `
        <main v-if="loading">
            <Spinner></Spinner>
        </main>
        <main v-else class="page-leaderboard-container">
            <div class="page-leaderboard">
                <div class="error-container">
                    <p class="error" v-if="err.length > 0">
                        Leaderboard may be incorrect, as the following levels could not be loaded: {{ err.join(', ') }}
                    </p>
                </div>
                <div class="board-container">
                    <table class="board">
                        <tr v-for="(ientry, i) in leaderboard">
                            <td class="rank">
                                <p class="type-label-lg" :id="'rank-' + i">#{{ i + 1 }}</p>
                            </td>
                            <td class="total">
                                <p class="type-label-lg" :id="'total-' + i">{{ localize(ientry.total) }}</p>
                            </td>
                            <td class="user" :class="{ 'active': selected == i }">
                                <button @click="selected = i">
                                    <span class="type-label-lg" :id="'user-' + i">{{ ientry.user }}</span>
                                </button>
                            </td>
                        </tr>
                    </table>
                </div>
                <div class="player-container">
                    <div class="player">
                        <h1>#{{ selected + 1 }} {{ entry.user }}</h1>
                        <h3>{{ entry.total }}</h3>
                        <h2 v-if="entry.verified.length > 0">Verified ({{ entry.verified.length}})</h2>
                        <table class="table">
                            <tr v-for="score in entry.verified">
                                <td class="rank">
                                    <p>#{{ score.rank }}</p>
                                </td>
                                <td class="level">
                                    <a class="type-label-lg" target="_blank" :href="score.link">{{ score.level }}</a>
                                </td>
                                <td class="score">
                                    <p>+{{ localize(score.score) }}</p>
                                </td>
                            </tr>
                        </table>
                        <h2 v-if="entry.completed.length > 0">Completed ({{ entry.completed.length }})</h2>
                        <table class="table">
                            <tr v-for="score in entry.completed">
                                <td class="rank">
                                    <p>#{{ score.rank }}</p>
                                </td>
                                <td class="level">
                                    <a class="type-label-lg" target="_blank" :href="score.link">{{ score.level }}</a>
                                </td>
                                <td class="score">
                                    <p>+{{ localize(score.score) }}</p>
                                </td>
                            </tr>
                        </table>
                        <h2 v-if="entry.progressed.length > 0">Progressed ({{entry.progressed.length}})</h2>
                        <table class="table">
                            <tr v-for="score in entry.progressed">
                                <td class="rank">
                                    <p>#{{ score.rank }}</p>
                                </td>
                                <td class="level">
                                    <a class="type-label-lg" target="_blank" :href="score.link">{{ score.percent }}% {{ score.level }}</a>
                                </td>
                                <td class="score">
                                    <p>+{{ localize(score.score) }}</p>
                                </td>
                            </tr>
                        </table>
                    </div>
                </div>
            </div>
        </main>
    `,
    computed: {
        entry() {
            return this.leaderboard[this.selected];
        },
    },
    async mounted() {
        const [leaderboard, err] = await fetchLeaderboard();
        this.leaderboard = leaderboard;
        this.err = err;
        this.loading = false;
        this.applyRankEffects();
    },
    methods: {
        localize,
        applyRankEffects() {
            this.$nextTick(() => {
                const ranks = [
                    { index: 0, color: '#FFD700', animation: 'breathingGold' },
                    { index: 1, color: '#C0C0C0', animation: 'breathingSilver' },
                    { index: 2, color: '#CD7F32', animation: 'breathingBronze' },
                ];

                for (const { index, color, animation } of ranks) {
                    const rank = document.querySelector(`#rank-${index}`);
                    const user = document.querySelector(`#user-${index}`);
                    const total = document.querySelector(`#total-${index}`);
                    if (rank && user && total) {
                        this.addGlowEffect(rank, color, animation);
                        this.addGlowEffect(user, color, animation);
                        this.addGlowEffect(total, color, animation);
                    }
                }
            });
        },
        addGlowEffect(element, color, animationName) {
            element.style.transition = "all 0.5s ease-in-out";
            element.style.fontWeight = 'bold';
            element.style.color = color;
            element.style.animation = `${animationName} 3s infinite alternate`;
        }
    },
};

// Add breathing glow CSS animations
const style = document.createElement('style');
style.innerHTML = `
@keyframes breathingGold {
    0% { text-shadow: 0 0 5px rgba(255,215,0,0.65), 0 0 10px rgba(255,215,0,0.65); }
    100% { text-shadow: 0 0 20px rgba(255,215,0,0.25), 0 0 50px rgba(255,215,0,0.25); }
}
@keyframes breathingSilver {
    0% { text-shadow: 0 0 5px rgba(192,192,192,0.65), 0 0 10px rgba(192,192,192,0.65); }
    100% { text-shadow: 0 0 20px rgba(192,192,192,0.25), 0 0 50px rgba(192,192,192,0.25); }
}
@keyframes breathingBronze {
    0% { text-shadow: 0 0 5px rgba(205,127,50,0.65), 0 0 10px rgba(205,127,50,0.65); }
    100% { text-shadow: 0 0 20px rgba(205,127,50,0.25), 0 0 50px rgba(205,127,50,0.25); }
}
`;
document.head.appendChild(style);