export function getYoutubeIdFromUrl(url) {
    return url.match(
        /.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/,
    )?.[1] ?? '';
}

export function getMedalIdFromUrl(url) {
    const match = url.match(
        /medal\.tv\/(?:games\/[^/]+\/clips|clips?|clip)\/([^/?#]+)/
    );
    return match?.[1] ?? '';
}

export function getVideoPlatform(url) {
    if (!url) return "unknown";
    if (/youtu\.?be/.test(url)) return "youtube";
    if (/medal\.tv/.test(url)) return "medal";
    return "unknown";
}

export function embed(video) {
    const platform = getVideoPlatform(video);

    if (platform === "youtube") {
        return `https://www.youtube.com/embed/${getYoutubeIdFromUrl(video)}`;
    }
    if (platform === "medal") {
        return `https://medal.tv/clip/${getMedalIdFromUrl(video)}`;
    }
    return video;
}

export function localize(num) {
    return num.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 3,
    });
}

export function getThumbnailFromId(urlOrId) {
    if (!urlOrId) return '';

    const input = String(urlOrId).trim();
    const platform = getVideoPlatform(input);

    const possibleYouTubeId = input.match(/^[A-Za-z0-9_-]{6,}$/);

    if (platform === "youtube") {
        const id = getYoutubeIdFromUrl(input) || (possibleYouTubeId && possibleYouTubeId[0]);
        if (id) return `https://img.youtube.com/vi/${id}/mqdefault.jpg`;
    }

    if (platform === "unknown" && possibleYouTubeId) {
        return `https://img.youtube.com/vi/${possibleYouTubeId[0]}/mqdefault.jpg`;
    }

    if (platform === "medal") {
        const id = getMedalIdFromUrl(input);
        if (id) return `https://medal.tv/clip/${id}`;
    }

    return '';
}

export function shuffle(array) {
    let currentIndex = array.length, randomIndex;

    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex],
        ];
    }

    return array;
}

export function round(num) {
    return Math.round(num * 10) / 10;
}

export function score(position) {

    if (position > 200) {
        return 0;
    }

    const ratio = (position -1) / (200 - 1);

    return round(
        500 * Math.pow(10 / 500, ratio)
    );
}
