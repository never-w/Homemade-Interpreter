import { Token } from '../token/token'
import { Expression } from './ast'
import { BlockStatement } from './blockStatement'

export class IfExpression implements Expression {
  private constructor(
    private token: Token,
    public condition?: Expression,
    public consequence?: BlockStatement,
    public alternative?: BlockStatement,
  ) {}

  static new(token: Token): IfExpression {
    return new IfExpression(token)
  }

  expressionNode(): void {}

  tokenLiteral(): string {
    return this.token.literal
  }

  string(): string {
    let out = ''
    out += 'if'
    out += this.condition.string()
    out += ' '
    out += this.consequence.string()

    if (this.alternative) {
      out += 'else'
      out += this.alternative.string()
    }

    return out
  }
}
