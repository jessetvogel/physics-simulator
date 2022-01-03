class Simulation {
    constructor() {
        this.description = {
            variables: { symbols: ['x'], values: [0], velocities: [0] },
            constants: { symbols: [], values: [] },
            script: '',
            lagrangian: '0'
        };
        this.system = new Physics.System();
        this.renderFunction = null;
        this.interval = null;
    }
    reset() {
        try {
            const d = this.description;
            this.system = new Physics.System();
            for (let i = 0; i < d.variables.symbols.length; ++i)
                this.system.addVariable(d.variables.symbols[i], d.variables.values[i], d.variables.velocities[i]);
            for (let i = 0; i < d.constants.symbols.length; ++i)
                this.system.addConstant(d.constants.symbols[i], d.constants.values[i]);
            this.system.setLagrangian(d.lagrangian);
            const symbols = [
                ...this.system.variables.symbols,
                ...this.system.variables.symbols.map(x => `d${x}`),
                ...this.system.constants.symbols
            ];
            this.renderFunction = new Function(...symbols, d.script);
            simulation.render();
        }
        catch (error) {
            console.log('ERROR:', error);
        }
    }
    update(dt) {
        if (!this.system.update(dt))
            this.stop();
        if (!this.render())
            this.stop();
    }
    render() {
        if (this.renderFunction === null)
            return false;
        try {
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx.strokeStyle = getComputedStyle(document.body).getPropertyValue('--clr-text');
            this.renderFunction(...this.system.variables.values, ...this.system.variables.velocities, ...this.system.constants.values);
            return true;
        }
        catch (error) {
            console.log('ERROR IN RENDER:', error);
            return false;
        }
    }
    isRunning() {
        return this.interval !== null;
    }
    start() {
        if (this.system == null)
            return false;
        if (this.renderFunction == null)
            return false;
        if (this.system.acceleration == null)
            return false;
        this.stop();
        const dt = 1.0 / 60.0;
        const simulator = this;
        this.interval = setInterval(function () { simulator.update(dt); }, dt * 1000.0);
        return true;
    }
    stop() {
        if (this.isRunning()) {
            clearInterval(this.interval);
            this.interval = null;
            return true;
        }
        return false;
    }
    serialize() {
        return utf8_to_b64(JSON.stringify(this.description));
    }
    deserialize(str) {
        try {
            const description = JSON.parse(b64_to_utf8(str));
            this.description = description;
            this.reset();
        }
        catch (error) {
            console.log(`Failed to deserialize: ${error}`);
        }
    }
}
;
//# sourceMappingURL=simulator.js.map