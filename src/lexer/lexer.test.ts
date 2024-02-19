import { TokenTypes } from '../token/token'

import { Lexer } from './lexer'

describe('Lexer', () => {
  it('should return next token', () => {
    const input = `let five = 5; 
    let ten = 10;

    let add = fn(x, y) {
      x + y;
    };
    
    let result = add(five, ten);
    `
    const tests = [
      { expectedType: TokenTypes.LET, expectedLiteral: 'let' },
      { expectedType: TokenTypes.IDENT, expectedLiteral: 'five' },
      { expectedType: TokenTypes.ASSIGN, expectedLiteral: '=' },
      { expectedType: TokenTypes.INT, expectedLiteral: '5' },
      { expectedType: TokenTypes.SEMICOLON, expectedLiteral: ';' },
      { expectedType: TokenTypes.LET, expectedLiteral: 'let' },
      { expectedType: TokenTypes.IDENT, expectedLiteral: 'ten' },
      { expectedType: TokenTypes.ASSIGN, expectedLiteral: '=' },
      { expectedType: TokenTypes.INT, expectedLiteral: '10' },
      { expectedType: TokenTypes.SEMICOLON, expectedLiteral: ';' },
      { expectedType: TokenTypes.LET, expectedLiteral: 'let' },
      { expectedType: TokenTypes.IDENT, expectedLiteral: 'add' },
      { expectedType: TokenTypes.ASSIGN, expectedLiteral: '=' },
      { expectedType: TokenTypes.FUNCTION, expectedLiteral: 'fn' },
      { expectedType: TokenTypes.LPAREN, expectedLiteral: '(' },
      { expectedType: TokenTypes.IDENT, expectedLiteral: 'x' },
      { expectedType: TokenTypes.COMMA, expectedLiteral: ',' },
      { expectedType: TokenTypes.IDENT, expectedLiteral: 'y' },
      { expectedType: TokenTypes.RPAREN, expectedLiteral: ')' },
      { expectedType: TokenTypes.LBRACE, expectedLiteral: '{' },
      { expectedType: TokenTypes.IDENT, expectedLiteral: 'x' },
      { expectedType: TokenTypes.PLUS, expectedLiteral: '+' },
      { expectedType: TokenTypes.IDENT, expectedLiteral: 'y' },
      { expectedType: TokenTypes.SEMICOLON, expectedLiteral: ';' },
      { expectedType: TokenTypes.RBRACE, expectedLiteral: '}' },
      { expectedType: TokenTypes.SEMICOLON, expectedLiteral: ';' },
      { expectedType: TokenTypes.LET, expectedLiteral: 'let' },
      { expectedType: TokenTypes.IDENT, expectedLiteral: 'result' },
      { expectedType: TokenTypes.ASSIGN, expectedLiteral: '=' },
      { expectedType: TokenTypes.IDENT, expectedLiteral: 'add' },
      { expectedType: TokenTypes.LPAREN, expectedLiteral: '(' },
      { expectedType: TokenTypes.IDENT, expectedLiteral: 'five' },
      { expectedType: TokenTypes.COMMA, expectedLiteral: ',' },
      { expectedType: TokenTypes.IDENT, expectedLiteral: 'ten' },
      { expectedType: TokenTypes.RPAREN, expectedLiteral: ')' },
      { expectedType: TokenTypes.SEMICOLON, expectedLiteral: ';' },
      { expectedType: TokenTypes.EOF, expectedLiteral: '' },
    ]
    const lexer = Lexer.newLexer(input)

    for (const test of tests) {
      const curToken = lexer.nextToken()
      expect(curToken.type).toEqual(test.expectedType)
      expect(curToken.literal).toEqual(test.expectedLiteral)
    }
  })
})
