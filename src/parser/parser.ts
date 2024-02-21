import { Program } from '../ast/ast'
import { Lexer } from '../lexer/lexer'
import { Token } from '../token/token'

export class Parser {
  private lexer: Lexer
  private curToken?: Token
  private peekToken?: Token

  private constructor(lexer: Lexer) {
    this.lexer = lexer
  }

  static newParser(lexer: Lexer): Parser {
    const parser = new Parser(lexer)
    parser.nextToken()
    parser.nextToken()

    return parser
  }

  private nextToken() {
    this.curToken = this.peekToken
    this.peekToken = this.lexer.nextToken()
  }

  parseProgram(): Program | null {
    return null
  }
}
