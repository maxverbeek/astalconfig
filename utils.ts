import { Binding, Variable } from "astal"

type StringOrBooleanBinding = string | Record<string, Binding<boolean> | null>

/**
  * Example usage
  *
  * cn(['button'], { active: bind(mything, 'active') })
  *   -> returns Variable("button active") if the binding resolves to true
  */
export function cn(...classOrBindings: StringOrBooleanBinding[]): Variable<string> {
  const classes = classOrBindings.filter(cob => typeof cob === "string") as string[]
  const booleans = classOrBindings.filter(cob => typeof cob === "object") as Record<string, Binding<boolean> | null>[]

  const idxbindings = booleans.flatMap(bindObjects => Object.keys(bindObjects))
  const bindings = booleans.flatMap(bindObjects => Object.values(bindObjects).filter(b => b !== null)) as Binding<boolean>[]

  // create a variable that listens on all of the bindings, and conditionally adds a class based on whether that binding evaluates to true
  return Variable.derive(bindings, (...enabled) => {
    const enabledClasses = enabled.flatMap((included, idx) => included ? [idxbindings[idx]] : [])
    const allClasses = classes.concat(enabledClasses)

    return allClasses.join(' ')
  })
}

export function percentage(zeroToOne: number): string {
  return `${Math.floor(zeroToOne * 100)}%`
}
