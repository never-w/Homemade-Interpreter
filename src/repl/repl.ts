import readline from 'readline'
import { Lexer } from '../lexer/lexer'
import { TokenTypes } from '../token/token'

const repl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: '->',
})

repl.prompt()

repl.on('line', (input) => {
  const lexer = Lexer.newLexer(input)

  while (true) {
    const token = lexer.nextToken()
    console.log(token)
    if (token.type === TokenTypes.EOF) break
  }

  repl.prompt()
})

repl.on('close', () => {
  console.log('Have a nice day!')
  process.exit(0)
})
