import { round, score } from "./utils.js";
const levelsDir = '/levels';
const packsDir = '/packs';

let cachedList = null;
let cachedPacks = null;

export async function fetchList() {

    if (cachedList) {
        return cachedList;
    }

    const listResult = await fetch(`${levelsDir}/_list.json`);
    try {
        const list = await listResult.json();
        cachedList = await Promise.all(
            list.map(async (path, rank) => {
                try {
                    const levelResult = await fetch(`${levelsDir}/${path}.json`);
                    const level = await levelResult.json();

                    return [
                        {
                            ...level,
                            path,
                            records: level.records.sort(
                                (a, b) => b.percent - a.percent
                            ),
                        },
                        null,
                    ];
                } catch {
                    console.error('failed to load level #${rank + 1} ${path}');
                    return [null, path];
                }
            }),
        );


        return cachedList;

    } catch {
        console.error(`Failed to load list.`);
        return null;
    }
}

export async function fetchEditors() {
    try {
        const editorsResults = await fetch(`/_editors.json`);
        const editors = await editorsResults.json();
        return editors;
    } catch {
        return null;
    }
}

export async function fetchLeaderboard() {
    const list = await fetchList();

    let packs = [];
    try {
        packs = await fetchPacks();
    } catch {
        console.warn('Error loading packs with rewards');
    }

    const scoreMap = {};
    const errs = [];

    list.forEach(([level, err], rank) => {
        if (err) {
            errs.push(err);
            return;
        }

        // Verification
        const verifier =
            Object.keys(scoreMap).find(
                (u) => u.toLowerCase() === level.verifier.toLowerCase(),
            ) || level.verifier;
        scoreMap[verifier] ??= {
            verified: [],
            completed: [],
        };
        const { verified } = scoreMap[verifier];
        verified.push({
            rank: rank + 1,
            level: level.name,
            path: level.path,
            score: score(rank + 1),
            link: level.verification,
        });

        // Records
        level.records.forEach((record) => {
            const user =
                Object.keys(scoreMap).find(
                    (u) => u.toLowerCase() === record.user.toLowerCase(),
                ) || record.user;
            scoreMap[user] ??= {
                verified: [],
                completed: [],
            };
            const { completed } = scoreMap[user];
            completed.push({
                rank: rank + 1,
                level: level.name,
                path: level.path,
                score: score(rank + 1),
                link: record.link,
            });
        });
    });

    const res = Object.entries(scoreMap).map(([user, scores]) => {
        const { verified, completed } = scores;
        let total = [verified, completed]
            .flat()
            .reduce((prev, cur) => prev + cur.score, 0);

        const completedLevels = completed.map(l => l.path);
        const verifiedLevels = verified.map(l => l.path);
        const allCompletedLevels = [...new Set([...completedLevels, ...verifiedLevels])];

        const packsCompleted = [];
        for (const pack of packs) {
            if (pack.levels.every((lvl) => allCompletedLevels.includes(lvl))) {
                packsCompleted.push({
                    name: pack.name,
                    color: pack.color || 'var(--color-primary)',
                });
                if (pack.reward) total += pack.reward;
            }
        }

        return {
            user,
            total: round(total),
            packsCompleted,
            ...scores,
        };
    });

    return [res.sort((a, b) => b.total - a.total), errs];
}

export async function fetchPacks() {

    if (cachedPacks) {
        return cachedPacks;
    }

    try {
        const listResponse = await fetch(`${packsDir}/_list.json`);

        if (!listResponse.ok) {
            throw new Error("failed to load pack list.");
        }

        const packNames = await listResponse.json();

        const packResponses = await Promise.all(
            packNames.map(name => fetch(`${packsDir}/${name}.json`))
        );

        const packs = await Promise.all(
            packResponses.map(async response => {
                if (!response.ok) {
                    console.warn(`failed to load packs.`);
                    return null;
                }
                return await response.json();
            })
        );

        const validPacks = packs.filter(Boolean);

        const list = await fetchList();

        const levelMap = new Map(
            list.map((entry, index) => [
                entry[0].path,
                {
                    level: entry[0],
                    rank: index + 1,
                }
            ])
        );

        validPacks.forEach(pack => {
            let totalReward = 0;
            const ranks = [];
            let invalid = false;

            pack.levels.forEach(levelPath => {

                const entry = levelMap.get(levelPath);

                if (!entry) {
                    console.warn(`level not found: ${levelPath}`);
                    return;
                }

                const rank = entry.rank;

                ranks.push(rank);

                if (rank > 200) invalid = true;

                totalReward += score(rank);
            });

            const avgRank =
                ranks.length > 0
                    ? ranks.reduce((a, b) => a + b, 0) / ranks.length
                    : 999;

            let multiplier = 1;

            if (avgRank <= 25) multiplier = 0.7;
            else if (avgRank <= 50) multiplier = 0.65;
            else if (avgRank <= 100) multiplier = 0.6;
            else if (avgRank <= 150) multiplier = 0.55;
            else multiplier = 0.5;

            if (invalid) {
                pack.reward = 0;
                pack.warning =
                    "This pack does not grant points because it contains Legacy levels.";
            } else {
                pack.reward = round(totalReward * multiplier);
            }
        });

        cachedPacks = validPacks;
        return cachedPacks;

    } catch (err) {
        console.error("error fetching packs:", err);
        return [];
    }
}