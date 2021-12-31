class Simulation {
    constructor() {
        this.description = {
            variables: { symbols: ['x'], values: [0], velocities: [0] },
            constants: { symbols: [], values: [] },
            script: '',
            lagrangian: '0'
        };
        this.system = null;
        this.renderFunction = null;
        this.interval = null;
    }
    refresh() {
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
        if (this.system == null)
            return false;
        try {
            const oldFillStyle = ctx.fillStyle;
            ctx.fillStyle = 'rgba(255, 255, 255, 1.0)';
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx.fillStyle = oldFillStyle;
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
            this.refresh();
        }
        catch (error) {
            console.log(`Failed to deserialize: ${error}`);
        }
    }
}
;
//# sourceMappingURL=simulator.js.map