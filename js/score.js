/**
 * Numbers of decimal digits to round to
 */
const scale = 2;

/**
 * Calculate the score awarded when having a certain percentage on a list level
 * @param {Number} rank Position on the list
 * @param {Number} percent Percentage of completion
 * @param {Number} minPercent Minimum percentage required
 * @returns {Number}
 */
export function score(rank, percent, minPercent) {
    if (rank > 100) {
        return 0;
    }
    if (rank > 50 && percent < 100) {
        return 0;
    }

    // Nueva fórmula que decae de 200 a 0 entre los puestos 1 y 100
    const maxRank = 100;
    const maxScore = 200;
    const base = Math.pow(maxRank - 1, 0.4);
    const multiplier = maxScore / base;
    let score = multiplier * (base - Math.pow(rank - 1, 0.4));

    score *= ((percent - (minPercent - 1)) / (100 - (minPercent - 1)));
    score = Math.max(0, score);

    if (percent != 100) {
        return round(score - score / 3);
    }

    return Math.max(round(score), 0);
}

export function round(num) {
    if (!('' + num).includes('e')) {
        return +(Math.round(num + 'e+' + scale) + 'e-' + scale);
    } else {
        var arr = ('' + num).split('e');
        var sig = '';
        if (+arr[1] + scale > 0) {
            sig = '+';
        }
        return +(
            Math.round(+arr[0] + 'e' + sig + (+arr[1] + scale)) +
            'e-' +
            scale
        );
    }
}
