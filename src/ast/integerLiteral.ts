import { Token } from '../token/token'
import { Expression } from './ast'

export class IntegerLiteral implements Expression {
  private token: Token
  value?: number

  private constructor(token: Token) {
    this.token = token
  }

  static new(token: Token): IntegerLiteral {
    return new IntegerLiteral(token)
  }

  expressionNode(): void {}

  tokenLiteral(): string {
    return this.token.literal
  }

  string(): string {
    return this.token.literal
  }
}
