const simulation = new Simulation();
const view = new View();

const parameters: { symbol: string, dynamic: boolean, initial: number }[] = [];

function init(): void {
    onClick($('button-new-variable'), function () {
        // Create a new parameter
        const i = parameters.length;
        parameters.push({ symbol: `x_${i + 1}`, initial: 0.0, dynamic: false });
        // Update panel
        updateVariableDefinitions();
    });

    onClick($('button-reset'), () => {
        const variables: Physics.SymbolState = { symbols: [], state: [] };
        const constants: Physics.SymbolState = { symbols: [], state: [] };
        for (const p of parameters) {
            if (p.dynamic) {
                variables.symbols.push(p.symbol);
                variables.state.push(p.initial);
            } else {
                constants.symbols.push(p.symbol);
                constants.state.push(p.initial);
            }
        }
        simulation.stop();
        simulation.set({
            variables: variables,
            velocities: new Array(variables.symbols.length).fill(0),
            constants: constants,
            script: ($('render-script') as HTMLTextAreaElement).value,
            lagrangian: ($('lagrangian') as HTMLInputElement).value
        });
        simulation.render();
    });

    onClick($('button-start'), () => {
        simulation.start();
    });

    onClick($('button-stop'), () => {
        simulation.stop();
    });

    initView();

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
            view.zoom *= Math.exp(0.01 * event.deltaY);
        }
    });

    const dt = 1.0 / 60.0;
    setInterval(function () {
        view.center.x += view.centerSpeed.x / view.zoom * dt;
        view.center.y += view.centerSpeed.y / view.zoom * dt;
    }, 1000.0 * dt);
}

function updateVariableDefinitions(): void {
    const definitions = $('variable-definitions');
    clear(definitions);
    for (let i = 0; i < parameters.length; ++i) {
        const p = parameters[i];

        // Create new input fields
        const div = create('div', '', { 'class': 'variable-definition' });
        const inputName = create('input', '', { 'type': 'text', 'value': p.symbol });
        const inputValue = create('input', '', { 'type': 'text', 'value': `${p.initial}` });
        const inputDynamic = create('input', '', { 'type': 'checkbox' });
        const buttonRemove = create('span', '', { 'class': 'remove' });
        (inputDynamic as HTMLInputElement).checked = p.dynamic;

        // Change name
        onChange(inputName, function () { p.symbol = (this as HTMLInputElement).value; });
        // Change initial value
        onChange(inputValue, function () { p.initial = parseFloat((this as HTMLInputElement).value); });
        // Change dynamic status
        onChange(inputDynamic, function () { p.dynamic = (this as HTMLInputElement).checked; });
        // Click on remove
        onClick(buttonRemove, function () { parameters.splice(i); updateVariableDefinitions(); });
        // Add to definitions
        div.append(inputDynamic);
        div.append(inputName);
        div.append(inputValue);
        div.append(buttonRemove);
        definitions.append(div);
    }
}

window.onload = init;
