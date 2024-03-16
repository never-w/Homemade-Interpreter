import { Lexer } from '../lexer/lexer'
import { Parser } from '../parser/parser'
import { Object } from '../object/object'
import { Integer } from '../object/integer'
import { evaluator } from './evaluator'
import { Boolean } from '../object/boolean'
import { Null } from '../object/null'

describe('Evaluator', () => {
  it('should evaluate integer expression', () => {
    const tests = [
      {
        input: '5',
        expected: 5,
      },
      {
        input: '10',
        expected: 10,
      },
      {
        input: '-5',
        expected: -5,
      },
      {
        input: '-10',
        expected: -10,
      },
      {
        input: '5 + 5+ 5 + 5 -10',
        expected: 10,
      },
      {
        input: '2 * 2 * 2 * 2 * 2',
        expected: 32,
      },
      {
        input: '-50 + 100 + -50',
        expected: 0,
      },
      {
        input: '5 * 2 + 10',
        expected: 20,
      },
      {
        input: '5 + 2 * 10',
        expected: 25,
      },
      {
        input: '20 + 2 * -10',
        expected: 0,
      },
      {
        input: '50 / 2 * 2 + 10',
        expected: 60,
      },
      {
        input: '2 * (5 + 10)',
        expected: 30,
      },
      {
        input: '3 * 3 * 3 + 10',
        expected: 37,
      },
      {
        input: '3 * (3 * 3) + 10',
        expected: 37,
      },
      {
        input: '(5 + 10 * 2 + 15 / 3) * 2 + -10',
        expected: 50,
      },
    ]

    for (const test of tests) {
      const evaluated = testEval(test.input)
      expect(testIntegerObject(evaluated, test.expected)).toEqual(true)
    }
  })

  it('should evaluate boolean expression', () => {
    const tests = [
      {
        input: 'true',
        expected: true,
      },
      {
        input: 'false',
        expected: false,
      },

      {
        input: '1 < 2',
        expected: true,
      },
      {
        input: '1 > 2',
        expected: false,
      },
      {
        input: '1 < 1',
        expected: false,
      },
      {
        input: '1 > 1',
        expected: false,
      },
      {
        input: '1 == 1',
        expected: true,
      },
      {
        input: '1 != 1',
        expected: false,
      },
      {
        input: '1 == 2',
        expected: false,
      },
      {
        input: '1 != 2',
        expected: true,
      },

      {
        input: 'true == true',
        expected: true,
      },
      {
        input: 'false == false',
        expected: true,
      },
      {
        input: 'true == false',
        expected: false,
      },
      {
        input: 'true != false',
        expected: true,
      },
      {
        input: 'false != true',
        expected: true,
      },
      {
        input: '(1 < 2) == true',
        expected: true,
      },
      {
        input: '(1 < 2) == false',
        expected: false,
      },
      {
        input: '(1 > 2) == true',
        expected: false,
      },
      {
        input: '(1 > 2) == false',
        expected: true,
      },
    ]

    for (const test of tests) {
      const evaluated = testEval(test.input)
      expect(testBooleanObject(evaluated, test.expected)).toEqual(true)
    }
  })

  it('should evaluate bang operator', () => {
    const tests = [
      {
        input: '!true',
        expected: false,
      },
      {
        input: '!false',
        expected: true,
      },
      {
        input: '!5',
        expected: false,
      },
      {
        input: '!!true',
        expected: true,
      },
      {
        input: '!!false',
        expected: false,
      },
      {
        input: '!!5',
        expected: true,
      },
    ]

    for (const test of tests) {
      const evaluated = testEval(test.input)
      expect(testBooleanObject(evaluated, test.expected)).toEqual(true)
    }
  })

  it('should evaluate if else expressions', () => {
    const tests = [
      { input: 'if (true) { 10 }', expected: 10 },
      { input: 'if (false) { 10 }', expected: null },
      { input: 'if (1) { 10 }', expected: 10 },
      { input: 'if (1 < 2) { 10 }', expected: 10 },
      { input: 'if (1 > 2) { 10 }', expected: null },
      { input: 'if (1 > 2) { 10 } else { 20 }', expected: 20 },
      { input: 'if (1 < 2) { 10 } else { 20 }', expected: 10 },
      // {
      //   input: `if(10 > 1) {
      //   if (10 > 1) {
      //     return 10;
      //   }
      //   return 1;
      // }`,
      //   expected: 10,
      // },
    ]

    for (const test of tests) {
      const evaluated = testEval(test.input)
      if (typeof test.expected === 'number') {
        expect(testIntegerObject(evaluated, test.expected)).toEqual(true)
      } else {
        expect(testNullObject(evaluated)).toEqual(true)
      }
    }
  })
})

function testEval(input: string) {
  const lexer = Lexer.newLexer(input)
  const parser = Parser.newParser(lexer)
  const program = parser.parseProgram()

  return evaluator(program)
}

function testIntegerObject(obj: Object, expected: number): boolean {
  if (!(obj instanceof Integer)) return false

  const intObj = obj as Integer

  if (intObj.value !== expected) return false

  return true
}

function testBooleanObject(obj: Object, expected: boolean): boolean {
  if (!(obj instanceof Boolean)) return false

  const boolObj = obj as Boolean

  if (boolObj.value !== expected) return false

  return true
}

function testNullObject(obj: Object): boolean {
  if (obj instanceof Null) return true
  return false
}
