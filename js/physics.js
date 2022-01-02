var Physics;
(function (Physics) {
    class System {
        constructor() {
            this.variables = { symbols: [], values: [], velocities: [] };
            this.constants = { symbols: [], values: [] };
            this.timeDerivatives = {};
            this.lagrangian = null;
            this.equations = [];
            this.acceleration = null;
        }
        addVariable(x, x0, v0) {
            const v = `d${x}`;
            const a = `dd${x}`;
            this.timeDerivatives[x] = v;
            this.timeDerivatives[v] = a;
            this.variables.symbols.push(x);
            this.variables.values.push(x0);
            this.variables.velocities.push(v0);
        }
        addConstant(c, c0) {
            this.constants.symbols.push(c);
            this.constants.values.push(c0);
        }
        setLagrangian(lagrangian) {
            this.lagrangian = lagrangian;
            const parser = new Parser.Parser(lagrangian);
            const symbols = [
                ...this.variables.symbols,
                ...this.variables.symbols.map(x => `d${x}`),
                ...this.constants.symbols
            ];
            parser.setSymbols(symbols);
            const L = parser.parse();
            this.equations = [];
            for (const x of this.variables.symbols) {
                const v = this.timeDerivatives[x];
                const dLdx = Algebra.derivative(L, Algebra.symbol(x));
                const dLdv = Algebra.derivative(L, Algebra.symbol(v));
                const ddLdvdt = Algebra.timeDerivative(dLdv, this.timeDerivatives);
                const eq = Algebra.subtract(dLdx, ddLdvdt);
                this.equations.push(Algebra.simplify(eq));
            }
            const n = this.variables.symbols.length;
            const A = new Array(n);
            const b = new Array(n);
            const as = this.variables.symbols.map(x => `dd${x}`);
            for (let i = 0; i < n; ++i) {
                const coeffs = Algebra.coefficients(this.equations[i], as);
                A[i] = coeffs.slice(0, n);
                b[i] = Algebra.negate(coeffs[n]);
            }
            const functionA = new Function(...symbols, `return [${A.map(row => `[${row.map(x => Algebra.toJS(x)).join(',')}]`).join(',')}];`);
            const functionB = new Function(...symbols, `return [${b.map(x => `[${Algebra.toJS(x)}]`).join(',')}];`);
            this.acceleration = function (...args) {
                const A = functionA(...args);
                const b = functionB(...args);
                const a = math.lusolve(A, b).map(row => row[0]);
                return a;
            };
        }
        update(dt) {
            try {
                const varK1 = [...this.variables.values];
                const varK2 = [...this.variables.values];
                const varK3 = [...this.variables.values];
                const velK1 = [...this.variables.velocities];
                const velK2 = [...this.variables.velocities];
                const velK3 = [...this.variables.velocities];
                const k1 = this.acceleration(...this.variables.values, ...this.variables.velocities, ...this.constants.values);
                updateState(varK1, velK1, k1, dt / 2);
                const k2 = this.acceleration(...varK1, ...velK1, ...this.constants.values);
                updateState(varK2, velK2, k2, dt / 2);
                const k3 = this.acceleration(...varK2, ...velK2, ...this.constants.values);
                updateState(varK3, velK3, k3, dt);
                const k4 = this.acceleration(...varK3, ...velK3, ...this.constants.values);
                const n = this.variables.symbols.length;
                const k = new Array(n);
                for (let i = 0; i < n; ++i)
                    k[i] = (k1[i] + 2.0 * k2[i] + 2.0 * k3[i] + k4[i]) / 6.0;
                updateState(this.variables.values, this.variables.velocities, k, dt);
                return true;
            }
            catch (error) {
                console.log('ERROR IN UPDATE:', error);
                return false;
            }
        }
    }
    Physics.System = System;
    ;
})(Physics || (Physics = {}));
function updateState(xs, vs, as, dt) {
    const n = xs.length;
    for (let i = 0; i < n; ++i) {
        xs[i] += vs[i] * dt + 0.5 * as[i] * dt * dt;
        vs[i] += as[i] * dt;
    }
}
//# sourceMappingURL=physics.js.map