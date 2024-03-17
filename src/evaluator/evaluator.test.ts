import { Lexer } from '../lexer/lexer'
import { Parser } from '../parser/parser'
import { Object } from '../object/object'
import { Integer } from '../object/integer'
import { evaluator } from './evaluator'
import { Boolean } from '../object/boolean'
import { Error } from '../object/error'
import { Null } from '../object/null'
import { Environment } from '../object/environment'
import { Function } from '../object/function'

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
      {
        input: `if(10 > 1) {
        if (10 > 1) {
          return 10;
        }
        return 1;
      }`,
        expected: 10,
      },
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

  it('should evaluate return statements', () => {
    const tests = [
      { input: 'return 10;', expected: 10 },
      { input: 'return 10; 9;', expected: 10 },
      { input: 'return 2 * 5; 9;', expected: 10 },
      { input: '9; return 2 * 5; 9;', expected: 10 },
    ]

    for (const test of tests) {
      const evaluated = testEval(test.input)
      expect(testIntegerObject(evaluated, test.expected)).toEqual(true)
    }
  })

  it('should evaluate errors', () => {
    const tests = [
      ['5 + true;', 'type mismatch: INTEGER + BOOLEAN'],
      ['5 + true; 5;', 'type mismatch: INTEGER + BOOLEAN'],
      ['-true', 'unknown operator: -BOOLEAN'],
      ['true + false;', 'unknown operator: BOOLEAN + BOOLEAN'],
      ['5; true + false; 5', 'unknown operator: BOOLEAN + BOOLEAN'],
      ['if (10 > 1) { true + false; }', 'unknown operator: BOOLEAN + BOOLEAN'],
      [
        `if(10 > 1) {
        if (10 > 1) {
          return true + false;
        }
        return 1;
      }`,
        'unknown operator: BOOLEAN + BOOLEAN',
      ],

      ['foobar', 'identifier not found: foobar'],

      // [`"Hello" - "World"`, 'unknown operator: STRING - STRING'],
      // [`{"name": "Monkey"}[fn(x) { x }]`, 'unusable as hash key: FUNCTION'],
    ]

    for (const [input, expected] of tests) {
      const evaluated = testEval(input)
      expect(evaluated instanceof Error).toBeTruthy()
      const errObj = evaluated as Error
      expect(errObj.message).toEqual(expected)
    }
  })

  it('should evaluate let statements', () => {
    const tests = [
      { input: 'let a = 5; a;', expected: 5 },
      { input: 'let a = 5 * 5; a;', expected: 25 },
      { input: 'let a = 5; let b = a; b;', expected: 5 },
      { input: 'let a = 5; let b = a; let c = a + b + 5; c;', expected: 15 },
    ]

    for (const test of tests) {
      expect(testIntegerObject(testEval(test.input), test.expected)).toBe(true)
    }
  })

  it('should evaluate function object', () => {
    const input = 'fn(x) { x + 2; };'
    const evaluated = testEval(input)
    expect(evaluated instanceof Function).toBe(true)
    const fn = evaluated as Function

    expect(fn.parameters).toHaveLength(1)
    expect(fn.parameters[0].string()).toEqual('x')
    expect(fn.body.string()).toEqual('(x + 2)')
  })

  it('should evaluate function calls', () => {
    const tests = [
      { input: 'let identity = fn(x) { x; }; identity(5);', expected: 5 },
      {
        input: 'let identity = fn(x) { return x; }; identity(5);',
        expected: 5,
      },
      { input: 'let double = fn(x) { x * 2; }; double(5);', expected: 10 },
      { input: 'let add = fn(x, y) { x + y; }; add(5, 5);', expected: 10 },
      {
        input: 'let add = fn(x, y) { x + y; }; add(5 + 5, add(5, 5));',
        expected: 20,
      },
      {
        input: 'fn(x) { x; }(5)',
        expected: 5,
      },
    ]
    for (const { input, expected } of tests) {
      expect(testIntegerObject(testEval(input), expected)).toBe(true)
    }
  })
})

function testEval(input: string) {
  const lexer = Lexer.newLexer(input)
  const parser = Parser.newParser(lexer)
  const program = parser.parseProgram()
  const environment = Environment.new()

  return evaluator(program, environment)
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
