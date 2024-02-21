import { Identifier, LetStatement, Program, Statement } from '../ast/ast'
import { Lexer } from '../lexer/lexer'
import { Token, TokenType, TokenTypes } from '../token/token'

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

  parseProgram(): Program {
    const program = Program.new()

    while (this.curToken?.type !== TokenTypes.EOF) {
      const stmt = this.parseStatement()
      if (stmt) program.statements.push(stmt)
      this.nextToken()
    }

    return program
  }

  private parseStatement(): Statement | null {
    switch (this.curToken?.type) {
      case TokenTypes.LET:
        return this.parseLetStatement()
      default:
        return null
    }
  }

  private parseLetStatement(): LetStatement | null {
    const stmt = LetStatement.new(this.curToken!)

    if (!this.expectPeek(TokenTypes.IDENT)) {
      return null
    }

    stmt.name = Identifier.new(this.curToken!, this.curToken?.literal!)

    if (!this.expectPeek(TokenTypes.ASSIGN)) {
      return null
    }

    while (!this.curTokenIs(TokenTypes.SEMICOLON)) {
      this.nextToken()
    }

    return stmt
  }

  private curTokenIs(t: TokenType): boolean {
    return this.curToken?.type === t
  }

  private expectPeek(t: TokenType): boolean {
    if (this.peekTokenIs(t)) {
      this.nextToken()
      return true
    }
    return false
  }

  private peekTokenIs(t: TokenType): boolean {
    return this.peekToken?.type === t
  }
}
