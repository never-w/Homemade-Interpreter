import { Token } from '../token/token'
import { Expression, Statement } from './ast'

export class ReturnStatement implements Statement {
  private token: Token
  returnValue?: Expression

  private constructor(token: Token) {
    this.token = token
  }

  static new(token: Token): ReturnStatement {
    return new ReturnStatement(token)
  }

  statementNode(): void {}

  tokenLiteral(): string {
    return this.token.literal
  }
}
