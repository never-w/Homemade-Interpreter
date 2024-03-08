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
import { Boolean } from '../ast/boolean'
import { IfExpression } from '../ast/ifExpression'
import { BlockStatement } from '../ast/blockStatement'
import { FunctionLiteral } from '../ast/functionLiteral'
import { CallExpression } from '../ast/callExpression'

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
// ( 7
precedences.set(TokenTypes.LPAREN, PrecedenceTable.CALL)

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
    parser.registerPrefix(TokenTypes.TRUE, parser.parseBoolean)
    parser.registerPrefix(TokenTypes.FALSE, parser.parseBoolean)
    parser.registerPrefix(TokenTypes.LPAREN, parser.parseGroupedExpression)
    parser.registerPrefix(TokenTypes.IF, parser.parseIfExpression)
    parser.registerPrefix(TokenTypes.FUNCTION, parser.parseFunctionLiteral)

    parser.registerInfix(TokenTypes.PLUS, parser.parseInfixExpression)
    parser.registerInfix(TokenTypes.MINUS, parser.parseInfixExpression)
    parser.registerInfix(TokenTypes.SLASH, parser.parseInfixExpression)
    parser.registerInfix(TokenTypes.ASTERISK, parser.parseInfixExpression)
    parser.registerInfix(TokenTypes.EQ, parser.parseInfixExpression)
    parser.registerInfix(TokenTypes.NOT_EQ, parser.parseInfixExpression)
    parser.registerInfix(TokenTypes.LT, parser.parseInfixExpression)
    parser.registerInfix(TokenTypes.GT, parser.parseInfixExpression)
    parser.registerInfix(TokenTypes.LPAREN, parser.parseCallExpression)

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

  private parseStatement(): Statement {
    switch (this.curToken?.type) {
      case TokenTypes.LET:
        return this.parseLetStatement()
      case TokenTypes.RETURN:
        return this.parseReturnStatement()
      default:
        return this.parseExpressionStatement()
    }
  }

  private parseLetStatement(): LetStatement {
    const stmt = LetStatement.new(this.curToken)

    if (!this.expectPeek(TokenTypes.IDENT)) {
      return null
    }

    stmt.name = Identifier.new(this.curToken, this.curToken?.literal)

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
    const stmt = ReturnStatement.new(this.curToken)
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
    const stmt = ExpressionStatement.new(this.curToken)

    stmt.expression = this.parseExpression(PrecedenceTable.LOWEST)

    if (this.peekTokenIs(TokenTypes.SEMICOLON)) {
      this.nextToken()
    }

    return stmt
  }

  // !重点 parseExpression
  private parseExpression(precedence: number): Expression {
    const prefix = this.prefixParseFns.get(this.curToken?.type)?.bind(this)

    if (!prefix) {
      this.noPrefixParseFnError(this.curToken?.type)
      return null
    }

    let leftExp = prefix()
    while (!this.peekTokenIs(TokenTypes.SEMICOLON) && precedence < this.peekPrecedence()) {
      const infix = this.infixParseFns.get(this.peekToken?.type)?.bind(this)
      if (!infix) return leftExp
      this.nextToken()
      leftExp = infix(leftExp)
    }
    return leftExp
  }

  private parseIdentifier(): Expression {
    return Identifier.new(this.curToken, this.curToken?.literal)
  }

  private parseIntegerLiteral(): Expression {
    const lit = IntegerLiteral.new(this.curToken)
    const value = parseInt(this.curToken?.literal)
    if (isNaN(value)) {
      const msg = `could not parse ${this.curToken?.literal} as integer`
      this.errors.push(msg)
      return null
    }

    lit.value = value
    return lit
  }

  private noPrefixParseFnError(t: TokenType) {
    const msg = `no prefix parse function for ${t} found`
    this.errors.push(msg)
  }

  private parsePrefixExpression(): Expression {
    const expression = PrefixExpression.new(this.curToken, this.curToken?.literal)
    this.nextToken()
    expression.right = this.parseExpression(PrecedenceTable.PREFIX)
    return expression
  }

  private peekPrecedence(): number {
    const precedence = precedences.get(this.peekToken?.type)
    if (precedence) return precedence
    return PrecedenceTable.LOWEST
  }

  private curPrecedence(): number {
    const precedence = precedences.get(this.curToken?.type)
    if (precedence) return precedence
    return PrecedenceTable.LOWEST
  }

  private parseInfixExpression(left: Expression): Expression {
    const expression = InfixExpression.new(this.curToken, left, this.curToken?.literal)
    const precedence = this.curPrecedence()
    this.nextToken()
    expression.right = this.parseExpression(precedence)
    return expression
  }

  private parseBoolean(): Expression {
    return Boolean.new(this.curToken, this.curTokenIs(TokenTypes.TRUE))
  }

  private parseGroupedExpression(): Expression {
    this.nextToken()
    const exp = this.parseExpression(PrecedenceTable.LOWEST)

    if (!this.expectPeek(TokenTypes.RPAREN)) return null

    return exp
  }

  private parseIfExpression(): Expression {
    const expression = IfExpression.new(this.curToken)

    if (!this.expectPeek(TokenTypes.LPAREN)) {
      return null
    }

    this.nextToken()
    expression.condition = this.parseExpression(PrecedenceTable.LOWEST)

    if (!this.expectPeek(TokenTypes.RPAREN)) {
      return null
    }

    if (!this.expectPeek(TokenTypes.LBRACE)) {
      return null
    }

    expression.consequence = this.parseBlockStatement()

    if (this.peekTokenIs(TokenTypes.ELSE)) {
      this.nextToken()
      if (!this.expectPeek(TokenTypes.LBRACE)) return null
      expression.alternative = this.parseBlockStatement()
    }

    return expression
  }

  private parseBlockStatement(): BlockStatement {
    const block = BlockStatement.new(this.curToken)
    this.nextToken()

    while (!this.curTokenIs(TokenTypes.RBRACE) && !this.curTokenIs(TokenTypes.EOF)) {
      const stmt = this.parseStatement()
      if (stmt) block.statements.push(stmt)
      this.nextToken()
    }

    return block
  }

  private parseFunctionLiteral(): Expression {
    const lit = FunctionLiteral.new(this.curToken)

    if (!this.expectPeek(TokenTypes.LPAREN)) return null

    lit.parameters = this.parseFunctionParameters()

    if (!this.expectPeek(TokenTypes.LBRACE)) return null

    lit.body = this.parseBlockStatement()

    return lit
  }

  private parseFunctionParameters(): Identifier[] {
    const identifiers: Identifier[] = []

    if (this.peekTokenIs(TokenTypes.RPAREN)) {
      this.nextToken()
      return identifiers
    }

    this.nextToken()

    const ident = Identifier.new(this.curToken, this.curToken.literal)
    identifiers.push(ident)

    while (this.peekTokenIs(TokenTypes.COMMA)) {
      this.nextToken()
      this.nextToken()
      const ident = Identifier.new(this.curToken, this.curToken.literal)
      identifiers.push(ident)
    }

    if (!this.expectPeek(TokenTypes.RPAREN)) return null

    return identifiers
  }

  private parseCallExpression(func: Expression): Expression {
    const exp = CallExpression.new(this.curToken, func)
    exp.args = this.parseExpressionList(TokenTypes.RPAREN)
    return exp
  }

  private parseExpressionList(end: TokenType): Expression[] {
    const list: Expression[] = []

    if (this.peekTokenIs(end)) {
      this.nextToken()
      return list
    }
    this.nextToken()
    list.push(this.parseExpression(PrecedenceTable.LOWEST))

    while (this.peekTokenIs(TokenTypes.COMMA)) {
      this.nextToken()
      this.nextToken()
      list.push(this.parseExpression(PrecedenceTable.LOWEST))
    }

    if (!this.expectPeek(end)) {
      return null
    }

    return list
  }
}
