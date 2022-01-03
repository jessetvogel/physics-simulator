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

const defaultPresets = "{\"pendulum\":{\"variables\":{\"symbols\":[\"a\"],\"values\":[1.5],\"velocities\":[0]},\"constants\":{\"symbols\":[\"m\",\"g\",\"L\"],\"values\":[1,9.81,1]},\"script\":\"x = Math.sin(a) * L\\ny = -Math.cos(a) * L\\n\\ndrawCircle(0, 0, 0.01)\\ndrawCircle(x, y, 0.10)\\ndrawLine(0, 0, x, y)\",\"lagrangian\":\"1/2 * m * da^2 * L^2 - m * g * (-cos(a) * L)\"},\"gravity\":{\"variables\":{\"symbols\":[\"x_1\",\"y_1\",\"x_2\",\"y_2\"],\"values\":[1,0,-1,0],\"velocities\":[0,1,0,-1]},\"constants\":{\"symbols\":[\"m_1\",\"m_2\",\"G\"],\"values\":[1,1,6]},\"script\":\"drawCircle(x_1, y_1, 0.10)\\ndrawCircle(x_2, y_2, 0.10)\",\"lagrangian\":\"0.5 * m_1 * (dx_1^2 + dy_1^2) + 0.5 * m_2 * (dx_2^2 + dy_2^2) + G * m_1 * m_2 / ((x_1 - x_2)^2 + (y_1 - y_2)^2)^(1/2)\"}}";

function loadPreset(name: string): SimulationDescription {
    try {
        let cookie = getCookie('presets');
        if (cookie === null) cookie = defaultPresets;
        presets = JSON.parse(cookie);
        return (name in presets) ? presets[name] : null;
    }
    catch (error) {
        return null;
    }
}

function storePreset(name: string, description: SimulationDescription): void {
    if (name !== null) presets[name] = description;
    setCookie('presets', JSON.stringify(presets), 365);
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
