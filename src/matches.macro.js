import { createMacro, MacroError } from 'babel-plugin-macros'

const ARGUMENT_NAME = 'arg'

let matchesMacro = createMacro(
  ({ references, babel: { types: t, template } }) => {
    let ifEqualsReturnTrue = template(`if (EXPRESSION === VALUE) return true`)
    let regexpTest = template(`if (REGEXP.test(EXPRESSION)) return true`)
    let returnFalse = template(`return false`)

    let optionalMemberExpression = (object, property) =>
      t.optionalMemberExpression(object, property, false, true)

    references.default.forEach(referencePath => {
      let { parent, parentPath } = referencePath
      if (
        !t.isCallExpression(parent) ||
        !t.isObjectExpression(parent.arguments[0])
      ) {
        throw new MacroError(
          'matches() must be called as a function with one object argument'
        )
      }
      let object = parent.arguments[0]
      let statements = object.properties.map(property => {
        if (t.isIdentifier(property.key)) {
          if (t.isRegExpLiteral(property.value)) {
            return regexpTest({
              REGEXP: property.value,
              EXPRESSION: optionalMemberExpression(
                t.identifier(ARGUMENT_NAME),
                t.identifier(property.key.name)
              ),
            })
          }
          return ifEqualsReturnTrue({
            EXPRESSION: optionalMemberExpression(
              t.identifier(ARGUMENT_NAME),
              t.identifier(property.key.name)
            ),
            VALUE: t.stringLiteral(property.value.value),
          })
        }
        if (t.isStringLiteral(property.key)) {
          let keys = property.key.value.split('.')
          if (keys.length === 1) {
            if (t.isRegExpLiteral(property.value)) {
              return regexpTest({
                REGEXP: property.value,
                EXPRESSION: optionalMemberExpression(
                  t.identifier(ARGUMENT_NAME),
                  t.identifier(property.key.value)
                ),
              })
            }
            return ifEqualsReturnTrue({
              EXPRESSION: optionalMemberExpression(
                t.identifier(ARGUMENT_NAME),
                t.identifier(property.key.value)
              ),
              VALUE: t.stringLiteral(property.value.value),
            })
          }
          let buildChain = (keys, index = 0) => {
            if (index === keys.length - 1) {
              return optionalMemberExpression(
                optionalMemberExpression(
                  t.identifier(ARGUMENT_NAME),
                  t.identifier(keys[index - 1])
                ),
                t.identifier(keys[index])
              )
            }
            return buildChain(keys, index + 1)
          }
          return ifEqualsReturnTrue({
            EXPRESSION: buildChain(keys),
            VALUE: t.stringLiteral(property.value.value),
          })
        }
        throw new MacroError(`Unsupported object key type ${property.type}`)
      })
      parentPath.replaceWith(
        t.arrowFunctionExpression(
          [t.identifier(ARGUMENT_NAME)],
          t.blockStatement([...statements, returnFalse()])
        )
      )
    })
  }
)

export default matchesMacro
