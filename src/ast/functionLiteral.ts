import { Token } from '../token/token'
import { Expression } from './ast'
import { BlockStatement } from './blockStatement'
import { Identifier } from './identifier'

export class FunctionLiteral implements Expression {
  private constructor(
    private token: Token,
    public parameters?: Identifier[],
    public body?: BlockStatement,
  ) {}

  public static new(token: Token): FunctionLiteral {
    return new FunctionLiteral(token)
  }

  public expressionNode(): void {}

  public tokenLiteral(): string {
    return this.token.literal
  }

  public string(): string {
    let out = ''
    const params = []

    for (const parameter of this.parameters) {
      params.push(parameter.string())
    }

    out += this.tokenLiteral()
    out += '('
    out += params.join(', ')
    out += ') '
    out += this.body.string()

    return out
  }
}
