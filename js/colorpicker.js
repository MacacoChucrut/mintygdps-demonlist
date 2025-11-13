const savedColor = localStorage.getItem('accent-color');

const pickr = Pickr.create({
    el: '#color-picker',
    theme: 'classic',

    default: savedColor || '#ff00ff',

    components: {
        preview: true,
        opacity: true,
        hue: true,

        interaction: {
            hex: true,
            rgba: true,
            input: true,
            save: true
        }
    }
});

if (savedColor) {
    document.documentElement.style.setProperty('--accent', savedColor);
}

/

pickr.on('save', (color) => {
    const hex = color.toHEXA().toString();

    localStorage.setItem('accent-color', hex);

    document.documentElement.style.setProperty('--accent', hex);

    pickr.hide();
});
