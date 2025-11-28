const PASSWORD_HASH = "23f1ccc8a2f22f03806786256b05ed8fa7373c671c96b07f37fa187b198326b9";


// =====================
// HASH FUNCTION (SHA-256)
// =====================
async function hash(text) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
    return hashHex;
}


// =====================
// LOGIN
// =====================
async function checkPassword() {
    const input = document.getElementById("admin-pass");
    const entered = input.value;

    const hashed = await hash(entered);

    if (hashed === PASSWORD_HASH) {
        document.getElementById("login-box").style.display = "none";
        document.getElementById("admin-panel").style.display = "block";
    }
    else {
        alert("Access denied");
    }
}



// =====================
// COPY FUNCTION
// =====================
function copyText(id) {
    const textarea = document.getElementById(id);
    textarea.select();
    document.execCommand("copy");
}



// =====================
// AUTO KEY GENERATOR
// =====================
function autoKey() {
    const name = document.getElementById("levelName").value;
    if (!name) return;

    const key = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_|_$/g, "");

    document.getElementById("levelKey").value = key;
}



// =====================
// ADD TO _LIST.JSON
// =====================
function addToList() {
    const key = document.getElementById("levelKey").value.trim();

    if (!key) {
        alert("Enter a level key");
        return;
    }

    document.getElementById("listOutput").value =
        `"${key}",`;
}



// =====================
// CREATE LEVEL JSON
// =====================
function generateLevelJSON() {

    const id = Number(document.getElementById("levelId").value) || 0;
    const name = document.getElementById("levelName").value;

    const creators = document.getElementById("levelCreators").value
        .split(",")
        .map(e => e.trim())
        .filter(Boolean);

    const verifier = document.getElementById("levelVerifier").value;
    const verification = document.getElementById("levelVerifLink").value;
    const showcase = document.getElementById("levelShowcase").value;
    const percent = document.getElementById("levelPercent").value || "100";

    const tags = document.getElementById("levelTags").value
        .split(",")
        .map(e => e.trim())
        .filter(Boolean);

    if (!name || creators.length === 0) {
        alert("Please enter at least a name and creators");
        return;
    }

    const levelJson = {
        id: id,
        name: name,
        creators: creators,
        verifier: verifier,
        verification: verification,
        showcase: showcase,
        percentToQualify: percent,
        records: [],
        tags: tags
    };

    document.getElementById("levelOutput").value =
        JSON.stringify(levelJson, null, 4);
}



// =====================
// DOWNLOAD LEVEL FILE
// =====================
function downloadLevel() {

    const data = document.getElementById("levelOutput").value;
    if (!data) {
        alert("Generate the level JSON first!");
        return;
    }

    let filename = document.getElementById("levelKey").value;

    if (!filename) {
        filename = "new_level";
    }

    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.json`;
    a.click();

    URL.revokeObjectURL(url);
}



// =====================
// CREATE RECORD JSON
// =====================
function generateRecord() {

    const level = document.getElementById("recordLevel")?.value?.trim() || "UNKNOWN LEVEL";
    const user = document.getElementById("recUser").value;
    const link = document.getElementById("recLink").value;
    const percent = Number(document.getElementById("recPercent").value);
    const mobile = document.getElementById("recMobile").value === "true";

    if (!level || !user || !link || !percent) {
        alert("Fill all fields (including level name)");
        return;
    }

    const record = {
        user: user,
        link: link,
        percent: percent,
        mobile: mobile
    };

    document.getElementById("recordOutput").value =
        `// Add this to: ${level}.json\n\n` +
        JSON.stringify(record, null, 4);
}
