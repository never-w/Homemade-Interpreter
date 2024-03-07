import { Token } from '../token/token'
import { Statement } from './ast'

export class BlockStatement implements Statement {
  constructor(
    private token: Token,
    public statements: Statement[],
  ) {}

  statementNode(): void {}

  tokenLiteral(): string {
    return this.token.literal
  }

  string(): string {
    let out = ''
    for (const stmt of this.statements) {
      out += stmt.string()
    }

    return out
  }
}
