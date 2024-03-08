import { Token } from '../token/token'
import { Expression } from './ast'

export class CallExpression implements Expression {
  private constructor(
    private token: Token,
    public func: Expression,
    public args?: Expression[],
  ) {}

  public static new(token: Token, func: Expression): CallExpression {
    return new CallExpression(token, func)
  }

  public expressionNode(): void {}

  public tokenLiteral(): string {
    return this.token.literal
  }

  public string(): string {
    let out = ''
    const args = []

    for (const arg of this.args) {
      args.push(arg.string())
    }

    out += this.func.string()
    out += '('
    out += args.join(', ')
    out += ')'

    return out
  }
}
