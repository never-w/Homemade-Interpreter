import { Expression, Statement } from '../ast/ast'
import { ExpressionStatement } from '../ast/expressionStatement'
import { Identifier } from '../ast/identifier'
import { InfixExpression } from '../ast/infixExpression'
import { IntegerLiteral } from '../ast/integerLiteral'
import { LetStatement } from '../ast/letStatement'
import { PrefixExpression } from '../ast/prefixExpression'
import { Program } from '../ast/program'
import { ReturnStatement } from '../ast/returnStatement'
import { Lexer } from '../lexer/lexer'
import { Token, TokenType, TokenTypes } from '../token/token'

type PrefixParseFn = () => Expression
type InfixParseFn = (expression: Expression) => Expression

enum PrecedenceTable {
  LOWEST = 1,
  EQUALS,
  LESSGREATER,
  SUM,
  PRODUCT,
  PREFIX,
  CALL,
}

const precedences = new Map<TokenType, PrecedenceTable>()
// == 2
precedences.set(TokenTypes.EQ, PrecedenceTable.EQUALS)
// != 2
precedences.set(TokenTypes.NOT_EQ, PrecedenceTable.EQUALS)
// < 3
precedences.set(TokenTypes.LT, PrecedenceTable.LESSGREATER)
// > 3
precedences.set(TokenTypes.GT, PrecedenceTable.LESSGREATER)
// + 4
precedences.set(TokenTypes.PLUS, PrecedenceTable.SUM)
// - 4
precedences.set(TokenTypes.MINUS, PrecedenceTable.SUM)
// / 5
precedences.set(TokenTypes.SLASH, PrecedenceTable.PRODUCT)
// * 5
precedences.set(TokenTypes.ASTERISK, PrecedenceTable.PRODUCT)

export class Parser {
  private lexer: Lexer
  private curToken?: Token
  private peekToken?: Token
  private errors: string[]
  private prefixParseFns = new Map<TokenType, PrefixParseFn>()
  private infixParseFns = new Map<TokenType, InfixParseFn>()

  private constructor(lexer: Lexer) {
    this.lexer = lexer
    this.errors = []
  }

  static newParser(lexer: Lexer): Parser {
    const parser = new Parser(lexer)
    parser.nextToken()
    parser.nextToken()

    parser.registerPrefix(TokenTypes.IDENT, parser.parseIdentifier)
    parser.registerPrefix(TokenTypes.INT, parser.parseIntegerLiteral)
    parser.registerPrefix(TokenTypes.BANG, parser.parsePrefixExpression)
    parser.registerPrefix(TokenTypes.MINUS, parser.parsePrefixExpression)

    parser.registerInfix(TokenTypes.PLUS, parser.parseInfixExpression)
    parser.registerInfix(TokenTypes.MINUS, parser.parseInfixExpression)
    parser.registerInfix(TokenTypes.SLASH, parser.parseInfixExpression)
    parser.registerInfix(TokenTypes.ASTERISK, parser.parseInfixExpression)
    parser.registerInfix(TokenTypes.EQ, parser.parseInfixExpression)
    parser.registerInfix(TokenTypes.NOT_EQ, parser.parseInfixExpression)
    parser.registerInfix(TokenTypes.LT, parser.parseInfixExpression)
    parser.registerInfix(TokenTypes.GT, parser.parseInfixExpression)

    return parser
  }

  private nextToken() {
    this.curToken = this.peekToken
    this.peekToken = this.lexer.nextToken()
  }

  parseProgram(): Program {
    const program = Program.new()

    while (!this.curTokenIs(TokenTypes.EOF)) {
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
      case TokenTypes.RETURN:
        return this.parseReturnStatement()
      default:
        return this.parseExpressionStatement()
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
    this.peekError(t)
    return false
  }

  private peekTokenIs(t: TokenType): boolean {
    return this.peekToken?.type === t
  }

  getErrors(): string[] {
    return this.errors
  }

  private peekError(t: TokenType) {
    const msg = `expected next token to be ${t}, got ${this.peekToken?.type} instead`
    this.errors.push(msg)
  }

  private parseReturnStatement(): ReturnStatement {
    const stmt = ReturnStatement.new(this.curToken!)
    this.nextToken()

    while (!this.curTokenIs(TokenTypes.SEMICOLON)) {
      this.nextToken()
    }

    return stmt
  }

  private registerPrefix(tokenType: TokenType, fn: PrefixParseFn) {
    this.prefixParseFns.set(tokenType, fn)
  }

  private registerInfix(tokenType: TokenType, fn: InfixParseFn) {
    this.infixParseFns.set(tokenType, fn)
  }

  private parseExpressionStatement(): ExpressionStatement {
    const stmt = ExpressionStatement.new(this.curToken!)

    stmt.expression = this.parseExpression(PrecedenceTable.LOWEST)

    if (this.peekTokenIs(TokenTypes.SEMICOLON)) {
      this.nextToken()
    }

    return stmt
  }

  private parseExpression(precedence: number): Expression | undefined {
    const prefix = this.prefixParseFns.get(this.curToken!.type)?.bind(this)

    if (!prefix) {
      this.noPrefixParseFnError(this.curToken?.type!)
      return
    }

    let leftExp = prefix()
    while (!this.peekTokenIs(TokenTypes.SEMICOLON) && precedence < this.peekPrecedence()) {
      const infix = this.infixParseFns.get(this.peekToken?.type!)?.bind(this)
      if (!infix) return leftExp
      this.nextToken()
      leftExp = infix(leftExp)
    }
    return leftExp
  }

  private parseIdentifier(): Expression {
    return Identifier.new(this.curToken!, this.curToken!.literal)
  }

  private parseIntegerLiteral(): Expression {
    const lit = IntegerLiteral.new(this.curToken!)
    const value = parseInt(this.curToken?.literal!)
    if (isNaN(value)) {
      const msg = `could not parse ${this.curToken?.literal} as integer`
      this.errors.push(msg)
    }

    lit.value = value
    return lit
  }

  private noPrefixParseFnError(t: TokenType) {
    const msg = `no prefix parse function for ${t} found`
    this.errors.push(msg)
  }

  private parsePrefixExpression(): Expression {
    const expression = PrefixExpression.new(this.curToken!, this.curToken?.literal!)
    this.nextToken()
    expression.right = this.parseExpression(PrecedenceTable.PREFIX)
    return expression
  }

  private peekPrecedence(): number {
    const precedence = precedences.get(this.peekToken?.type!)
    if (precedence) return precedence
    return PrecedenceTable.LOWEST
  }

  private curPrecedence(): number {
    const precedence = precedences.get(this.curToken?.type!)
    if (precedence) return precedence
    return PrecedenceTable.LOWEST
  }

  private parseInfixExpression(left: Expression): Expression {
    const expression = InfixExpression.new(this.curToken!, left, this.curToken?.literal!)
    const precedence = this.curPrecedence()
    this.nextToken()
    expression.right = this.parseExpression(precedence)
    return expression
  }
}
