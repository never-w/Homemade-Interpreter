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
import { Boolean } from '../ast/boolean'
import { IfExpression } from '../ast/ifExpression'
import { FunctionLiteral } from '../ast/functionLiteral'
import { CallExpression } from '../ast/callExpression'

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

  it('should parse let statements with expressions', () => {
    const tests = [
      { input: 'let x = 5;', expectedIdentifier: 'x', expectedValue: 5 },
      { input: 'let y = true;', expectedIdentifier: 'y', expectedValue: true },
      {
        input: 'let foobar = y;',
        expectedIdentifier: 'foobar',
        expectedValue: 'y',
      },
    ]

    for (const test of tests) {
      const lexer = Lexer.newLexer(test.input)
      const parser = Parser.newParser(lexer)
      const program = parser.parseProgram()
      checkParserErrors(parser)

      expect(program.statements).toHaveLength(1)

      const stmt = program.statements[0]
      expect(testLetStatement(stmt, test.expectedIdentifier)).toBeTruthy()
      const letStmt = stmt as LetStatement
      expect(testLiteralExpression(letStmt.value, test.expectedValue)).toBeTruthy()
    }
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

    expect(testLiteralExpression(identExp!, 'foobar')).toBeTruthy()

    // expect(identExp instanceof Identifier).toBeTruthy()

    // const ident = identExp as Identifier

    // expect(ident.value).toEqual('foobar')
    // expect(ident.tokenLiteral()).toEqual('foobar')
  })

  it('should parse integer literal expression', () => {
    const input = `5;`

    const lexer = Lexer.newLexer(input)
    const parser = Parser.newParser(lexer)
    const program = parser.parseProgram()
    checkParserErrors(parser)

    expect(program.statements).toHaveLength(1)
    expect(program.statements[0] instanceof ExpressionStatement).toBeTruthy()

    const integerLiteralExp = (program.statements[0] as ExpressionStatement).expression

    expect(testLiteralExpression(integerLiteralExp!, 5)).toBeTruthy()

    // expect(integerLiteralExp instanceof IntegerLiteral).toBeTruthy()
    // const integerLiteral = integerLiteralExp as IntegerLiteral

    // expect(integerLiteral.value).toEqual(5)
    // expect(integerLiteral.tokenLiteral()).toEqual('5')
  })

  it('should parse prefix expressions', () => {
    const prefixTests = [
      ['!5;', '!', 5],
      ['-15;', '-', 15],

      ['!true', '!', true],
      ['!false', '!', false],
    ]

    for (const [input, expectedOperator, expectedInteger] of prefixTests) {
      const lexer = Lexer.newLexer(input as string)
      const parser = Parser.newParser(lexer)
      const program = parser.parseProgram()
      checkParserErrors(parser)

      expect(program.statements).toHaveLength(1)
      expect(program.statements[0] instanceof ExpressionStatement).toBeTruthy()

      const prefixExp = (program.statements[0] as ExpressionStatement).expression
      expect(prefixExp instanceof PrefixExpression)
      const prefix = prefixExp as PrefixExpression

      expect(prefix.operator).toEqual(expectedOperator)
      expect(testLiteralExpression(prefix.right!, expectedInteger as number)).toBeTruthy()
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

      ['true == true', true, '==', true],
      ['true != false', true, '!=', false],
      ['false == false', false, '==', false],
    ] as const

    for (const [input, expectedLeft, expectedOperator, expectedRight] of infixTests) {
      const lexer = Lexer.newLexer(input as string)
      const parser = Parser.newParser(lexer)
      const program = parser.parseProgram()
      checkParserErrors(parser)

      expect(program.statements).toHaveLength(1)
      expect(program.statements[0] instanceof ExpressionStatement).toBeTruthy()

      const infixExp = (program.statements[0] as ExpressionStatement).expression

      expect(testInfixExpression(infixExp!, expectedLeft, expectedOperator, expectedRight)).toBeTruthy()

      // expect(infixExp instanceof InfixExpression)
      // const infix = infixExp as InfixExpression

      // expect(testIntegerLiteral(infix.left!, expectedLeft as number)).toBeTruthy()
      // expect(infix.operator).toEqual(expectedOperator as string)
      // expect(testIntegerLiteral(infix.right!, expectedRight as number)).toBeTruthy()
    }
  })

  it('should parse correctly the operator precedences', () => {
    const tests = [
      ['-a * b', '((-a) * b)'],
      ['!-a', '(!(-a))'],
      ['a + b + c', '((a + b) + c)'],
      ['a + b - c', '((a + b) - c)'],
      ['a * b * c', '((a * b) * c)'],
      ['a * b / c', '((a * b) / c)'],
      ['a + b / c', '(a + (b / c))'],
      ['a + b * c + d / e - f', '(((a + (b * c)) + (d / e)) - f)'],
      ['3 + 4; -5 * 5', '(3 + 4)((-5) * 5)'],
      ['5 > 4 == 3 < 4', '((5 > 4) == (3 < 4))'],
      ['5 < 4 != 3 > 4', '((5 < 4) != (3 > 4))'],
      ['3 + 4 * 5 == 3 * 1 + 4 * 5', '((3 + (4 * 5)) == ((3 * 1) + (4 * 5)))'],
      ['3 + 4 * 5 == 3 * 1 + 4 * 5', '((3 + (4 * 5)) == ((3 * 1) + (4 * 5)))'],

      ['true', 'true'],
      ['false', 'false'],
      ['3 > 5 == false', '((3 > 5) == false)'],
      ['3 < 5 == true', '((3 < 5) == true)'],

      ['1 + (2 + 3) + 4', '((1 + (2 + 3)) + 4)'],
      ['(5 + 5) * 2', '((5 + 5) * 2)'],
      ['2 / (5 + 5)', '(2 / (5 + 5))'],
      ['-(5 + 5)', '(-(5 + 5))'],
      ['!(true == true)', '(!(true == true))'],
      ['a + add(b * c) + d', '((a + add((b * c))) + d)'],
      ['add(a, b, 1, 2 * 3, 4 + 5, add(6, 7 * 8))', 'add(a, b, 1, (2 * 3), (4 + 5), add(6, (7 * 8)))'],
      ['add(a + b + c * d / f + g)', 'add((((a + b) + ((c * d) / f)) + g))'],

      // ['a * [1, 2, 3, 4][b * c] * d', '((a * ([1, 2, 3, 4][(b * c)])) * d)'],
      // ['add(a * b[2], b[1], 2 * [1, 2][1])', 'add((a * (b[2])), (b[1]), (2 * ([1, 2][1])))'],
    ]

    for (const [input, expected] of tests) {
      const lexer = Lexer.newLexer(input)
      const parser = Parser.newParser(lexer)
      const program = parser.parseProgram()
      checkParserErrors(parser)

      const actual = program.string()

      expect(actual).toEqual(expected)
    }
  })

  it('should parse boolean expression', () => {
    const input = `true;`

    const lexer = Lexer.newLexer(input)
    const parser = Parser.newParser(lexer)
    const program = parser.parseProgram()
    checkParserErrors(parser)

    expect(program.statements).toHaveLength(1)

    const stmt = program.statements[0]

    expect(stmt instanceof ExpressionStatement).toBeTruthy()

    const boolExp = (stmt as ExpressionStatement).expression

    expect(testLiteralExpression(boolExp!, true)).toBeTruthy()
  })

  it('should parse if expression', () => {
    const input = `if(x < y) { x }`

    const lexer = Lexer.newLexer(input)
    const parser = Parser.newParser(lexer)
    const program = parser.parseProgram()
    checkParserErrors(parser)
    expect(program.statements).toHaveLength(1)

    const stmt = program.statements[0]

    expect(stmt instanceof ExpressionStatement).toBeTruthy()
    const exp = (stmt as ExpressionStatement).expression
    expect(exp instanceof IfExpression).toBeTruthy()
    const ifExp = exp as IfExpression

    expect(testInfixExpression(ifExp.condition, 'x', '<', 'y')).toBeTruthy()

    expect(ifExp.consequence.statements).toHaveLength(1)

    expect(ifExp.consequence.statements[0] instanceof ExpressionStatement).toBeTruthy()

    const consequence = ifExp.consequence.statements[0] as ExpressionStatement

    expect(testIdentifier(consequence.expression, 'x')).toBeTruthy()
    expect(ifExp.alternative).not.toBeDefined()
  })

  it('should parse if else expression', () => {
    const input = `if(x < y) { x } else { y }`

    const lexer = Lexer.newLexer(input)
    const parser = Parser.newParser(lexer)
    const program = parser.parseProgram()
    checkParserErrors(parser)
    expect(program.statements).toHaveLength(1)

    const stmt = program.statements[0]

    expect(stmt instanceof ExpressionStatement).toBeTruthy()
    const exp = (stmt as ExpressionStatement).expression
    expect(exp instanceof IfExpression).toBeTruthy()
    const ifExp = exp as IfExpression

    expect(testInfixExpression(ifExp.condition, 'x', '<', 'y')).toBeTruthy()

    expect(ifExp.consequence.statements).toHaveLength(1)

    expect(ifExp.consequence.statements[0] instanceof ExpressionStatement).toBeTruthy()

    const consequence = ifExp.consequence.statements[0] as ExpressionStatement

    expect(testIdentifier(consequence.expression, 'x')).toBeTruthy()
    expect(ifExp.alternative).not.toBeNull()

    expect(ifExp.alternative.statements).toHaveLength(1)

    expect(ifExp.alternative.statements[0] instanceof ExpressionStatement).toBeTruthy()

    const alternative = ifExp.alternative.statements[0] as ExpressionStatement

    expect(testIdentifier(alternative.expression, 'y')).toBeTruthy()
  })

  it('should parse function literal', () => {
    const input = 'fn(x, y) { x + y; }'

    const lexer = Lexer.newLexer(input)
    const parser = Parser.newParser(lexer)
    const program = parser.parseProgram()
    checkParserErrors(parser)

    expect(program.statements).toHaveLength(1)

    const stmt = program.statements[0]

    expect(stmt instanceof ExpressionStatement).toBeTruthy()
    const exp = (stmt as ExpressionStatement).expression

    expect(exp instanceof FunctionLiteral).toBeTruthy()
    const fnExp = exp as FunctionLiteral

    expect(fnExp.parameters).toHaveLength(2)

    expect(testLiteralExpression(fnExp.parameters[0], 'x')).toBeTruthy()
    expect(testLiteralExpression(fnExp.parameters[1], 'y')).toBeTruthy()

    expect(fnExp.body.statements).toHaveLength(1)
    expect(fnExp.body.statements[0] instanceof ExpressionStatement).toBeTruthy()
    expect(
      testInfixExpression((fnExp.body.statements[0] as ExpressionStatement).expression, 'x', '+', 'y'),
    ).toBeTruthy()
  })

  it('should parse function parameters', () => {
    const tests = [
      ['fn() {};', []],
      ['fn(x) {};', ['x']],
      ['fn(x, y, z) {};', ['x', 'y', 'z']],
    ]

    for (const [input, outputParams] of tests) {
      const lexer = Lexer.newLexer(input as string)
      const parser = Parser.newParser(lexer)
      const program = parser.parseProgram()
      checkParserErrors(parser)

      const stmt = program.statements[0] as ExpressionStatement
      const functionExp = stmt.expression as FunctionLiteral

      expect(functionExp.parameters).toHaveLength(outputParams.length)
      ;(outputParams as string[]).forEach((param, idx) => {
        expect(testLiteralExpression(functionExp.parameters[idx], param)).toBeTruthy()
      })
    }
  })

  it('should parse call expressions', () => {
    const input = 'add(1, 2 * 3, 4 + 5);'

    const lexer = Lexer.newLexer(input)
    const parser = Parser.newParser(lexer)
    const program = parser.parseProgram()
    checkParserErrors(parser)

    expect(program.statements).toHaveLength(1)

    const stmt = program.statements[0]

    expect(stmt instanceof ExpressionStatement).toBeTruthy()
    const exp = (stmt as ExpressionStatement).expression

    expect(exp instanceof CallExpression).toBeTruthy()
    const callExp = exp as CallExpression

    expect(testIdentifier(callExp.func, 'add')).toBeTruthy()

    expect(callExp.args).toHaveLength(3)

    expect(testLiteralExpression(callExp.args[0], 1)).toBeTruthy()
    expect(testInfixExpression(callExp.args[1], 2, '*', 3)).toBeTruthy()
    expect(testInfixExpression(callExp.args[2], 4, '+', 5)).toBeTruthy()
  })
})

function testLetStatement(stmt: Statement, expected: string): boolean {
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

  return errors.length > 0 ? true : false
}

function testIntegerLiteral(il: Expression, value: number): boolean {
  if (!(il instanceof IntegerLiteral)) {
    return false
  }
  const ilExp = il as IntegerLiteral

  if (ilExp.value !== value) {
    return false
  }

  if (ilExp.tokenLiteral() !== `${value}`) {
    return false
  }

  return true
}

function testIdentifier(exp: Expression, value: string): boolean {
  if (!(exp instanceof Identifier)) {
    return false
  }
  const ident = exp as Identifier

  if (ident.value !== value) {
    return false
  }

  if (ident.tokenLiteral() !== value) {
    return false
  }

  return true
}

function testLiteralExpression(exp: Expression, expected: any): boolean {
  switch (typeof expected) {
    case 'number':
      return testIntegerLiteral(exp, expected)
    case 'string':
      return testIdentifier(exp, expected)
    case 'boolean':
      return testBooleanLiteral(exp, expected)
  }
  return false
}

function testInfixExpression(exp: Expression, left: any, operator: string, right: any): boolean {
  if (!(exp instanceof InfixExpression)) {
    return false
  }

  const infix = exp as InfixExpression

  if (!testLiteralExpression(infix.left, left)) {
    return false
  }

  if (infix.operator !== operator) {
    return false
  }

  if (!testLiteralExpression(infix.right!, right)) {
    return false
  }

  return true
}

function testBooleanLiteral(exp: Expression, value: boolean): boolean {
  if (!(exp instanceof Boolean)) {
    return false
  }
  const boolExp = exp as Boolean

  if (boolExp.value !== value) {
    return false
  }

  if (boolExp.tokenLiteral() !== `${value}`) {
    return false
  }

  return true
}
