function setCookie(name: string, value: string, days: number): void {
    const d = new Date();
    d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${d.toUTCString()};path=/`;
}

function getCookie(name: string): string {
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

let presets: { [key: string]: SimulationDescription } = {};

function loadPreset(name: string): SimulationDescription {
    presets = JSON.parse(getCookie('savedSimulations'));
    return (name in presets) ? presets[name] : null;
}

function storePreset(name: string, description: SimulationDescription): void {
    if (name !== null) presets[name] = description;
    setCookie('savedSimulations', JSON.stringify(presets), 365);
    initPresets();
}

function initPresets(): void {
    loadPreset(null);
    const list = $('presets');
    clear(list);
    for (const name in presets) {
        list.append(create('div', {
            'class': 'preset',
            '@click': function (event: MouseEvent) {
                simulation.description = loadPreset(name);
                simulation.reset();
                updateLayout();
                list.childNodes.forEach((node, key, parent) => removeClass(node as HTMLElement, 'selected'));
                addClass(this, 'selected');
            }
        }, [
            create('span', {}, name),
            create('span', {
                'class': 'remove', '@click': function (event: MouseEvent) {
                    delete presets[name];
                    storePreset(null, null);
                }
            })
        ]));
    }
}
