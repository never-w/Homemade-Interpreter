import { isLetter, newToken } from '../helpers/helpers'
import { Token, TokenTypes, lookupIdent } from '../token/token'

export class Lexer {
  private input: string
  private position: number
  private readPosition: number
  private ch: string

  constructor(input: string) {
    this.input = input
    this.position = 0
    this.readPosition = 0
    this.ch = ''
  }

  static newLexer(input: string): Lexer {
    const lexer = new Lexer(input)
    lexer.readChar()
    return lexer
  }

  private readChar() {
    if (this.readPosition >= this.input.length) {
      this.ch = ''
    } else {
      this.ch = this.input[this.readPosition]
    }
    this.position = this.readPosition
    this.readPosition++
  }

  nextToken(): Token {
    let token: Token = {
      type: TokenTypes.EOF,
      literal: '',
    }
    this.skipWhitespace()

    switch (this.ch) {
      case '=':
        token = newToken(TokenTypes.ASSIGN, this.ch)
        break
      case ';':
        token = newToken(TokenTypes.SEMICOLON, this.ch)
        break
      case '(':
        token = newToken(TokenTypes.LPAREN, this.ch)
        break
      case ')':
        token = newToken(TokenTypes.RPAREN, this.ch)
        break
      case ',':
        token = newToken(TokenTypes.COMMA, this.ch)
        break
      case '+':
        token = newToken(TokenTypes.PLUS, this.ch)
        break
      case '{':
        token = newToken(TokenTypes.LBRACE, this.ch)
        break
      case '}':
        token = newToken(TokenTypes.RBRACE, this.ch)
        break
      default:
        if (isLetter(this.ch)) {
          token.literal = this.readIdentifier()
          token.type = lookupIdent(token.literal)
          return token
        } else {
          token = newToken(TokenTypes.ILLEGAL, this.ch)
        }
        break
    }
    this.readChar()
    return token
  }

  private readIdentifier() {
    const position = this.position
    while (isLetter(this.ch)) {
      this.readChar()
    }
    return this.input.slice(position, this.position)
  }

  private skipWhitespace() {
    while (this.ch === ' ' || this.ch === '\t' || this.ch === '\n' || this.ch === '\n') {
      this.readChar()
    }
  }
}
