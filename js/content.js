import { supabase } from "./supabase.js";
import { round, score } from "./score.js";

//
// ===================================================
// FETCH MAIN LIST (levels + records)
// ===================================================
//

export async function fetchList() {
    // 1. Cargar niveles
    const { data: levels, error: err1 } = await supabase
        .from("levels")
        .select("*")
        .order("id", { ascending: true });

    if (err1) {
        console.error("Error fetching levels:", err1);
        return null;
    }

    // 2. Cargar TODOS los records de una vez (más rápido)
    const { data: records, error: err2 } = await supabase
        .from("records")
        .select("*");

    if (err2) {
        console.error("Error fetching records:", err2);
        return null;
    }

    // 3. Agrupar records por nivel
    const recordMap = {};
    for (const r of records) {
        if (!recordMap[r.level_key]) recordMap[r.level_key] = [];
        recordMap[r.level_key].push(r);
    }

    // 4. Mantener el formato original
    const listFormatted = levels.map(level => [
        {
            ...level,
            path: level.key,
            records: (recordMap[level.key] || []).sort(
                (a, b) => b.percent - a.percent
            ),
        },
        null,
    ]);

    return listFormatted;
}

//
// ===================================================
// FETCH RECORDS FOR A SPECIFIC LEVEL
// ===================================================
//

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

//
// ===================================================
// FETCH EDITORS (optional)
// ===================================================
//

export async function fetchEditors() {
    const { data, error } = await supabase
        .from("editors")
        .select("*")
        .order("id", { ascending: true });

    if (error) {
        console.warn("Could not fetch editors:", error);
        return [];
    }

    return data;
}

//
// ===================================================
// FETCH PACKS (optional)
// ===================================================
//

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

//
// ===================================================
// BUILD LEADERBOARD (Supabase version)
// ===================================================
//

export async function fetchLeaderboard() {
    const list = await fetchList();
    if (!list) return null;

    const scoreMap = {};
    const errors = [];

    // Procesar lista igual que antes
    for (let rank = 0; rank < list.length; rank++) {

        const [level, err] = list[rank];
        if (err || !level) {
            errors.push(err);
            continue;
        }

        const lvKey = level.key;
        const lvName = level.name;

        // ============ VERIFIER =============
        if (level.verifier) {
            const verifier =
                Object.keys(scoreMap).find(
                    u => u.toLowerCase() === level.verifier.toLowerCase()
                ) || level.verifier;

            scoreMap[verifier] ??= { verified: [], completed: [], progressed: [] };

            scoreMap[verifier].verified.push({
                rank: rank + 1,
                level: lvName,
                score: score(rank + 1, 100, level.percent_to_qualify),
                link: level.verification,
            });
        }

        // ============ RECORDS ==============
        for (const record of level.records) {
            const user =
                Object.keys(scoreMap).find(
                    u => u.toLowerCase() === record.username.toLowerCase()
                ) || record.username;

            scoreMap[user] ??= { verified: [], completed: [], progressed: [] };

            if (record.percent === 100) {
                scoreMap[user].completed.push({
                    rank: rank + 1,
                    level: lvName,
                    score: score(rank + 1, 100, level.percent_to_qualify),
                    link: record.link,
                });
            } else {
                scoreMap[user].progressed.push({
                    rank: rank + 1,
                    level: lvName,
                    percent: record.percent,
                    score: score(rank + 1, record.percent, level.percent_to_qualify),
                    link: record.link,
                });
            }
        }
    }

    // Convertir scoreMap → array ordenado
    const leaderboard = Object.entries(scoreMap).map(([user, scores]) => {
        const { verified, completed, progressed } = scores;

        let total = [...verified, ...completed, ...progressed]
            .reduce((a, b) => a + b.score, 0);

        return {
            user,
            total: round(total),
            ...scores,
        };
    });

    // Ordenar por puntaje (descendente)
    return [leaderboard.sort((a, b) => b.total - a.total), errors];
}
