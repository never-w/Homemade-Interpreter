import { Token } from '../token/token'
import { Expression, Statement } from './ast'
import { Identifier } from './identifier'

export class LetStatement implements Statement {
  private token: Token
  name?: Identifier
  private value?: Expression

  private constructor(token: Token) {
    this.token = token
  }

  static new(token: Token) {
    return new LetStatement(token)
  }

  statementNode(): void {}

  tokenLiteral(): string {
    return this.token.literal
  }
}
