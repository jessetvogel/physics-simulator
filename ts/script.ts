// declare var MathJax: any;
declare const renderMathInElement: (elem: HTMLElement, options: any) => void;

var simulator: Simulator = null;
var camera: Camera = null;

function init(): void {
    // Create simulator and camera
    simulator = new Simulator();
    camera = new Camera();

    // Handlers
    onClick($('button-add-variable'), function () {
        // Name for new symbol
        const name = ($('input-new-symbol') as HTMLInputElement).value;
        // Update description
        const d = simulator.description;
        d.variables.symbols.push(name);
        d.variables.values.push(0);
        d.variables.velocities.push(0);
        // Reset simulator & update layout
        simulator.reset();
        updateLayout();
    });

    onClick($('button-add-constant'), function () {
        // Name for new symbol
        const name = ($('input-new-symbol') as HTMLInputElement).value;
        // Update description
        const d = simulator.description;
        d.constants.symbols.push(name);
        d.constants.values.push(0);
        // Reset simulator & update layout
        simulator.reset();
        updateLayout();
    });

    onChange($('textarea-render-script'), function () {
        // Update description
        simulator.description.script = (this as HTMLTextAreaElement).value;
        // Reset simulator & update layout
        simulator.reset();
    });

    onChange($('input-lagrangian'), function () {
        // Update description
        simulator.description.lagrangian = (this as HTMLInputElement).value;
        // Reset simulator
        simulator.reset();
    })

    onClick($('button-start'), function () {
        if (simulator.isRunning()) {
            // Stop simulator
            if (simulator.stop()) {
                this.innerText = 'start';
                removeClass(this, 'pause');
            }
        } else {
            // Start simulator
            if (simulator.start()) {
                this.innerText = 'pause';
                addClass(this, 'pause');
            }
        }
    });

    onClick($('button-reset'), () => {
        // Update Lagrangian and script, and refresh
        simulator.description.lagrangian = ($('input-lagrangian') as HTMLInputElement).value;
        simulator.description.script = ($('textarea-render-script') as HTMLTextAreaElement).value;
        // Reset simulator & update layout
        simulator.reset();
        updateLayout();
    });

    onClick($('button-center'), () => {
        // Center the camera
        camera.center.x = 0.0;
        camera.center.y = 0.0;
        simulator.render();
    });

    onClick($('button-save-preset'), () => {
        const name = ($('input-preset-name') as HTMLInputElement).value;
        storePreset(name, simulator.description);
    });

    // Navigation handlers
    const speed = 250.0;
    onKeyDown(document.body, function (event) {
        if (document.activeElement == document.body) {
            if (event.key === 'ArrowLeft') camera.centerSpeed.x = -speed;
            if (event.key === 'ArrowRight') camera.centerSpeed.x = speed;
            if (event.key === 'ArrowUp') camera.centerSpeed.y = speed;
            if (event.key === 'ArrowDown') camera.centerSpeed.y = -speed;
        }
    });

    onKeyUp(document.body, function (event) {
        if (document.activeElement == document.body) {
            if (event.key === 'ArrowLeft') camera.centerSpeed.x = 0.0;
            if (event.key === 'ArrowRight') camera.centerSpeed.x = 0.0;
            if (event.key === 'ArrowUp') camera.centerSpeed.y = 0.0;
            if (event.key === 'ArrowDown') camera.centerSpeed.y = 0.0;
        }
    });

    onWheel(document.body, function (event) {
        if (document.activeElement == document.body) {
            camera.zoom *= Math.exp(-0.005 * event.deltaY);
            simulator.render();
            setScale();
        }
    });

    const dt = 1.0 / 30.0;
    setInterval(function () {
        if (camera.centerSpeed.x != 0.0 || camera.centerSpeed.y != 0.0) {
            camera.center.x += camera.centerSpeed.x / camera.zoom * dt;
            camera.center.y += camera.centerSpeed.y / camera.zoom * dt;
            simulator.render();
        }
    }, 1000.0 * dt);

    // Other inits
    initView();
    initPresets();
    initTheme();

    // Update layout
    updateLayout();

    // Initial render
    setTimeout(() => simulator.render(), 10);
}

window.onload = init;

function updateLayout(): void {
    const d = simulator.description;
    // Lagrangian and render script
    ($('input-lagrangian') as HTMLInputElement).value = d.lagrangian;
    const textarea = $('textarea-render-script') as HTMLTextAreaElement;
    textarea.value = d.script;
    textarea.style.height = '1px'; textarea.style.height = textarea.scrollHeight + 'px';
    // Table of symbols
    const table = $('symbols-list');
    clear(table);
    table.append(create('span'));
    table.append(create('span', { class: 'table-header' }, 'value'));
    table.append(create('span', { class: 'table-header' }, 'velocity'));
    table.append(create('span'));
    const items: [Physics.SymbolState, number][] = [];
    for (let i = 0; i < d.variables.symbols.length; ++i) items.push([d.variables, i]);
    for (let i = 0; i < d.constants.symbols.length; ++i) items.push([d.constants, i]);
    for (const [list, i] of items) {
        table.append(create('span', { 'class': 'symbol' }, `\\(${list.symbols[i]}\\)`));
        table.append(create('input', {
            'placeholder': 'value', 'value': `${list.values[i]}`, '@change': function () {
                const f = parseFloat(this.value);
                if (f == f) list.values[i] = f;
            }
        }));
        if ('velocities' in list) {
            table.append(create('input', {
                'placeholder': 'velocity', 'value': `${list.velocities[i]}`, '@change': function () {
                    const f = parseFloat(this.value);
                    if (f == f) list.velocities[i] = f;
                }
            }));
        } else {
            table.append(create('span'));
        }
        table.append(create('span', {
            'class': 'remove', '@click': () => {
                list.symbols.splice(i, 1);
                list.values.splice(i, 1);
                list.velocities.splice(i, 1);
                updateLayout();
            }
        }));
    }

    typeset(table);
    setEquations();
}

function setEquations() {
    if (simulator.system != null) {
        const equations = $('equations');
        let html = '';
        if (simulator.system.equations.length > 0) {
            html += '<div class="heading">Equations of motion</div>';
            html += simulator.system.equations.map(eq => `<div class="equation">\\(${Algebra.toTex(eq)} = 0\\)</div>`).join('');
        }
        setHTML(equations, html);
        typeset(equations);
    }
}

function setScale() {
    const scale = $('scale');
    const length = 64.0 / camera.zoom;
    let text;

    if (length < 0.01) text = `${(length * 1000.0).toFixed(2)} mm`;
    if (length >= 0.01 && length < 1.0) text = `${(length * 100.0).toFixed(2)} cm`;
    if (length >= 1.0 && length < 1000.0) text = `${length.toFixed(2)} m`;
    if (length >= 1000.0) text = `${(length / 1000.0).toFixed(2)} km`;

    setText(scale, text);
}

function initTheme(): void {
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const cookieTheme = getCookie('theme');
    if (cookieTheme !== null)
        setTheme(cookieTheme === 'dark');
    else
        setTheme(prefersDark);
    onClick($('button-theme'), function () {
        document.cookie = `theme=${setTheme(null) ? 'dark' : 'light'}`;
    });
    setTimeout(function () { // little hack to prevent initial transition, but it works
        const sheet = window.document.styleSheets[0];
        sheet.insertRule('* { transition: background-color 0.5s, color 0.5s, filter 0.5s; }', sheet.cssRules.length);
    }, 100);
}

function setTheme(dark: boolean): boolean {
    if (dark === true) {
        document.body.classList.add('dark');
        return true;
    }
    if (dark === false) {
        document.body.classList.remove('dark');
        return false;
    }

    setTimeout(() => simulator.render(), 10);
    return setTheme(!document.body.classList.contains('dark'));
}

function typeset(elem: HTMLElement): void {
    // Typeset math
    if ('renderMathInElement' in window)
        renderMathInElement(elem, KaTeXOptions);
}
