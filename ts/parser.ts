namespace Parser {
    type TokenType = 'separator' | 'identifier' | 'end' | 'whitespace' | 'number' | 'function'
    type Token = { type: TokenType, data: string }

    const FUNCTIONS = ['sin', 'cos'];
    const SEPARATORS = ['(', ')', '+', '*', '-', '/', '^'];
    const PRECEDENCE = { '+': 1, '-': 1, '*': 2, '/': 3, '^': 4 };

    class Lexer {
        input: string;
        index: number;
        buffer: string;
        token: Token;

        constructor(input: string) {
            this.input = input;
            this.index = 0;
            this.buffer = '';
            this.token = { type: null, data: null };
        }

        getToken(): Token {
            while (true) {
                // End of input
                if (this.index >= this.input.length) {
                    if (this.buffer.length == 0) return { type: 'end', data: null };
                    if (this.tokenize(this.buffer)) {
                        const token = this.makeToken();
                        this.buffer = '';
                        return token;
                    }

                    throw `unknown token ${this.buffer}`;
                }

                // Get new character
                const c = this.input[this.index++];
                // Enlarge buffer
                this.buffer += c;
                // If we can tokenize, just continue
                if (this.tokenize(this.buffer)) continue;
                // If we also did not tokenize before, hope it will make sense later
                if (this.token.type == null) continue;
                // Return the last valid token
                const token = this.makeToken();
                this.buffer = c;
                this.tokenize(this.buffer);
                return token;
            }
        }

        makeToken(): Token {
            if (this.token.type == null)
                throw `failed to create token from ${this.buffer}`;

            const token = this.token;
            this.token = { type: null, data: null };
            return token;
        }

        tokenize(str: string): boolean {
            let type: TokenType;
            if (FUNCTIONS.includes(str)) type = 'function';
            else if (SEPARATORS.includes(str)) type = 'separator';
            else if (/^(\d*\.)?\d*$/.test(str)) type = 'number';
            else if (/^\w+'*$/.test(str)) type = 'identifier';
            else if (/^\s+$/.test(str)) type = 'whitespace';
            else return false;

            this.token.type = type;
            this.token.data = str;
            return true;
        }
    }

    export class Parser {
        lexer: Lexer;
        currentToken: Token;
        symbols: string[];

        constructor(input: string) {
            this.lexer = new Lexer(input);
            this.currentToken = null;
            this.symbols = [];
        }

        setSymbols(symbols: string[]): void {
            this.symbols = symbols;
        }

        nextToken(): void {
            this.currentToken = this.lexer.getToken();
            if (this.currentToken.type == 'whitespace')
                this.nextToken();
        }

        found(type: TokenType = null, data: string = null): boolean {
            if (this.currentToken == null)
                this.nextToken();

            if (type == null) return true;
            if (this.currentToken.type == type && (data == null || this.currentToken.data == data)) return true;

            return false;
        }

        consume(type: TokenType = null, data: string = null): Token {
            if (this.found(type, data)) {
                const token = this.currentToken;;
                this.currentToken = null;
                return token;
            }
            else {
                throw `expected ${'?'} but found ${'?'}`;
            }
        }

        parse(): Algebra.Expression {
            return this.parseExpression(0);
        }

        parseExpression(precedence: number = 0): Algebra.Expression {
            let expr: Algebra.Expression = null;

            // ( EXPRESSION )
            if (this.found('separator', '(')) {
                this.consume();
                expr = this.parseExpression(0);
                this.consume('separator', ')');
            }
            // - EXPRESSION
            else if (this.found('separator', '-')) {
                this.consume();
                expr = Algebra.negate(this.parseExpression(PRECEDENCE['-']));
            }
            // NUMBER
            else if (this.found('number')) {
                expr = Algebra.constant(this.consume().data);
            }
            // FUNCTIONS
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
            // IDENTIFIER
            else if (this.found('identifier')) {
                expr = this.parseSymbol();
            } else {
                throw `Unexpected token ${this.currentToken.data}`;
            }

            while (true) {
                // addition
                if (this.found('separator', '+') && precedence <= PRECEDENCE['+']) {
                    this.consume();
                    const y = this.parseExpression(PRECEDENCE['+']);
                    expr = Algebra.add(expr, y);
                    continue;
                }
                // subtraction
                if (this.found('separator', '-') && precedence <= PRECEDENCE['-']) {
                    this.consume();
                    const y = this.parseExpression(PRECEDENCE['-']);
                    expr = Algebra.subtract(expr, y);
                    continue;
                }

                // multiplication
                if (this.found('separator', '*') && precedence <= PRECEDENCE['*']) {
                    this.consume();
                    const y = this.parseExpression(PRECEDENCE['*']);
                    expr = Algebra.multiply(expr, y);
                    continue;
                }

                // division
                if (this.found('separator', '/') && precedence <= PRECEDENCE['/']) {
                    this.consume();
                    const y = this.parseExpression(PRECEDENCE['/']);
                    expr = Algebra.divide(expr, y);
                    continue;
                }

                // powers
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

        parseSymbol(): Algebra.Expression {
            const name = this.consume('identifier').data;
            if (this.symbols.includes(name))
                return Algebra.symbol(name);

            throw `unknown symbol ${name}`
        }
    }
}
