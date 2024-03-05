import { Token } from '../token/token'
import { Expression } from './ast'

export class InfixExpression implements Expression {
  private constructor(
    private token: Token,
    public left: Expression,
    public operator: string,
    public right?: Expression,
  ) {}

  static new(token: Token, left: Expression, operator: string) {
    return new InfixExpression(token, left, operator)
  }

  expressionNode(): void {}

  tokenLiteral(): string {
    return this.token.literal
  }

  string(): string {
    let out = ''
    out += '('
    out += this.left.string()
    out += ' ' + this.operator + ' '
    out += this.right?.string()
    out += ')'

    return out
  }
}
