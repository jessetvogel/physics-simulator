namespace Physics {

    export type State = number[];
    export type SymbolState = { symbols: string[], state: State };

    export class System {
        variables: SymbolState;
        velocities: SymbolState;
        constants: SymbolState;
        lagrangian: string;

        timeDerivatives: { [key: string]: string };
        equations: Algebra.Expression[];
        acceleration: (...args: number[]) => number[];

        constructor() {
            this.variables = { symbols: [], state: [] };
            this.velocities = { symbols: [], state: [] };
            this.constants = { symbols: [], state: [] };
            this.timeDerivatives = {};
            this.lagrangian = null;
            this.equations = [];
            this.acceleration = null;
        }

        addVariable(x: string, x0: number, v0: number): void {
            // Create velocity and acceleration symbols
            const v = `d${x}`;
            const a = `dd${x}`;
            this.timeDerivatives[x] = v;
            this.timeDerivatives[v] = a;
            this.variables.symbols.push(x);
            this.variables.state.push(x0);
            this.velocities.symbols.push(v);
            this.velocities.state.push(v0);
        }

        addConstant(c: string, c0: number): void {
            this.constants.symbols.push(c);
            this.constants.state.push(c0);
        }

        setLagrangian(lagrangian: string) {
            // Store Lagrangian (string)
            this.lagrangian = lagrangian;

            // Parse Lagrangian
            const parser = new Parser.Parser(lagrangian);
            const symbols = [
                ...this.variables.symbols,
                ...this.velocities.symbols,
                ...this.constants.symbols
            ];
            parser.setSymbols(symbols);
            const L = parser.parse();

            // Compute Euler--Lagrange equations
            this.equations = [];
            for (const x of this.variables.symbols) {
                // Obtain velocity symbol
                const v = this.timeDerivatives[x];

                // Take derivatives of Lagrangian
                const dLdx = Algebra.derivative(L, Algebra.symbol(x));
                const dLdv = Algebra.derivative(L, Algebra.symbol(v));
                const ddLdvdt = Algebra.timeDerivative(dLdv, this.timeDerivatives);

                // console.log('dL/dx = ', dLdx.toString());
                // console.log('dL/dv = ', dLdv.toString());
                // console.log('ddL/dv/dt = ', ddLdvdt.toString());

                // Euler--Lagrange equation
                const eq = Algebra.subtract(dLdx, ddLdvdt);
                this.equations.push(Algebra.simplify(eq));
            }

            // console.log('Lagrangian: ', this.lagrangian.toString());
            // for (const eq of this.equations)
            // console.log('Equation: ', math.simplify(eq).toString());

            // Write equations as a linear system A * a = b, where a is the acceleration vector
            const n = this.variables.symbols.length;
            const A = new Array<Array<Algebra.Expression>>(n);
            const b = new Array<Algebra.Expression>(n);

            // We want to determine the accelerations, so write each equation as a polynomial in the accelerations
            const as = this.velocities.symbols.map(v => this.timeDerivatives[v]);
            for (let i = 0; i < n; ++i) {
                const coeffs = Algebra.coefficients(this.equations[i], as);
                A[i] = coeffs.slice(0, n);
                b[i] = coeffs[n];
            }

            // Function to compute acceleration
            const functionA = new Function(...symbols, `return [${A.map(row => `[${row.map(x => Algebra.toJS(x)).join(',')}]`).join(',')}];`);
            const functionB = new Function(...symbols, `return [${b.map(x => `[${Algebra.toJS(x)}]`).join(',')}];`);

            // console.log(functionA.toString());
            // console.log(functionB.toString());

            // Set update function
            this.acceleration = function (...args: number[]): number[] {
                const A = functionA(...args);
                const b = functionB(...args);

                const a = math.lusolve(A, b).map(row => row[0]) as number[];

                // console.log(`${A}`);
                // console.log(`${b}`);
                // console.log(`${a}`);

                return a;
            }
        }

        update(dt: number): void {
            try {
                // Forward Euler
                // const a = this.acceleration(...this.variables.state, ...this.velocities.state, ...this.constants.state);
                // updateState(this.variables.state, this.velocities.state, a, dt);

                // RK4 method
                const varK1 = [...this.variables.state];
                const varK2 = [...this.variables.state];
                const varK3 = [...this.variables.state];
                const velK1 = [...this.velocities.state];
                const velK2 = [...this.velocities.state];
                const velK3 = [...this.velocities.state];

                const k1 = this.acceleration(...this.variables.state, ...this.velocities.state, ...this.constants.state);
                updateState(varK1, velK1, k1, dt / 2);
                const k2 = this.acceleration(...varK1, ...velK1, ...this.constants.state);
                updateState(varK2, velK2, k2, dt / 2);
                const k3 = this.acceleration(...varK2, ...velK2, ...this.constants.state);
                updateState(varK3, velK3, k3, dt);
                const k4 = this.acceleration(...varK3, ...velK3, ...this.constants.state);

                const n = this.variables.symbols.length;
                const k = new Array<number>(n);
                for (let i = 0; i < n; ++i)
                    k[i] = (k1[i] + 2.0 * k2[i] + 2.0 * k3[i] + k4[i]) / 6.0;

                updateState(this.variables.state, this.velocities.state, k, dt);
            } catch (error) {
                console.log('ERROR IN UPDATE:', error);
            }
        }
    };
}

function updateState(xs: number[], vs: number[], as: number[], dt: number) {
    const n = xs.length;
    for (let i = 0; i < n; ++i) {
        xs[i] += vs[i] * dt + 0.5 * as[i] * dt * dt;
        vs[i] += as[i] * dt;
    }
}
