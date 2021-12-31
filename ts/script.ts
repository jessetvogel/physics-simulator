declare var MathJax: any;

const simulation = new Simulation();
const view = new View();

// const parameters: { symbol: string, dynamic: boolean, initial: number }[] = [];

function init(): void {
    onClick($('button-add-variable'), function () {
        // Name for new symbol
        const name = ($('input-new-symbol') as HTMLInputElement).value;
        // Update description
        const d = simulation.description;
        d.variables.symbols.push(name);
        d.variables.values.push(0);
        d.variables.velocities.push(0);
        // Refresh simulation
        simulation.refresh();
        // Update panel
        updateVariableDefinitions();
    });

    onClick($('button-add-constant'), function () {
        // Name for new symbol
        const name = ($('input-new-symbol') as HTMLInputElement).value;
        // Update description
        const d = simulation.description;
        d.constants.symbols.push(name);
        d.constants.values.push(0);
        // Refresh simulation
        simulation.refresh();
        // Update panel
        updateVariableDefinitions();
    });

    onChange($('textarea-render-script'), function () {
        // Update description
        simulation.description.script = (this as HTMLTextAreaElement).value;
        // Refresh simulation
        simulation.refresh();
    });

    onChange($('input-lagrangian'), function () {
        // Update description
        simulation.description.lagrangian = (this as HTMLInputElement).value;
        // Refresh simulation
        simulation.refresh();
    })

    onClick($('button-start'), function () {
        if (simulation.isRunning()) {
            // Stop simulation
            if (simulation.stop()) removeClass(this, 'pause');
        } else {
            // Start simulation
            if (simulation.start()) addClass(this, 'pause');
        }
    });

    onClick($('button-reset'), () => {
        // Update Lagrangian and script, and refresh
        simulation.description.lagrangian = ($('input-lagrangian') as HTMLInputElement).value;
        simulation.description.script = ($('textarea-render-script') as HTMLTextAreaElement).value;
        simulation.refresh();
        simulation.render();

        setEquations();
    });

    initView();
    updateVariableDefinitions();

    // View navigation
    const sp = 400.0;
    onKeyDown(document.body, function (event) {
        if (document.activeElement == document.body) {
            if (event.key === 'ArrowLeft') view.centerSpeed.x = -sp;
            if (event.key === 'ArrowRight') view.centerSpeed.x = sp;
            if (event.key === 'ArrowUp') view.centerSpeed.y = sp;
            if (event.key === 'ArrowDown') view.centerSpeed.y = -sp;
        }
    });

    onKeyUp(document.body, function (event) {
        if (document.activeElement == document.body) {
            if (event.key === 'ArrowLeft') view.centerSpeed.x = 0.0;
            if (event.key === 'ArrowRight') view.centerSpeed.x = 0.0;
            if (event.key === 'ArrowUp') view.centerSpeed.y = 0.0;
            if (event.key === 'ArrowDown') view.centerSpeed.y = 0.0;
        }
    });

    onWheel(document.body, function (event) {
        if (document.activeElement == document.body) {
            view.zoom *= Math.exp(0.005 * event.deltaY);
            simulation.render();
            setScale();
        }
    });

    const dt = 1.0 / 60.0;
    setInterval(function () {
        if (view.centerSpeed.x != 0.0 || view.centerSpeed.y != 0.0) {
            view.center.x += view.centerSpeed.x / view.zoom * dt;
            view.center.y += view.centerSpeed.y / view.zoom * dt;
            simulation.render();
        }
    }, 1000.0 * dt);
}

function updateVariableDefinitions(): void {
    const table = $('symbols');
    clear(table);

    const d = simulation.description;
    for (let i = 0; i < d.variables.symbols.length; ++i) {
        table.append(create('tr', {}, [
            create('td', { 'class': 'symbol' }, `$${d.variables.symbols[i]}$`),
            create('td', {}, create('input', {
                'placeholder': 'value', 'value': `${d.variables.values[i]}`, '@change': function () {
                    const f = parseFloat(this.value);
                    if (f == f) d.variables.values[i] = f;
                }
            })),
            create('td', {}, create('input', {
                'placeholder': 'velocity', 'value': `${d.variables.velocities[i]}`, '@change': function () {
                    const f = parseFloat(this.value);
                    if (f == f) d.variables.velocities[i] = f;
                }
            })),
            create('td', {}, create('span', {
                'class': 'remove', '@click': () => {
                    d.variables.symbols.splice(i, 1);
                    d.variables.values.splice(i, 1);
                    d.variables.velocities.splice(i, 1);
                    updateVariableDefinitions();
                }
            }))
        ]));
    }

    for (let i = 0; i < d.constants.symbols.length; ++i) {
        table.append(create('tr', {}, [
            create('td', { 'class': 'symbol' }, `$${d.constants.symbols[i]}$`),
            create('td', {}, create('input', {
                'placeholder': 'value', 'value': `${d.constants.values[i]}`, '@change': function () {
                    const f = parseFloat(this.value);
                    if (f == f) d.constants.values[i] = f;
                }
            })),
            create('td'),
            create('td', {}, create('span', {
                'class': 'remove', '@click': () => {
                    d.constants.symbols.splice(i, 1);
                    d.constants.values.splice(i, 1);
                    updateVariableDefinitions();
                }
            }))
        ]));
    }

    MathJax.typeset([table]);
}

window.onload = init;


function setEquations() {
    const equations = $('equations');
    setHTML(equations, simulation.system.equations.map(eq => `<div>$${eq.toTex().replace(/\b(dd)(\w+)/g, '\\$1ot{$2}').replace(/\\cdot/g, '')} = 0$</div>`).join(''));
    MathJax.typeset([equations]);
}

function setScale() {
    const scale = $('scale');
    const length = 64.0 / view.zoom;
    let text;

    if (length < 0.01) text = `${(length * 1000.0).toFixed(2)}mm`;
    if (length >= 0.01 && length < 1.0) text = `${(length * 100.0).toFixed(2)}cm`;
    if (length >= 1.0 && length < 1000.0) text = `${length.toFixed(2)}m`;
    if (length >= 1000.0) text = `${(length / 1000.0).toFixed(2)}km`;

    setText(scale, text);
}
