import { TokenTypes } from '../token/token'
import { Identifier } from './identifier'
import { LetStatement } from './letStatement'
import { Program } from './program'

describe('AST', () => {
  it('should return proper string from string method', () => {
    const program = Program.new()
    const letStmt = LetStatement.new({ type: TokenTypes.LET, literal: 'let' })
    letStmt.name = Identifier.new({ type: TokenTypes.IDENT, literal: 'myVar' }, 'myVar')
    letStmt.value = Identifier.new({ type: TokenTypes.IDENT, literal: 'anotherVar' }, 'anotherVar')
    program.statements.push(letStmt)

    expect(program.string()).toEqual('let myVar = anotherVar;')
  })
})
