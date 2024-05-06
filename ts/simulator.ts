type SimulatorDescription = {
    variables: Physics.SymbolState,
    constants: Physics.SymbolState,
    script: string,
    lagrangian: string
};

class Simulator {
    description: SimulatorDescription;
    system: Physics.System;
    renderFunction: Function;
    interval: number;

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

    reset(): void {
        try {
            const d = this.description;
            // Set physics
            this.system = new Physics.System();
            for (let i = 0; i < d.variables.symbols.length; ++i)
                this.system.addVariable(d.variables.symbols[i], d.variables.values[i], d.variables.velocities[i]);
            for (let i = 0; i < d.constants.symbols.length; ++i)
                this.system.addConstant(d.constants.symbols[i], d.constants.values[i]);
            this.system.setLagrangian(d.lagrangian);

            // Set render function
            const symbols = [
                ...this.system.variables.symbols,
                ...this.system.variables.symbols.map(x => `d${x}`),
                ...this.system.constants.symbols
            ];
            this.renderFunction = new Function(...symbols, d.script);
            this.render(); // draw first frame already
        } catch (error) {
            console.log('ERROR:', error);
        }
    }

    update(dt: number): void {
        if (!this.system.update(dt)) this.stop();
        if (!this.render()) this.stop();
    }

    render(): boolean {
        try {
            // Clear canvas
            // const oldFillStyle = ctx.fillStyle;
            // ctx.fillStyle = 'rgba(0, 0, 0, 0.)';
            // ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            // ctx.fillStyle = oldFillStyle;
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

            // Render grid
            this.renderGrid();

            // Draw foreground
            ctx.strokeStyle = getComputedStyle(document.body).getPropertyValue('--clr-text');
            if (this.renderFunction === null)
                return false;
            this.renderFunction(
                ...this.system.variables.values,
                ...this.system.variables.velocities,
                ...this.system.constants.values
            );
            return true;
        } catch (error) {
            console.log('ERROR IN RENDER:', error);
            return false;
        }
    }

    renderGrid(): void {
        // Draw grid
        const gridUnitMin = 16.0;
        const gridUnitStep = 5.0;
        let gridUnit = camera.world2view(1.0);
        let gridOrigin = camera.world2view({ x: 0.0, y: 0.0 });
        while (gridUnit >= gridUnitMin * gridUnitStep) gridUnit /= gridUnitStep;
        while (gridUnit < gridUnitMin) gridUnit *= gridUnitStep;

        ctx.strokeStyle = getComputedStyle(document.body).getPropertyValue('--clr-grid');;

        let x = gridOrigin.x - gridUnit * Math.floor(gridOrigin.x / gridUnit);
        while (x < ctx.canvas.width) {
            ctx.beginPath();
            ctx.moveTo(x, 0.0);
            ctx.lineTo(x, ctx.canvas.height);
            ctx.stroke();
            x += gridUnit;
        }
        let y = gridOrigin.y - gridUnit * Math.floor(gridOrigin.y / gridUnit);
        while (y < ctx.canvas.height) {
            ctx.beginPath();
            ctx.moveTo(0.0, y);
            ctx.lineTo(ctx.canvas.width, y);
            ctx.stroke();
            y += gridUnit;
        }
    }

    isRunning(): boolean {
        return this.interval !== null;
    }

    start(): boolean {
        if (this.system == null) return false;
        if (this.renderFunction == null) return false;
        if (this.system.acceleration == null) return false;
        this.stop();
        const dt = 1.0 / 60.0;
        const simulator = this;
        this.interval = setInterval(function () { simulator.update(dt); }, dt * 1000.0);
        return true;
    }

    stop(): boolean {
        if (this.isRunning()) {
            clearInterval(this.interval);
            this.interval = null;
            return true;
        }
        return false;
    }

    serialize(): string {
        return utf8_to_b64(JSON.stringify(this.description));
    }

    deserialize(str: string): void {
        try {
            const description = JSON.parse(b64_to_utf8(str));
            this.description = description;
            this.reset();
        } catch (error) {
            console.log(`Failed to deserialize: ${error}`);
        }
    }
};
