import { Token } from '../token/token'
import { Expression } from './ast'

export class Identifier implements Expression {
  private token: Token
  value: string

  private constructor(token: Token, value: string) {
    this.token = token
    this.value = value
  }

  static new(token: Token, value: string): Identifier {
    return new Identifier(token, value)
  }

  expressionNode(): void {}

  tokenLiteral(): string {
    return this.token.literal
  }

  string(): string {
    return this.value
  }
}
