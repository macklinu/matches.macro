import pluginTester from 'babel-plugin-tester'
import plugin from 'babel-plugin-macros'
import { stripIndent } from 'common-tags'

pluginTester({
  plugin,
  pluginName: 'matches.macro',
  snapshot: true,
  babelOptions: {
    filename: __filename,
  },
  tests: [
    {
      title: 'throws without any arguments',
      error: true,
      code: stripIndent`
    import matches from '../src/matches.macro'
    
    const isBasketball = matches()
    `,
    },
    {
      title: 'throws with non-object argument',
      error: true,
      code: stripIndent`
    import matches from '../src/matches.macro'
    
    const isBasketball = matches('hello')
    `,
    },
    {
      title: 'supports all features',
      code: stripIndent`
    import matches from '../src/matches.macro'
    
    const isNbaBasketball = matches({
      type: 'basketball',
      'ballColor': 'orange',
      ballMaker: /spalding/i,
      'ballMaker': /spalding/i,
      'league.type': 'NBA'
    })
    `,
    },
  ],
})
