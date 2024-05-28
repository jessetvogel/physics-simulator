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
            if (f.fn == 'divide')
                return divide(subtract(multiply(f.args[1], timeDerivative(f.args[0], timeDerivatives)), multiply(f.args[0], timeDerivative(f.args[1], timeDerivatives))), pow(f.args[1], Algebra.constant('2')));
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
    function toTex(expr) {
        return expr.toTex().replace(/\\cdot/g, '');
    }
    Algebra.toTex = toTex;
})(Algebra || (Algebra = {}));
math.SymbolNode.prototype._toTex = function (options) {
    let match = /^dd(\w+)$/.exec(this.name);
    if (match)
        return `{\\ddot{${match[1]}}}`;
    match = /^d(\w+)$/.exec(this.name);
    if (match)
        return `{\\dot{${match[1]}}}`;
    return `{${this.name}}`;
};
class Camera {
    constructor() {
        this.center = { x: 0.0, y: 0.0 };
        this.zoom = 128.0;
        this.centerSpeed = { x: 0.0, y: 0.0 };
    }
    world2view(p) {
        if (typeof (p) === 'number')
            return p * this.zoom;
        else
            return {
                x: ctx.canvas.offsetWidth * 0.5 + (p.x - this.center.x) * this.zoom,
                y: ctx.canvas.offsetHeight * 0.5 - (p.y - this.center.y) * this.zoom
            };
    }
    view2world(p) {
        if (typeof (p) === 'number')
            return p / this.zoom;
        else
            return {
                x: this.center.x + (p.x - ctx.canvas.offsetWidth * 0.5) / this.zoom,
                y: this.center.y - (p.y - ctx.canvas.offsetHeight * 0.5) / this.zoom
            };
    }
}
;
var ctx = null;
function initView() {
    const canvas = $('canvas');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    simulator.render();
    setScale();
    window.onresize = initView;
}
function circle(x, y, radius) {
    const center = camera.world2view({ x: x, y: y });
    const r = camera.world2view(radius);
    ctx.beginPath();
    ctx.arc(center.x, center.y, r, 0, 2.0 * Math.PI);
    ctx.stroke();
}
function line(xFrom, yFrom, xTo, yTo) {
    const from = camera.world2view({ x: xFrom, y: yFrom });
    const to = camera.world2view({ x: xTo, y: yTo });
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
}
const KaTeXOptions = {
    macros: {
        "\\id": "\\text{id}",
        "\\Hom": "\\text{Hom}",
        "\\ZZ": "\\mathbb{Z}",
        "\\QQ": "\\mathbb{Q}",
        "\\CC": "\\mathbb{C}",
        "\\RR": "\\mathbb{R}",
        "\\NN": "\\mathbb{N}",
        "\\PP": "\\mathbb{P}",
        "\\AA": "\\mathbb{A}",
        "\\FF": "\\mathbb{F}",
        "\\GG": "\\mathbb{G}",
        "\\EE": "\\mathbb{E}",
        "\\textup": "\\text{#1}",
        "\\im": "\\operatorname{im}",
        "\\colim": "\\mathop{\\operatorname{colim}}\\limits",
        "\\coker": "\\operatorname{coker}",
        "\\tr": "\\operatorname{tr}",
        "\\bdot": "\\bullet",
        "\\Spec": "\\operatorname{Spec}",
        "\\Proj": "\\operatorname{Proj}",
        "\\norm": "{\\left\\|#1\\right\\|}",
        "\\sslash": "\\mathbin{/\\mkern-6mu/}",
        "\\mod": "\\text{ mod }",
        "\\mapsfrom": "\\leftarrow\\mathrel{\\mkern-3.2mu\\raisebox{.7mu}{$\\shortmid$}}",
        "\\isom": "\\cong",
        "\\iHom": "\\underline{\\Hom}"
    }
};
var Parser;
(function (Parser_1) {
    const FUNCTIONS = ['sin', 'cos'];
    const SEPARATORS = ['(', ')', '+', '*', '-', '/', '^'];
    const PRECEDENCE = { '+': 1, '-': 1, '*': 2, '/': 3, '^': 4 };
    class Lexer {
        constructor(input) {
            this.input = input;
            this.index = 0;
            this.buffer = '';
            this.token = { type: null, data: null };
        }
        getToken() {
            while (true) {
                if (this.index >= this.input.length) {
                    if (this.buffer.length == 0)
                        return { type: 'end', data: null };
                    if (this.tokenize(this.buffer)) {
                        const token = this.makeToken();
                        this.buffer = '';
                        return token;
                    }
                    throw `unknown token ${this.buffer}`;
                }
                const c = this.input[this.index++];
                this.buffer += c;
                if (this.tokenize(this.buffer))
                    continue;
                if (this.token.type == null)
                    continue;
                const token = this.makeToken();
                this.buffer = c;
                this.tokenize(this.buffer);
                return token;
            }
        }
        makeToken() {
            if (this.token.type == null)
                throw `failed to create token from ${this.buffer}`;
            const token = this.token;
            this.token = { type: null, data: null };
            return token;
        }
        tokenize(str) {
            let type;
            if (FUNCTIONS.includes(str))
                type = 'function';
            else if (SEPARATORS.includes(str))
                type = 'separator';
            else if (/^(\d*\.)?\d*$/.test(str))
                type = 'number';
            else if (/^\w+'*$/.test(str))
                type = 'identifier';
            else if (/^\s+$/.test(str))
                type = 'whitespace';
            else
                return false;
            this.token.type = type;
            this.token.data = str;
            return true;
        }
    }
    class Parser {
        constructor(input) {
            this.lexer = new Lexer(input);
            this.currentToken = null;
            this.symbols = [];
        }
        setSymbols(symbols) {
            this.symbols = symbols;
        }
        nextToken() {
            this.currentToken = this.lexer.getToken();
            if (this.currentToken.type == 'whitespace')
                this.nextToken();
        }
        found(type = null, data = null) {
            if (this.currentToken == null)
                this.nextToken();
            if (type == null)
                return true;
            if (this.currentToken.type == type && (data == null || this.currentToken.data == data))
                return true;
            return false;
        }
        consume(type = null, data = null) {
            if (this.found(type, data)) {
                const token = this.currentToken;
                ;
                this.currentToken = null;
                return token;
            }
            else {
                throw `expected ${'?'} but found ${'?'}`;
            }
        }
        parse() {
            return this.parseExpression(0);
        }
        parseExpression(precedence = 0) {
            let expr = null;
            if (this.found('separator', '(')) {
                this.consume();
                expr = this.parseExpression(0);
                this.consume('separator', ')');
            }
            else if (this.found('separator', '-')) {
                this.consume();
                expr = Algebra.negate(this.parseExpression(PRECEDENCE['-']));
            }
            else if (this.found('number')) {
                expr = Algebra.constant(this.consume().data);
            }
            else if (this.found('function')) {
                const functionName = this.consume().data;
                this.consume('separator', '(');
                const args = [this.parseExpression()];
                while (this.found('separator', ',')) {
                    this.consume();
                    args.push(this.parseExpression());
                }
                this.consume('separator', ')');
                expr = Algebra.func(functionName, args);
            }
            else if (this.found('identifier')) {
                expr = this.parseSymbol();
            }
            else {
                throw `Unexpected token ${this.currentToken.data}`;
            }
            while (true) {
                if (this.found('separator', '+') && precedence <= PRECEDENCE['+']) {
                    this.consume();
                    const y = this.parseExpression(PRECEDENCE['+']);
                    expr = Algebra.add(expr, y);
                    continue;
                }
                if (this.found('separator', '-') && precedence <= PRECEDENCE['-']) {
                    this.consume();
                    const y = this.parseExpression(PRECEDENCE['-']);
                    expr = Algebra.subtract(expr, y);
                    continue;
                }
                if (this.found('separator', '*') && precedence <= PRECEDENCE['*']) {
                    this.consume();
                    const y = this.parseExpression(PRECEDENCE['*']);
                    expr = Algebra.multiply(expr, y);
                    continue;
                }
                if (this.found('separator', '/') && precedence <= PRECEDENCE['/']) {
                    this.consume();
                    const y = this.parseExpression(PRECEDENCE['/']);
                    expr = Algebra.divide(expr, y);
                    continue;
                }
                if (this.found('separator', '^') && precedence <= PRECEDENCE['^']) {
                    this.consume();
                    const y = this.parseExpression(PRECEDENCE['^']);
                    expr = Algebra.pow(expr, y);
                    continue;
                }
                break;
            }
            return expr;
        }
        parseSymbol() {
            const name = this.consume('identifier').data;
            if (this.symbols.includes(name))
                return Algebra.symbol(name);
            throw `unknown symbol ${name}`;
        }
    }
    Parser_1.Parser = Parser;
})(Parser || (Parser = {}));
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
            if (this.acceleration == null)
                return false;
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
function setCookie(name, value, days) {
    const d = new Date();
    d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${d.toUTCString()};path=/`;
}
function getCookie(name) {
    const cookies = decodeURIComponent(document.cookie).split(';');
    const needle = `${name}=`;
    for (let c of cookies) {
        while (c.charAt(0) == ' ')
            c = c.substring(1);
        if (c.indexOf(needle) == 0)
            return c.substring(needle.length, c.length);
    }
    return null;
}
let presets = {};
const defaultPresets = "{\"pendulum\":{\"variables\":{\"symbols\":[\"a\"],\"values\":[1.5],\"velocities\":[0]},\"constants\":{\"symbols\":[\"m\",\"g\",\"L\"],\"values\":[1,9.81,1]},\"script\":\"x = Math.sin(a) * L\\ny = -Math.cos(a) * L\\n\\ncircle(0, 0, 0.01)\\ncircle(x, y, 0.10)\\nline(0, 0, x, y)\",\"lagrangian\":\"1/2 * m * da^2 * L^2 - m * g * (-cos(a) * L)\"},\"gravity\":{\"variables\":{\"symbols\":[\"x_1\",\"y_1\",\"x_2\",\"y_2\"],\"values\":[1,0,-1,0],\"velocities\":[0,1,0,-1]},\"constants\":{\"symbols\":[\"m_1\",\"m_2\",\"G\"],\"values\":[1,1,6]},\"script\":\"circle(x_1, y_1, 0.10)\\ncircle(x_2, y_2, 0.10)\",\"lagrangian\":\"0.5 * m_1 * (dx_1^2 + dy_1^2) + 0.5 * m_2 * (dx_2^2 + dy_2^2) + G * m_1 * m_2 \/ ((x_1 - x_2)^2 + (y_1 - y_2)^2)^(1\/2)\"},\"double pendulum\":{\"variables\":{\"symbols\":[\"a_1\",\"a_2\"],\"values\":[1,1],\"velocities\":[-1,1]},\"constants\":{\"symbols\":[\"l_1\",\"l_2\",\"m_1\",\"m_2\",\"g\"],\"values\":[1,1,1,1,10]},\"script\":\"x_1 = l_1 * Math.sin(a_1)\\ny_1 = -l_1 * Math.cos(a_1)\\n\\nx_2 = x_1 + l_2 * Math.sin(a_2)\\ny_2 = y_1 - l_2 * Math.cos(a_2)\\n\\nm = Math.max(m_1, m_2)\\n\\ncircle(0, 0, 0.01)\\ncircle(x_1, y_1, 0.10 * Math.sqrt(m_1 \/ m))\\ncircle(x_2, y_2, 0.10 * Math.sqrt(m_2 \/ m))\\nline(0, 0, x_1, y_1)\\nline(x_1, y_1, x_2, y_2)\",\"lagrangian\":\"1\/2 * (m_1 + m_2) * l_1^2 * da_1^2 + 1\/2 * m_2 * l_2^2 * da_2^2 + m_2 * l_1 * l_2 * da_1 * da_2 * cos(a_1 - a_2) + (m_1 + m_2) * g * l_1 * cos(a_1) + m_2 * g * l_2 * cos(a_2)\"}}";
function loadPreset(name) {
    try {
        let cookie = getCookie('presets');
        if (cookie === null)
            cookie = defaultPresets;
        presets = JSON.parse(cookie);
        return (name in presets) ? presets[name] : null;
    }
    catch (error) {
        return null;
    }
}
function storePreset(name, description) {
    if (name !== null)
        presets[name] = description;
    setCookie('presets', JSON.stringify(presets), 365);
    initPresets();
}
function initPresets() {
    loadPreset(null);
    const list = $('presets');
    clear(list);
    for (const name in presets) {
        list.append(create('div', {
            'class': 'preset',
            '@click': function (event) {
                simulator.description = loadPreset(name);
                simulator.reset();
                updateLayout();
                list.childNodes.forEach((node, key, parent) => removeClass(node, 'selected'));
                addClass(this, 'selected');
                $('input-preset-name').value = name;
            }
        }, [
            create('span', {}, name),
            create('span', {
                'class': 'remove', '@click': function (event) {
                    delete presets[name];
                    storePreset(null, null);
                }
            })
        ]));
    }
}
var simulator = null;
var camera = null;
function init() {
    simulator = new Simulator();
    camera = new Camera();
    onClick($('button-add-variable'), function () {
        const name = $('input-new-symbol').value;
        const d = simulator.description;
        d.variables.symbols.push(name);
        d.variables.values.push(0);
        d.variables.velocities.push(0);
        simulator.reset();
        updateLayout();
    });
    onClick($('button-add-constant'), function () {
        const name = $('input-new-symbol').value;
        const d = simulator.description;
        d.constants.symbols.push(name);
        d.constants.values.push(0);
        simulator.reset();
        updateLayout();
    });
    onChange($('textarea-render-script'), function () {
        simulator.description.script = this.value;
        simulator.reset();
    });
    onChange($('input-lagrangian'), function () {
        simulator.description.lagrangian = this.value;
        simulator.reset();
    });
    onClick($('button-start'), function () {
        if (simulator.isRunning()) {
            if (simulator.stop()) {
                this.innerText = 'start';
                removeClass(this, 'pause');
            }
        }
        else {
            if (simulator.start()) {
                this.innerText = 'pause';
                addClass(this, 'pause');
            }
        }
    });
    onClick($('button-reset'), () => {
        simulator.description.lagrangian = $('input-lagrangian').value;
        simulator.description.script = $('textarea-render-script').value;
        simulator.reset();
        updateLayout();
    });
    onClick($('button-center'), () => {
        camera.center.x = 0.0;
        camera.center.y = 0.0;
        simulator.render();
    });
    onClick($('button-save-preset'), () => {
        const name = $('input-preset-name').value;
        storePreset(name, simulator.description);
    });
    const speed = 250.0;
    onKeyDown(document.body, function (event) {
        if (document.activeElement == document.body) {
            if (event.key === 'ArrowLeft')
                camera.centerSpeed.x = -speed;
            if (event.key === 'ArrowRight')
                camera.centerSpeed.x = speed;
            if (event.key === 'ArrowUp')
                camera.centerSpeed.y = speed;
            if (event.key === 'ArrowDown')
                camera.centerSpeed.y = -speed;
        }
    });
    onKeyUp(document.body, function (event) {
        if (document.activeElement == document.body) {
            if (event.key === 'ArrowLeft')
                camera.centerSpeed.x = 0.0;
            if (event.key === 'ArrowRight')
                camera.centerSpeed.x = 0.0;
            if (event.key === 'ArrowUp')
                camera.centerSpeed.y = 0.0;
            if (event.key === 'ArrowDown')
                camera.centerSpeed.y = 0.0;
        }
    });
    onWheel(document.body, function (event) {
        if (document.activeElement == document.body) {
            camera.zoom *= Math.exp(-0.005 * event.deltaY);
            simulator.render();
            setScale();
        }
    });
    const dt = 1.0 / 30.0;
    setInterval(function () {
        if (camera.centerSpeed.x != 0.0 || camera.centerSpeed.y != 0.0) {
            camera.center.x += camera.centerSpeed.x / camera.zoom * dt;
            camera.center.y += camera.centerSpeed.y / camera.zoom * dt;
            simulator.render();
        }
    }, 1000.0 * dt);
    initView();
    initPresets();
    if ($('presets').children.length > 0)
        $('presets').children[0].click();
    initTheme();
    updateLayout();
    setTimeout(() => simulator.render(), 10);
}
window.onload = init;
function updateLayout() {
    const d = simulator.description;
    $('input-lagrangian').value = d.lagrangian;
    const textarea = $('textarea-render-script');
    textarea.value = d.script;
    textarea.style.height = '1px';
    textarea.style.height = textarea.scrollHeight + 'px';
    const table = $('symbols-list');
    clear(table);
    table.append(create('span'));
    table.append(create('span', { class: 'table-header' }, 'value'));
    table.append(create('span', { class: 'table-header' }, 'velocity'));
    table.append(create('span'));
    const items = [];
    for (let i = 0; i < d.variables.symbols.length; ++i)
        items.push([d.variables, i]);
    for (let i = 0; i < d.constants.symbols.length; ++i)
        items.push([d.constants, i]);
    for (const [list, i] of items) {
        table.append(create('span', { 'class': 'symbol' }, `\\(${list.symbols[i]}\\)`));
        table.append(create('input', {
            'placeholder': 'value', 'value': `${list.values[i]}`, '@change': function () {
                const f = parseFloat(this.value);
                if (f == f)
                    list.values[i] = f;
            }
        }));
        if ('velocities' in list) {
            table.append(create('input', {
                'placeholder': 'velocity', 'value': `${list.velocities[i]}`, '@change': function () {
                    const f = parseFloat(this.value);
                    if (f == f)
                        list.velocities[i] = f;
                }
            }));
        }
        else {
            table.append(create('span'));
        }
        table.append(create('span', {
            'class': 'remove', '@click': () => {
                list.symbols.splice(i, 1);
                list.values.splice(i, 1);
                if ('velocities' in list)
                    list.velocities.splice(i, 1);
                updateLayout();
            }
        }));
    }
    typeset(table);
    setEquations();
}
function setEquations() {
    if (simulator.system != null) {
        const equations = $('equations');
        let html = '';
        if (simulator.system.equations.length > 0) {
            html += '<div class="heading">Equations of motion</div>';
            html += simulator.system.equations.map(eq => `<div class="equation">\\(${Algebra.toTex(eq)} = 0\\)</div>`).join('');
        }
        setHTML(equations, html);
        typeset(equations);
    }
}
function setScale() {
    const scale = $('scale');
    const length = 64.0 / camera.zoom;
    let text;
    if (length < 0.01)
        text = `${(length * 1000.0).toFixed(2)} mm`;
    if (length >= 0.01 && length < 1.0)
        text = `${(length * 100.0).toFixed(2)} cm`;
    if (length >= 1.0 && length < 1000.0)
        text = `${length.toFixed(2)} m`;
    if (length >= 1000.0)
        text = `${(length / 1000.0).toFixed(2)} km`;
    setText(scale, text);
}
function initTheme() {
    const prefersDark = false;
    const cookieTheme = getCookie('theme');
    if (cookieTheme !== null)
        setTheme(cookieTheme === 'dark');
    else
        setTheme(prefersDark);
    onClick($('button-theme'), function () {
        document.cookie = `theme=${setTheme(null) ? 'dark' : 'light'}`;
    });
    setTimeout(function () {
        const sheet = window.document.styleSheets[0];
        sheet.insertRule('* { transition: background-color 0.5s, color 0.5s, filter 0.5s; }', sheet.cssRules.length);
    }, 100);
}
function setTheme(dark) {
    if (dark === true) {
        document.body.classList.add('dark');
        return true;
    }
    if (dark === false) {
        document.body.classList.remove('dark');
        return false;
    }
    setTimeout(() => simulator.render(), 10);
    return setTheme(!document.body.classList.contains('dark'));
}
function typeset(elem) {
    if ('renderMathInElement' in window)
        renderMathInElement(elem, KaTeXOptions);
}
class Simulator {
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
            this.render();
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
        try {
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            this.renderGrid();
            ctx.strokeStyle = getComputedStyle(document.body).getPropertyValue('--clr-text');
            if (this.renderFunction === null)
                return false;
            this.renderFunction(...this.system.variables.values, ...this.system.variables.velocities, ...this.system.constants.values);
            return true;
        }
        catch (error) {
            console.log('ERROR IN RENDER:', error);
            return false;
        }
    }
    renderGrid() {
        const gridUnitMin = 16.0;
        const gridUnitStep = 5.0;
        let gridUnit = camera.world2view(1.0);
        let gridOrigin = camera.world2view({ x: 0.0, y: 0.0 });
        while (gridUnit >= gridUnitMin * gridUnitStep)
            gridUnit /= gridUnitStep;
        while (gridUnit < gridUnitMin)
            gridUnit *= gridUnitStep;
        ctx.strokeStyle = getComputedStyle(document.body).getPropertyValue('--clr-grid');
        ;
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
function $(id) {
    return document.getElementById(id);
}
function create(tag, properties, content) {
    const elem = document.createElement(tag);
    if (properties !== undefined) {
        for (const key in properties) {
            if (key.startsWith('@'))
                elem.addEventListener(key.substring(1), properties[key]);
            else
                elem.setAttribute(key, properties[key]);
        }
    }
    if (content !== undefined) {
        if (typeof (content) === 'string')
            elem.innerHTML = content;
        if (content instanceof HTMLElement)
            elem.append(content);
        if (Array.isArray(content))
            for (const child of content)
                elem.append(child);
    }
    return elem;
}
function clear(elem) {
    elem.innerHTML = '';
}
function onClick(elem, f) {
    elem.addEventListener('click', f);
}
function onContextMenu(elem, f) {
    elem.addEventListener('contextmenu', f);
}
function onChange(elem, f) {
    elem.addEventListener('change', f);
}
function onInput(elem, f) {
    elem.addEventListener('input', f);
}
function onRightClick(elem, f) {
    elem.addEventListener('contextmenu', f);
}
function onKeyPress(elem, f) {
    elem.addEventListener('keypress', f);
}
function onKeyDown(elem, f) {
    elem.addEventListener('keydown', f);
}
function onKeyUp(elem, f) {
    elem.addEventListener('keyup', f);
}
function onWheel(elem, f) {
    elem.addEventListener('wheel', f);
}
function addClass(elem, c) {
    elem.classList.add(c);
}
function removeClass(elem, c) {
    elem.classList.remove(c);
}
function hasClass(elem, c) {
    return elem.classList.contains(c);
}
function setHTML(elem, html) {
    elem.innerHTML = html;
}
function setText(elem, text) {
    elem.innerText = text;
}
function utf8_to_b64(str) {
    return window.btoa(encodeURIComponent(str));
}
function b64_to_utf8(str) {
    return decodeURIComponent(window.atob(str));
}
//# sourceMappingURL=script.js.map