class Simulation {
    constructor() {
        this.definition = null;
        this.system = null;
        this.renderFunction = null;
        this.interval = null;
    }
    set(def) {
        try {
            this.definition = def;
            this.system = new Physics.System();
            for (let i = 0; i < def.variables.symbols.length; ++i)
                this.system.addVariable(def.variables.symbols[i], def.variables.state[i], def.velocities[i]);
            for (let i = 0; i < def.constants.symbols.length; ++i)
                this.system.addConstant(def.constants.symbols[i], def.constants.state[i]);
            this.system.setLagrangian(def.lagrangian);
            const symbols = [
                ...this.system.variables.symbols,
                ...this.system.velocities.symbols,
                ...this.system.constants.symbols
            ];
            this.renderFunction = new Function(...symbols, def.script);
        }
        catch (error) {
            console.log('ERROR:', error);
        }
    }
    update(dt) {
        this.system.update(dt);
        this.render();
    }
    render() {
        try {
            const oldFillStyle = ctx.fillStyle;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx.fillStyle = oldFillStyle;
            this.renderFunction(...this.system.variables.state, ...this.system.velocities.state, ...this.system.constants.state);
        }
        catch (error) {
            console.log('ERROR IN RENDER:', error);
        }
    }
    isRunning() {
        return this.interval !== null;
    }
    start() {
        this.stop();
        const dt = 1.0 / 60.0;
        const simulator = this;
        this.interval = setInterval(function () { simulator.update(dt); }, dt * 1000.0);
    }
    stop() {
        if (this.isRunning()) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }
    serialize() {
        return utf8_to_b64(JSON.stringify(this.definition));
    }
    deserialize(str) {
        try {
            const definition = JSON.parse(b64_to_utf8(str));
            this.set(definition);
        }
        catch (error) {
            console.log(`Failed to deserialize: ${error}`);
        }
    }
}
;
//# sourceMappingURL=simulator.js.map