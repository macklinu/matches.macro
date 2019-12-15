import { createMacro, MacroError } from 'babel-plugin-macros'

const ARGUMENT_NAME = 'arg'

let matchesMacro = createMacro(({ references, babel: { types: t } }) => {
  let returnTrue = () => t.returnStatement(t.booleanLiteral(true))
  let returnFalse = () => t.returnStatement(t.booleanLiteral(false))
  let ifEqualsReturnTrue = (left, right) =>
    t.ifStatement(t.binaryExpression('===', left, right), returnTrue())
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
    parentPath.replaceWith(
      t.arrowFunctionExpression(
        [t.identifier(ARGUMENT_NAME)],
        t.blockStatement(
          object.properties
            .map(property => {
              if (t.isIdentifier(property.key)) {
                return ifEqualsReturnTrue(
                  optionalMemberExpression(
                    t.identifier(ARGUMENT_NAME),
                    t.identifier(property.key.name)
                  ),
                  t.stringLiteral(property.value.value)
                )
              }
              if (t.isStringLiteral(property.key)) {
                let keys = property.key.value.split('.')
                if (keys.length === 1) {
                  return ifEqualsReturnTrue(
                    optionalMemberExpression(
                      t.identifier(ARGUMENT_NAME),
                      t.identifier(property.key.value)
                    ),
                    t.stringLiteral(property.value.value)
                  )
                }
                let buildChain = (keys, index) => {
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
                return ifEqualsReturnTrue(
                  buildChain(keys, 0),
                  t.stringLiteral(property.value.value)
                )
              }
              throw new MacroError(
                `Unsupported object key type ${property.type}`
              )
            })
            .concat(returnFalse())
        )
      )
    )
  })
})

export default matchesMacro
