type SimulationDefinition = {
    variables: Physics.SymbolState,
    velocities: number[],
    constants: Physics.SymbolState,
    script: string,
    lagrangian: string
};

class Simulation {
    definition: SimulationDefinition;
    system: Physics.System;
    renderFunction: Function;
    interval: number;

    constructor() {
        this.definition = null;
        this.system = null;
        this.renderFunction = null;
        this.interval = null;
    }

    set(def: SimulationDefinition): void {
        try {
            // Store definition
            this.definition = def;

            // Set physics
            this.system = new Physics.System();
            for (let i = 0; i < def.variables.symbols.length; ++i)
                this.system.addVariable(def.variables.symbols[i], def.variables.state[i], def.velocities[i]);
            for (let i = 0; i < def.constants.symbols.length; ++i)
                this.system.addConstant(def.constants.symbols[i], def.constants.state[i]);
            this.system.setLagrangian(def.lagrangian);

            // Set render function
            const symbols = [
                ...this.system.variables.symbols,
                ...this.system.velocities.symbols,
                ...this.system.constants.symbols
            ];
            this.renderFunction = new Function(...symbols, def.script);
        } catch (error) {
            console.log('ERROR:', error);
        }
    }

    update(dt: number): void {
        this.system.update(dt);
        this.render();
    }

    render(): void {
        try {
            const oldFillStyle = ctx.fillStyle;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx.fillStyle = oldFillStyle;
            this.renderFunction(
                ...this.system.variables.state,
                ...this.system.velocities.state,
                ...this.system.constants.state
            );
        } catch (error) {
            console.log('ERROR IN RENDER:', error);
        }
    }

    isRunning(): boolean {
        return this.interval !== null;
    }

    start(): void {
        this.stop();
        const dt = 1.0 / 60.0;
        const simulator = this;
        this.interval = setInterval(function () { simulator.update(dt); }, dt * 1000.0);
    }

    stop(): void {
        if (this.isRunning()) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }

    serialize(): string {
        return utf8_to_b64(JSON.stringify(this.definition));
    }

    deserialize(str: string): void {
        try {
            const definition = JSON.parse(b64_to_utf8(str));
            this.set(definition)
        } catch (error) {
            console.log(`Failed to deserialize: ${error}`);
        }
    }
};

