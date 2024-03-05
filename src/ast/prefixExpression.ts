import { Token } from '../token/token'
import { Expression } from './ast'

export class PrefixExpression implements Expression {
  private token: Token
  operator: string
  right?: Expression

  private constructor(token: Token, operator: string) {
    this.token = token
    this.operator = operator
  }

  static new(token: Token, operator: string) {
    return new PrefixExpression(token, operator)
  }

  expressionNode(): void {}

  tokenLiteral(): string {
    return this.token.literal
  }

  string(): string {
    let out = ''
    out += '('
    out += this.operator
    out += this.right?.string()
    out += ')'

    return out
  }
}
