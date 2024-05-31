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

let presets: { [key: string]: SimulatorDescription } = {};

// const defaultPresets = "{\"pendulum\":{\"variables\":{\"symbols\":[\"a\"],\"values\":[1.5],\"velocities\":[0]},\"constants\":{\"symbols\":[\"m\",\"g\",\"L\"],\"values\":[1,9.81,1]},\"script\":\"x = Math.sin(a) * L\\ny = -Math.cos(a) * L\\n\\ncircle(0, 0, 0.01)\\ncircle(x, y, 0.10)\\nline(0, 0, x, y)\",\"lagrangian\":\"1/2 * m * da^2 * L^2 - m * g * (-cos(a) * L)\"},\"gravity\":{\"variables\":{\"symbols\":[\"x_1\",\"y_1\",\"x_2\",\"y_2\"],\"values\":[1,0,-1,0],\"velocities\":[0,1,0,-1]},\"constants\":{\"symbols\":[\"m_1\",\"m_2\",\"G\"],\"values\":[1,1,6]},\"script\":\"circle(x_1, y_1, 0.10)\\ncircle(x_2, y_2, 0.10)\",\"lagrangian\":\"0.5 * m_1 * (dx_1^2 + dy_1^2) + 0.5 * m_2 * (dx_2^2 + dy_2^2) + G * m_1 * m_2 / ((x_1 - x_2)^2 + (y_1 - y_2)^2)^(1/2)\"}}";
const defaultPresets = "{\"pendulum\":{\"variables\":{\"symbols\":[\"a\"],\"values\":[1.5],\"velocities\":[0]},\"constants\":{\"symbols\":[\"m\",\"g\",\"L\"],\"values\":[1,9.81,1]},\"script\":\"x = Math.sin(a) * L\\ny = -Math.cos(a) * L\\n\\ncircle(0, 0, 0.01)\\ncircle(x, y, 0.10)\\nline(0, 0, x, y)\",\"lagrangian\":\"1\/2 * m * da^2 * L^2 - m * g * (-cos(a) * L)\"},\"gravity\":{\"variables\":{\"symbols\":[\"x_1\",\"y_1\",\"x_2\",\"y_2\"],\"values\":[1,0,-1,0],\"velocities\":[0,1,0,-1]},\"constants\":{\"symbols\":[\"m_1\",\"m_2\",\"G\"],\"values\":[1,1,6]},\"script\":\"circle(x_1, y_1, 0.10)\\ncircle(x_2, y_2, 0.10)\",\"lagrangian\":\"0.5 * m_1 * (dx_1^2 + dy_1^2) + 0.5 * m_2 * (dx_2^2 + dy_2^2) + G * m_1 * m_2 \/ ((x_1 - x_2)^2 + (y_1 - y_2)^2)^(1\/2)\"},\"double pendulum\":{\"variables\":{\"symbols\":[\"a_1\",\"a_2\"],\"values\":[2,2],\"velocities\":[0,0]},\"constants\":{\"symbols\":[\"l_1\",\"l_2\",\"m_1\",\"m_2\",\"g\"],\"values\":[1,1,1,1,10]},\"script\":\"x_1 = l_1 * Math.sin(a_1)\\ny_1 = -l_1 * Math.cos(a_1)\\n\\nx_2 = x_1 + l_2 * Math.sin(a_2)\\ny_2 = y_1 - l_2 * Math.cos(a_2)\\n\\nm = Math.max(m_1, m_2)\\n\\ncircle(0, 0, 0.01)\\ncircle(x_1, y_1, 0.10 * Math.sqrt(m_1 \/ m))\\ncircle(x_2, y_2, 0.10 * Math.sqrt(m_2 \/ m))\\nline(0, 0, x_1, y_1)\\nline(x_1, y_1, x_2, y_2)\",\"lagrangian\":\"1\/2 * (m_1 + m_2) * l_1^2 * da_1^2 + 1\/2 * m_2 * l_2^2 * da_2^2 + m_2 * l_1 * l_2 * da_1 * da_2 * cos(a_1 - a_2) + (m_1 + m_2) * g * l_1 * cos(a_1) + m_2 * g * l_2 * cos(a_2)\"}}";

function loadPreset(name: string): SimulatorDescription {
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

function storePreset(name: string, description: SimulatorDescription): void {
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
                simulator.description = loadPreset(name);
                simulator.reset();
                updateLayout();
                list.childNodes.forEach((node, key, parent) => removeClass(node as HTMLElement, 'selected'));
                addClass(this, 'selected');
                ($('input-preset-name') as HTMLInputElement).value = name;
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
