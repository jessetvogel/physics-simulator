var Algebra;
(function (Algebra) {
    function add(x, y) {
        return new math.OperatorNode('+', 'add', [x, y]);
    }
    Algebra.add = add;
    function negate(x) {
        return new math.OperatorNode('-', 'unaryMinus', [x]);
    }
    Algebra.negate = negate;
    function subtract(x, y) {
        return add(x, negate(y));
    }
    Algebra.subtract = subtract;
    function multiply(x, y) {
        return new math.OperatorNode('*', 'multiply', [x, y]);
    }
    Algebra.multiply = multiply;
    function divide(x, y) {
        return new math.OperatorNode('/', 'divide', [x, y]);
    }
    Algebra.divide = divide;
    function pow(x, y) {
        return new math.OperatorNode('^', 'pow', [x, y]);
    }
    Algebra.pow = pow;
    function func(fn, args) {
        return new math.FunctionNode(fn, args);
    }
    Algebra.func = func;
    function derivative(f, x) {
        return math.derivative(f, x);
    }
    Algebra.derivative = derivative;
    function symbol(name) {
        return new math.SymbolNode(name);
    }
    Algebra.symbol = symbol;
    function constant(str) {
        return math.parse(str);
    }
    Algebra.constant = constant;
    function subsitute(expr, dict) {
        return math.simplify(expr, dict);
    }
    Algebra.subsitute = subsitute;
    function simplify(expr) {
        return math.simplify(expr);
    }
    Algebra.simplify = simplify;
    function coefficients(expr, symbols) {
        const coefficients = new Array(symbols.length + 1);
        for (let i = 0; i < symbols.length; ++i)
            coefficients[i] = subsitute(subtract(expr, subsitute(expr, { [symbols[i]]: constant('0') })), { [symbols[i]]: constant('1') });
        const dict = {};
        for (const x of symbols)
            dict[x] = constant('0');
        coefficients[symbols.length] = simplify(subsitute(expr, dict));
        return coefficients;
    }
    Algebra.coefficients = coefficients;
    function timeDerivative(f, timeDerivatives) {
        if (f instanceof math.ConstantNode)
            return constant('0');
        if (f instanceof math.SymbolNode) {
            if (f.name in timeDerivatives)
                return Algebra.symbol(timeDerivatives[f.name]);
            else
                return constant('0');
        }
        if (f instanceof math.OperatorNode) {
            if (f.fn == 'unaryMinus')
                return negate(timeDerivative(f.args[0], timeDerivatives));
            if (f.fn == 'add')
                return add(timeDerivative(f.args[0], timeDerivatives), timeDerivative(f.args[0], timeDerivatives));
            if (f.fn == 'multiply')
                return add(multiply(timeDerivative(f.args[0], timeDerivatives), f.args[1]), multiply(f.args[0], timeDerivative(f.args[1], timeDerivatives)));
            if (f.fn == 'pow')
                return multiply(multiply(f.args[1], pow(f.args[0], subtract(f.args[1], constant('1')))), timeDerivative(f.args[0], timeDerivatives));
        }
        if (f instanceof math.ParenthesisNode) {
            return timeDerivative(f.content, timeDerivatives);
        }
        throw `Could not take time derivative of ${f.toString()}`;
    }
    Algebra.timeDerivative = timeDerivative;
    function toJS(expr) {
        return expr.toString({
            handler: function (node, options) {
                if (node instanceof math.SymbolNode)
                    return node.name;
                if (node instanceof math.ConstantNode)
                    return `${node.value}`;
                if (node instanceof math.ParenthesisNode)
                    return `(${node.content.toString(options)})`;
                if (node instanceof math.OperatorNode) {
                    if (node.fn == 'add')
                        return `(${node.args[0].toString(options)}) + (${node.args[1].toString(options)})`;
                    if (node.fn == 'subtract')
                        return `(${node.args[0].toString(options)}) - (${node.args[1].toString(options)})`;
                    if (node.fn == 'multiply')
                        return `(${node.args[0].toString(options)}) * (${node.args[1].toString(options)})`;
                    if (node.fn == 'divide')
                        return `(${node.args[0].toString(options)}) / (${node.args[1].toString(options)})`;
                    if (node.fn == 'unaryMinus')
                        return `-(${node.args[0].toString(options)})`;
                    if (node.fn == 'pow')
                        return `Math.pow(${node.args[0].toString(options)}, ${node.args[1].toString(options)})`;
                }
                if (node instanceof math.FunctionNode) {
                    if (node.fn.name == 'sin')
                        return `Math.sin(${node.args[0].toString(options)})`;
                    if (node.fn.name == 'cos')
                        return `Math.cos(${node.args[0].toString(options)})`;
                }
                console.log(node);
                throw `Unsupported node type ${typeof (node)}`;
            }
        });
    }
    Algebra.toJS = toJS;
})(Algebra || (Algebra = {}));
//# sourceMappingURL=algebra.js.map