const PASSWORD = "xwltsko92refqjy0tlxzys";

function checkPassword() {
    const input = document.getElementById("admin-pass");

    if (input.value === PASSWORD) {
        document.getElementById("login-box").style.display = "none";
        document.getElementById("admin-panel").style.display = "block";
        loadLevelList();
    }
    else {
        alert("Access denied");
    }
}

function copyText(id) {
    const textarea = document.getElementById(id);
    textarea.select();
    document.execCommand("copy");
}

function autoKey() {
    const name = document.getElementById("levelName").value;
    if (!name) return;

    const key = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_|_$/g, "");

    document.getElementById("levelKey").value = key;
}

function addToList() {
    const key = document.getElementById("levelKey").value.trim();

    if (!key) {
        alert("Enter a level key");
        return;
    }

    document.getElementById("listOutput").value =
        `"${key}",`;
}

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

async function loadLevelList() {

    const select = document.getElementById("levelSelect");
    select.innerHTML = "<option>Loading...</option>";

    try {
        const res = await fetch("./_list.json");
        const list = await res.json();

        select.innerHTML = "";

        for (const level of list) {
            const option = document.createElement("option");
            option.value = level;
            option.textContent = level;
            select.appendChild(option);
        }

    } catch (error) {
        console.error(error);
        select.innerHTML = "<option>Error loading list</option>";
    }

}

function generateRecord() {

    const level = document.getElementById("levelSelect").value;
    const user = document.getElementById("recUser").value;
    const link = document.getElementById("recLink").value;
    const percent = Number(document.getElementById("recPercent").value);
    const mobile = document.getElementById("recMobile").value === "true";

    if (!user || !link || !percent) {
        alert("Fill all fields");
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
