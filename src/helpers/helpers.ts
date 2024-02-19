import { Token, TokenType } from '../token/token'

const ASCII_CODE = {
  a: 'a'.charCodeAt(0),
  A: 'A'.charCodeAt(0),
  z: 'z'.charCodeAt(0),
  Z: 'Z'.charCodeAt(0),
  _: '_'.charCodeAt(0),
} as const

export function newToken(tokenType: TokenType, ch: string): Token {
  return {
    type: tokenType,
    literal: ch,
  }
}

/**
 * eg: foo_bar
 */
export function isLetter(ch: string) {
  const charCode = ch.charCodeAt(0)
  return (
    (ASCII_CODE.a <= charCode && charCode <= ASCII_CODE.z) ||
    (ASCII_CODE.A <= charCode && charCode <= ASCII_CODE.Z) ||
    charCode === ASCII_CODE._
  )
}
