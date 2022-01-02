function setCookie(name, value, days) {
    const d = new Date();
    d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${d.toUTCString()};path=/`;
}
function getCookie(name) {
    const cookies = decodeURIComponent(document.cookie).split(';');
    const needle = `${name}=`;
    for (let c of cookies) {
        while (c.charAt(0) == ' ')
            c = c.substring(1);
        if (c.indexOf(needle) == 0)
            return c.substring(needle.length, c.length);
    }
    return null;
}
let presets = {};
function loadPreset(name) {
    presets = JSON.parse(getCookie('savedSimulations'));
    return (name in presets) ? presets[name] : null;
}
function storePreset(name, description) {
    if (name !== null)
        presets[name] = description;
    setCookie('savedSimulations', JSON.stringify(presets), 365);
    initPresets();
}
function initPresets() {
    loadPreset(null);
    const list = $('presets');
    clear(list);
    for (const name in presets) {
        list.append(create('div', {
            'class': 'preset',
            '@click': function (event) {
                simulation.description = loadPreset(name);
                simulation.reset();
                updateLayout();
                list.childNodes.forEach((node, key, parent) => removeClass(node, 'selected'));
                addClass(this, 'selected');
            }
        }, [
            create('span', {}, name),
            create('span', {
                'class': 'remove', '@click': function (event) {
                    delete presets[name];
                    storePreset(null, null);
                }
            })
        ]));
    }
}
//# sourceMappingURL=presets.js.map