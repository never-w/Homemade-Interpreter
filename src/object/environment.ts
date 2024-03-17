import { Object } from './object'

export class Environment {
  store: Map<string, Object>
  outer: Environment

  constructor() {
    this.store = new Map()
    this.outer = null
  }

  public static new(): Environment {
    return new Environment()
  }

  public static newEnclosedEnvironment(outer: Environment): Environment {
    const env = Environment.new()
    env.outer = outer
    return env
  }

  public get(name: string): Object {
    let obj = this.store.get(name)
    if (!obj && this.outer) {
      obj = this.outer.get(name)
    }
    return obj
  }

  public set(name: string, value: Object): Object {
    this.store.set(name, value)
    return value
  }
}
