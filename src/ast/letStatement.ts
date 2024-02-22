import { Token } from '../token/token'
import { Expression, Statement } from './ast'
import { Identifier } from './identifier'

export class LetStatement implements Statement {
  private token: Token
  name?: Identifier
  value?: Expression

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

  string(): string {
    let out = ''
    out += this.tokenLiteral() + ' '
    out += this.name?.string()
    out += ' = '

    if (this.value) {
      out += this.value.string()
    }
    out += ';'

    return out
  }
}
