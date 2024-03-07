import { Token } from '../token/token'
import { Statement } from './ast'

export class BlockStatement implements Statement {
  private constructor(
    private token: Token,
    public statements: Statement[] = [],
  ) {}

  public static new(token: Token): BlockStatement {
    return new BlockStatement(token)
  }

  public statementNode(): void {}

  public tokenLiteral(): string {
    return this.token.literal
  }

  public string(): string {
    let out = ''
    for (const statement of this.statements) {
      out += statement.string()
    }

    return out
  }
}
