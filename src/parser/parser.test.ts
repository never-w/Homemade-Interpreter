import { Expression, Statement } from '../ast/ast'
import { ExpressionStatement } from '../ast/expressionStatement'
import { Identifier } from '../ast/identifier'
import { InfixExpression } from '../ast/infixExpression'
import { IntegerLiteral } from '../ast/integerLiteral'
import { LetStatement } from '../ast/letStatement'
import { PrefixExpression } from '../ast/prefixExpression'
import { ReturnStatement } from '../ast/returnStatement'
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

    expect(checkParserErrors(parser)).toBeFalsy()

    expect(program).toBeDefined()
    expect(program?.statements).toHaveLength(3)

    const tests = ['x', 'y', 'foobar']

    tests.forEach((expected, index) => {
      const stmt = program?.statements[index]
      expect(testLetStatement(stmt, expected)).toBeTruthy()
    })
  })

  it('should parse return statements', () => {
    const input = `return 5;
    return 10;
    return 993322;`

    const lexer = Lexer.newLexer(input)
    const parser = Parser.newParser(lexer)
    const program = parser.parseProgram()
    checkParserErrors(parser)

    expect(program.statements).toHaveLength(3)

    for (let stmt of program.statements) {
      const returnStmt = stmt
      expect(returnStmt instanceof ReturnStatement).toBeTruthy()
      expect(returnStmt.tokenLiteral()).toEqual('return')
    }
  })

  it('should parse identifier expression', () => {
    const input = `foobar;`

    const lexer = Lexer.newLexer(input)
    const parser = Parser.newParser(lexer)
    const program = parser.parseProgram()
    checkParserErrors(parser)

    expect(program.statements).toHaveLength(1)

    const stmt = program.statements[0]

    expect(stmt instanceof ExpressionStatement).toBeTruthy()

    const identExp = (stmt as ExpressionStatement).expression

    expect(identExp instanceof Identifier).toBeTruthy()

    const ident = identExp as Identifier

    expect(ident.value).toEqual('foobar')
    expect(ident.tokenLiteral()).toEqual('foobar')
  })

  it('should parse literal expression', () => {
    const input = `5;`

    const lexer = Lexer.newLexer(input)
    const parser = Parser.newParser(lexer)
    const program = parser.parseProgram()
    checkParserErrors(parser)

    expect(program.statements).toHaveLength(1)
    expect(program.statements[0] instanceof ExpressionStatement).toBeTruthy()

    const integerLiteralExp = (program.statements[0] as ExpressionStatement).expression

    expect(integerLiteralExp instanceof IntegerLiteral).toBeTruthy()
    const integerLiteral = integerLiteralExp as IntegerLiteral

    expect(integerLiteral.value).toEqual(5)
    expect(integerLiteral.tokenLiteral()).toEqual('5')
  })

  it('should parse prefix expressions', () => {
    const prefixTests = [
      ['!5;', '!', 5],
      ['-15;', '-', 15],
    ] as const

    for (const [input, expectedOperator, expectedInteger] of prefixTests) {
      const lexer = Lexer.newLexer(input)
      const parser = Parser.newParser(lexer)
      const program = parser.parseProgram()
      checkParserErrors(parser)

      expect(program.statements).toHaveLength(1)
      expect(program.statements[0] instanceof ExpressionStatement).toBeTruthy()

      const prefixExp = (program.statements[0] as ExpressionStatement).expression
      expect(prefixExp instanceof PrefixExpression)
      const prefix = prefixExp as PrefixExpression

      expect(prefix.operator).toEqual(expectedOperator)
      expect(testIntegerLiteral(prefix.right!, expectedInteger)).toBeTruthy()
    }
  })

  it('should parse infix expressions', () => {
    const infixTests = [
      ['5 + 5', 5, '+', 5],
      ['5 - 5', 5, '-', 5],
      ['5 * 5', 5, '*', 5],
      ['5 / 5', 5, '/', 5],
      ['5 > 5', 5, '>', 5],
      ['5 < 5', 5, '<', 5],
      ['5 == 5', 5, '==', 5],
      ['5 != 5', 5, '!=', 5],
      // ['true == true', true, '==', true],
      // ['true != false', true, '!=', false],
      // ['false == false', false, '==', false],
    ] as const

    for (const [input, expectedLeft, expectedOperator, expectedRight] of infixTests) {
      const lexer = Lexer.newLexer(input as string)
      const parser = Parser.newParser(lexer)
      const program = parser.parseProgram()
      checkParserErrors(parser)

      expect(program.statements).toHaveLength(1)
      expect(program.statements[0] instanceof ExpressionStatement).toBeTruthy()

      const infixExp = (program.statements[0] as ExpressionStatement).expression
      expect(infixExp instanceof InfixExpression)
      const infix = infixExp as InfixExpression

      expect(testIntegerLiteral(infix.left!, expectedLeft as number)).toBeTruthy()
      expect(infix.operator).toEqual(expectedOperator as string)
      expect(testIntegerLiteral(infix.right!, expectedRight as number)).toBeTruthy()
    }
  })
})

function testLetStatement(stmt: Statement, expected: string) {
  if (
    !stmt ||
    stmt.tokenLiteral() !== 'let' ||
    !(stmt instanceof LetStatement) ||
    stmt.name?.value !== expected ||
    stmt.name.tokenLiteral() !== expected
  ) {
    return false
  }

  return true
}

function checkParserErrors(parser: Parser): boolean {
  const errors = parser.getErrors()
  console.log(`parser has ${errors.length} errors`)
  for (const error of errors) {
    console.error(`parser error: ${error}`)
  }
  return !!errors.length
}

function testIntegerLiteral(it: Expression, value: number): boolean {
  if (!(it instanceof IntegerLiteral)) return false

  const ilExp = it as IntegerLiteral

  if (ilExp.value !== value) return false

  if (ilExp.tokenLiteral() !== `${value}`) return false

  return true
}
