import { Lexer } from './src/lexer/lexer'
import { Parser } from './src/parser/parser'

const input = 'let num = 23; if(x < y) { x } else { y };'

const lexer = Lexer.newLexer(input as string)
const parser = Parser.newParser(lexer)
const program = parser.parseProgram()

console.dir(program, { depth: Infinity })
