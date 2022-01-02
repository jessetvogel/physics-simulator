const simulation = new Simulation();
const view = new View();
function init() {
    onClick($('button-add-variable'), function () {
        const name = $('input-new-symbol').value;
        const d = simulation.description;
        d.variables.symbols.push(name);
        d.variables.values.push(0);
        d.variables.velocities.push(0);
        simulation.reset();
        updateLayout();
    });
    onClick($('button-add-constant'), function () {
        const name = $('input-new-symbol').value;
        const d = simulation.description;
        d.constants.symbols.push(name);
        d.constants.values.push(0);
        simulation.reset();
        updateLayout();
    });
    onChange($('textarea-render-script'), function () {
        simulation.description.script = this.value;
        simulation.reset();
    });
    onChange($('input-lagrangian'), function () {
        simulation.description.lagrangian = this.value;
        simulation.reset();
    });
    onClick($('button-start'), function () {
        if (simulation.isRunning()) {
            if (simulation.stop())
                removeClass(this, 'pause');
        }
        else {
            if (simulation.start())
                addClass(this, 'pause');
        }
    });
    onClick($('button-reset'), () => {
        simulation.description.lagrangian = $('input-lagrangian').value;
        simulation.description.script = $('textarea-render-script').value;
        simulation.reset();
        updateLayout();
    });
    onClick($('button-save-preset'), () => {
        const name = $('input-preset-name').value;
        storePreset(name, simulation.description);
    });
    const speed = 250.0;
    onKeyDown(document.body, function (event) {
        if (document.activeElement == document.body) {
            if (event.key === 'ArrowLeft')
                view.centerSpeed.x = -speed;
            if (event.key === 'ArrowRight')
                view.centerSpeed.x = speed;
            if (event.key === 'ArrowUp')
                view.centerSpeed.y = speed;
            if (event.key === 'ArrowDown')
                view.centerSpeed.y = -speed;
        }
    });
    onKeyUp(document.body, function (event) {
        if (document.activeElement == document.body) {
            if (event.key === 'ArrowLeft')
                view.centerSpeed.x = 0.0;
            if (event.key === 'ArrowRight')
                view.centerSpeed.x = 0.0;
            if (event.key === 'ArrowUp')
                view.centerSpeed.y = 0.0;
            if (event.key === 'ArrowDown')
                view.centerSpeed.y = 0.0;
        }
    });
    onWheel(document.body, function (event) {
        if (document.activeElement == document.body) {
            view.zoom *= Math.exp(-0.005 * event.deltaY);
            simulation.render();
            setScale();
        }
    });
    const dt = 1.0 / 30.0;
    setInterval(function () {
        if (view.centerSpeed.x != 0.0 || view.centerSpeed.y != 0.0) {
            view.center.x += view.centerSpeed.x / view.zoom * dt;
            view.center.y += view.centerSpeed.y / view.zoom * dt;
            simulation.render();
        }
    }, 1000.0 * dt);
    initView();
    initPresets();
    updateLayout();
}
window.onload = init;
function updateLayout() {
    const d = simulation.description;
    $('input-lagrangian').value = d.lagrangian;
    const textarea = $('textarea-render-script');
    textarea.value = d.script;
    textarea.style.height = '1px';
    textarea.style.height = textarea.scrollHeight + 'px';
    const table = $('symbols-list');
    clear(table);
    const items = [];
    for (let i = 0; i < d.variables.symbols.length; ++i)
        items.push([d.variables, i]);
    for (let i = 0; i < d.constants.symbols.length; ++i)
        items.push([d.constants, i]);
    for (const [list, i] of items) {
        table.append(create('span', { 'class': 'symbol' }, `$${list.symbols[i]}$`));
        table.append(create('input', {
            'placeholder': 'value', 'value': `${list.values[i]}`, '@change': function () {
                const f = parseFloat(this.value);
                if (f == f)
                    list.values[i] = f;
            }
        }));
        if ('velocities' in list) {
            table.append(create('input', {
                'placeholder': 'velocity', 'value': `${list.velocities[i]}`, '@change': function () {
                    const f = parseFloat(this.value);
                    if (f == f)
                        list.velocities[i] = f;
                }
            }));
        }
        else {
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
    MathJax.typeset([table]);
    setEquations();
}
function setEquations() {
    if (simulation.system != null) {
        const equations = $('equations');
        setHTML(equations, simulation.system.equations.map(eq => `<div>$${Algebra.toTex(eq)} = 0$</div>`).join(''));
        MathJax.typeset([equations]);
    }
}
function setScale() {
    const scale = $('scale');
    const length = 64.0 / view.zoom;
    let text;
    if (length < 0.01)
        text = `${(length * 1000.0).toFixed(2)}mm`;
    if (length >= 0.01 && length < 1.0)
        text = `${(length * 100.0).toFixed(2)}cm`;
    if (length >= 1.0 && length < 1000.0)
        text = `${length.toFixed(2)}m`;
    if (length >= 1000.0)
        text = `${(length / 1000.0).toFixed(2)}km`;
    setText(scale, text);
}
//# sourceMappingURL=script.js.map