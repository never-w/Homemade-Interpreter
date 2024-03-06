import { Token } from '../token/token'
import { Expression } from './ast'

export class Boolean implements Expression {
  private constructor(
    private token: Token,
    public value: boolean,
  ) {}

  public static new(token: Token, value: boolean): Boolean {
    return new Boolean(token, value)
  }

  public expressionNode(): void {}

  public tokenLiteral(): string {
    return this.token.literal
  }

  public string(): string {
    return this.token.literal
  }
}
