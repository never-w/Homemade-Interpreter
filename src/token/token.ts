export const TokenTypes = {
  IDENT: 'IDENT',
  INT: 'INT',

  ASSIGN: '=',
  PLUS: '+',

  COMMA: ',',
  SEMICOLON: ';',

  LPAREN: '(',
  RPAREN: ')',
  LBRACE: '{',
  RBRACE: '}',

  FUNCTION: 'FUNCTION',
  LET: 'LET',

  ILLEGAL: 'ILLEGAL',
  EOF: 'EOF',
} as const

export type TokenType = (typeof TokenTypes)[keyof typeof TokenTypes]

export type Token = {
  type: TokenType
  literal: string
}
