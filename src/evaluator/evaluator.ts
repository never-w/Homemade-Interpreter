import { ASTNode } from '../ast/ast'
import { IntegerLiteral } from '../ast/integerLiteral'

export function evaluator(node: ASTNode): Object {
  switch (true) {
    case node instanceof IntegerLiteral:
      return true
  }
}
