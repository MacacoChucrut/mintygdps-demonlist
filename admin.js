import { supabase } from "./supabase.js";

// =====================
// HASHED PASSWORD LOGIN
// =====================

// contraseña real: xwltsko92refqjy0tlxzys
const PASSWORD_HASH = "23f1ccc8a2f22f03806786256b05ed8fa7373c671c96b07f37fa187b198326b9";

async function hash(text) {
    const data = new TextEncoder().encode(text);
    const digest = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(digest))
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");
}

window.checkPassword = async function () {
    const entered = document.getElementById("admin-pass").value;
    const hashed = await hash(entered);

    if (hashed === PASSWORD_HASH) {
        document.getElementById("login-box").style.display = "none";
        document.getElementById("admin-panel").style.display = "block";
    } else {
        alert("Access denied");
    }
};

// =====================
// ADD LEVEL TO SUPABASE
// =====================

window.addLevel = async function () {
    const key = document.getElementById("levelKey").value.trim();
    const name = document.getElementById("levelName").value.trim();
    const creators = document.getElementById("levelCreators").value.split(",").map(e => e.trim());
    const verifier = document.getElementById("levelVerifier").value.trim();
    const verification = document.getElementById("levelVerifLink").value.trim();
    const showcase = document.getElementById("levelShowcase").value.trim();
    const percent = Number(document.getElementById("levelPercent").value);
    const tags = document.getElementById("levelTags").value.split(",").map(e => e.trim());
    const level_id = Number(document.getElementById("levelId").value);

    if (!key || !name) {
        alert("Level key and name are required.");
        return;
    }

    const { error } = await supabase.from("levels").insert({
        key,
        name,
        creators,
        verifier,
        verification,
        showcase,
        percent_to_qualify: percent,
        tags,
        level_id
    });

    if (error) {
        alert("Error adding level: " + error.message);
    } else {
        alert("Level added successfully!");
    }
};

// =====================
// ADD RECORD
// =====================

window.addRecord = async function () {
    const levelKey = document.getElementById("recordLevel").value.trim();
    const username = document.getElementById("recUser").value.trim();
    const link = document.getElementById("recLink").value.trim();
    const percent = Number(document.getElementById("recPercent").value);
    const mobile = document.getElementById("recMobile").value === "true";

    if (!levelKey || !username || !link || !percent) {
        alert("Fill all fields!");
        return;
    }

    const { error } = await supabase.from("records").insert({
        level_key: levelKey,
        username,
        link,
        percent,
        mobile
    });

    if (error) {
        alert("Error adding record: " + error.message);
    } else {
        alert("Record added!");
    }
};

// =====================
// AUTO GENERATE KEY
// =====================

window.autoKey = function () {
    const name = document.getElementById("levelName").value.trim();
    if (!name) return;

    const key = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_|_$/g, "");

    document.getElementById("levelKey").value = key;
};
