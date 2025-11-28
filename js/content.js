import { supabase } from "./supabase.js";
import { round, score } from "./score.js";

// =========================
// FETCH LEVELS (MAIN LIST)
// =========================

export async function fetchList() {
    const { data, error } = await supabase
        .from("levels")
        .select("*")
        .order("id", { ascending: true });

    if (error) {
        console.error("Error fetching levels:", error);
        return null;
    }

    // La demonlist original usa: [level, errorString]
    return data.map(level => [
        {
            ...level,
            path: level.key,
            records: [], // se cargan después desde Supabase
        },
        null,
    ]);
}

// =========================
// FETCH RECORDS OF A LEVEL
// =========================

export async function fetchRecords(levelKey) {
    const { data, error } = await supabase
        .from("records")
        .select("*")
        .eq("level_key", levelKey)
        .order("percent", { ascending: false });

    if (error) {
        console.error("Error fetching records:", error);
        return [];
    }

    return data;
}

// =========================
// FETCH LIST EDITORS (optional)
// =========================

export async function fetchEditors() {
    const { data, error } = await supabase
        .from("editors")
        .select("*");

    if (error) {
        console.warn("Could not fetch editors:", error);
        return [];
    }

    return data;
}

// =========================
// FETCH PACKS (NEW SYSTEM)
// =========================

export async function fetchPacks() {
    const { data, error } = await supabase
        .from("packs")
        .select("*");

    if (error) {
        console.error("Error fetching packs:", error);
        return [];
    }

    return data;
}

// =========================
// LEADERBOARD REBUILD
// =========================

export async function fetchLeaderboard() {
    const list = await fetchList();

    const scoreMap = {};
    const errs = [];

    // Cargar todos los records desde la BD
    const { data: allRecords, error: recError } = await supabase
        .from("records")
        .select("*");

    if (recError) {
        console.error("Error fetching all records:", recError);
        return null;
    }

    for (let rank = 0; rank < list.length; rank++) {
        const [level, err] = list[rank];

        if (err || !level) {
            errs.push(err);
            continue;
        }

        // FILTRAR records únicamente de este nivel
        const levelRecords = allRecords.filter(r => r.level_key === level.key);

        // ORDENAR:
        level.records = levelRecords.sort((a, b) => b.percent - a.percent);

        // ====================================
        // Verifier → Verified points
        // ====================================
        const verifier =
            Object.keys(scoreMap).find(
                (u) => u.toLowerCase() === level.verifier?.toLowerCase(),
            ) || level.verifier;

        if (verifier) {
            scoreMap[verifier] ??= { verified: [], completed: [], progressed: [] };

            scoreMap[verifier].verified.push({
                rank: rank + 1,
                level: level.name,
                score: score(rank + 1, 100, level.percent_to_qualify),
                link: level.verification,
            });
        }

        // ====================================
        // Records → Completed / Progressed
        // ====================================
        for (const record of level.records) {
            const user =
                Object.keys(scoreMap).find(
                    (u) => u.toLowerCase() === record.username.toLowerCase(),
                ) || record.username;

            scoreMap[user] ??= { verified: [], completed: [], progressed: [] };

            if (record.percent === 100) {
                scoreMap[user].completed.push({
                    rank: rank + 1,
                    level: level.name,
                    score: score(rank + 1, 100, level.percent_to_qualify),
                    link: record.link,
                });
            } else {
                scoreMap[user].progressed.push({
                    rank: rank + 1,
                    level: level.name,
                    percent: record.percent,
                    score: score(rank + 1, record.percent, level.percent_to_qualify),
                    link: record.link,
                });
            }
        }
    }

    // Convertir a leaderboard final
    const res = Object.entries(scoreMap).map(([user, scores]) => {
        const { verified, completed, progressed } = scores;

        let total = [verified, completed, progressed]
            .flat()
            .reduce((prev, cur) => prev + cur.score, 0);

        return {
            user,
            total: round(total),
            ...scores,
        };
    });

    // Devolver ordenado
    return [res.sort((a, b) => b.total - a.total), errs];
}
