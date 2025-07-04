// Makes use of math.js

namespace Algebra {
    export type Symbol = math.SymbolNode;
    export type Expression = math.MathNode;

    export function add(x: Expression, y: Expression): Expression {
        return new math.OperatorNode('+', 'add', [x, y]);
    }

    export function negate(x: Expression): Expression {
        return new math.OperatorNode('-', 'unaryMinus', [x]);
    }

    export function subtract(x: Expression, y: Expression): Expression {
        return new math.OperatorNode('-', 'subtract', [x, y]);
    }

    export function multiply(x: Expression, y: Expression): Expression {
        return new math.OperatorNode('*', 'multiply', [x, y]);
    }

    export function divide(x: Expression, y: Expression): Expression {
        return new math.OperatorNode('/', 'divide', [x, y]);
    }

    export function pow(x: Expression, y: Expression): Expression {
        return new math.OperatorNode('^', 'pow', [x, y]);
    }

    export function func(fn: string, args: Expression[]): Expression {
        return new math.FunctionNode(fn, args);
    }

    export function derivative(f: Expression, x: Symbol): Expression {
        return math.derivative(f, x);
    }

    export function symbol(name: string): Symbol {
        return new math.SymbolNode(name);
    }

    export function constant(str: string): Expression {
        return math.parse(str);
    }

    export function subsitute(expr: Expression, dict: { [key: string]: Expression }): Expression {
        return math.simplify(expr, dict);
    }

    export function simplify(expr: Expression): Expression {
        return math.simplify(expr);
    }

    export function coefficients(expr: Expression, symbols: string[]): Expression[] {
        const coefficients = new Array<Expression>(symbols.length + 1);
        // Coefficients for symbols
        for (let i = 0; i < symbols.length; ++i)
            coefficients[i] = subsitute(subtract(expr, subsitute(expr, { [symbols[i]]: constant('0') })), { [symbols[i]]: constant('1') });

        // The constant coefficient
        const dict: { [k: string]: Expression } = {};
        for (const x of symbols) dict[x] = constant('0');
        coefficients[symbols.length] = simplify(subsitute(expr, dict));

        // Since `simplify` cannot do everything, it sometimes happens that some symbols are still present in the coefficients, even though they should not be.
        // Hence, we might as well substitute all symbols in the coefficients by zero, as the coefficients should be independent of the symbols anyway.
        const subs: { [key: string]: Expression } = {};
        for (let i = 0; i < symbols.length; ++i)
            subs[symbols[i]] = constant('0');
        for (let i = 0; i < symbols.length + 1; ++i)
            coefficients[i] = simplify(subsitute(coefficients[i], subs));

        return coefficients;
    }

    // export function timeDerivative(f: Expression, timeDerivatives: { [name: string]: string }): Expression {
    //     const derivative = _timeDerivative(f, timeDerivatives);
    //     console.log(`d/dt (${f.toString()}) = ${Algebra.simplify(derivative).toString()}`);
    //     return derivative;
    // }

    export function timeDerivative(f: Expression, timeDerivatives: { [name: string]: string }): Expression {
        if (f instanceof math.ConstantNode) return constant('0');
        if (f instanceof math.SymbolNode) {
            if (f.name in timeDerivatives)
                return Algebra.symbol(timeDerivatives[f.name]);
            else
                return constant('0');
        }
        if (f instanceof math.OperatorNode) {
            if (f.fn == 'unaryMinus') return negate(timeDerivative(f.args[0], timeDerivatives));
            if (f.fn == 'add') return add(
                timeDerivative(f.args[0], timeDerivatives),
                timeDerivative(f.args[1], timeDerivatives)
            );
            if (f.fn == 'subtract') return subtract(
                timeDerivative(f.args[0], timeDerivatives),
                timeDerivative(f.args[1], timeDerivatives)
            );
            if (f.fn == 'multiply') return add(
                multiply(timeDerivative(f.args[0], timeDerivatives), f.args[1]),
                multiply(f.args[0], timeDerivative(f.args[1], timeDerivatives))
            );
            if (f.fn == 'divide') return divide(
                subtract(multiply(f.args[1], timeDerivative(f.args[0], timeDerivatives)), multiply(f.args[0], timeDerivative(f.args[1], timeDerivatives))),
                pow(f.args[1], Algebra.constant('2'))
            );
            if (f.fn == 'pow') return multiply(
                multiply(f.args[1], pow(f.args[0], subtract(f.args[1], constant('1')))),
                timeDerivative(f.args[0], timeDerivatives)
            );
        }
        if (f instanceof math.ParenthesisNode) {
            return timeDerivative(f.content, timeDerivatives);
        }
        if (f instanceof math.FunctionNode) {
            if (f.fn.name == 'sin') return multiply(
                func('cos', [f.args[0]]),
                timeDerivative(f.args[0], timeDerivatives)
            );
            if (f.fn.name == 'cos') return negate(multiply(
                func('sin', [f.args[0]]),
                timeDerivative(f.args[0], timeDerivatives)
            ));
        }

        throw `Could not take time derivative of ${f.toString()} [${f.type} ${(f as any).fn}]`;
    }

    export function toJS(expr: Expression): string {
        return expr.toString({
            handler: function (node: Expression, options: object) {
                if (node instanceof math.SymbolNode) return node.name;
                if (node instanceof math.ConstantNode) return `${node.value}`;
                if (node instanceof math.ParenthesisNode) return `(${node.content.toString(options)})`;
                if (node instanceof math.OperatorNode) {
                    if (node.fn == 'add') return `(${node.args[0].toString(options)}) + (${node.args[1].toString(options)})`;
                    if (node.fn == 'subtract') return `(${node.args[0].toString(options)}) - (${node.args[1].toString(options)})`;
                    if (node.fn == 'multiply') return `(${node.args[0].toString(options)}) * (${node.args[1].toString(options)})`;
                    if (node.fn == 'divide') return `(${node.args[0].toString(options)}) / (${node.args[1].toString(options)})`;
                    if (node.fn == 'unaryMinus') return `-(${node.args[0].toString(options)})`;
                    if (node.fn == 'pow') return `Math.pow(${node.args[0].toString(options)}, ${node.args[1].toString(options)})`;
                }
                if (node instanceof math.FunctionNode) {
                    if (node.fn.name == 'sin') return `Math.sin(${node.args[0].toString(options)})`;
                    if (node.fn.name == 'cos') return `Math.cos(${node.args[0].toString(options)})`;
                }

                console.log(node);
                throw `Unsupported node type ${typeof (node)}`;
            }
        });
    }

    export function toTex(expr: Expression): string {
        return expr.toTex().replace(/\\cdot/g, '');
    }
}

// Overwrite some toTex functions
math.SymbolNode.prototype._toTex = function (options: {}) {
    let match = /^dd(\w+)$/.exec(this.name);
    if (match) return `{\\ddot{${match[1]}}}`;
    match = /^d(\w+)$/.exec(this.name);
    if (match) return `{\\dot{${match[1]}}}`;
    return `{${this.name}}`;
}
