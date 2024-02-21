import { LetStatement, Statement } from '../ast/ast'
import { Lexer } from '../lexer/lexer'
import { Parser } from './parser'

describe('Parser', () => {
  it('should return let statements', () => {
    const input = `let x = 5;
        let y = 10;
        let foobar = 838383;`

    const lexer = Lexer.newLexer(input)
    const parser = Parser.newParser(lexer)
    const program = parser.parseProgram()

    expect(program).toBeDefined()
    expect(program?.statements).toHaveLength(3)

    const tests = ['x', 'y', 'foobar']

    tests.forEach((expected, index) => {
      const stmt = program?.statements[index]
      expect(testLetStatement(stmt!, expected)).toBeTruthy()
    })
  })
})

function testLetStatement(stmt: Statement, expected: string) {
  if (
    !stmt ||
    stmt.tokenLiteral() !== 'let' ||
    !(stmt instanceof LetStatement) ||
    stmt.name.value !== expected ||
    stmt.name.tokenLiteral() !== expected
  ) {
    return false
  }

  return true
}
