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
//# sourceMappingURL=parser.js.map