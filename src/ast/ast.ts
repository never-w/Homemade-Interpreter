import { Token } from '../token/token'

interface ASTNode {
  tokenLiteral(): string
}

export interface Statement extends ASTNode {
  statementNode(): void
}

interface Expression extends ASTNode {
  expressionNode(): void
}

export class Program implements ASTNode {
  statements: Statement[]

  constructor(statements: Statement[]) {
    this.statements = statements
  }

  tokenLiteral(): string {
    if (this.statements.length > 0) {
      return this.statements[0].tokenLiteral()
    }
    return ''
  }
}

export class LetStatement implements Statement {
  private token: Token
  name: Identifier
  private value: Expression

  constructor(token: Token, name: Identifier, value: Expression) {
    this.token = token
    this.name = name
    this.value = value
  }

  statementNode(): void {}

  tokenLiteral(): string {
    return this.token.literal
  }
}

class Identifier implements Expression {
  private token: Token
  value: string

  constructor(token: Token, value: string) {
    this.token = token
    this.value = value
  }

  expressionNode(): void {}

  tokenLiteral(): string {
    return this.token.literal
  }
}
