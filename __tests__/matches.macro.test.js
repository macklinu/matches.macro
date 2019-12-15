import pluginTester from 'babel-plugin-tester'
import plugin from 'babel-plugin-macros'
import { stripIndent, stripIndents } from 'common-tags'

pluginTester({
  plugin,
  pluginName: 'matches.macro',
  snapshot: true,
  babelOptions: {
    filename: __filename,
  },
  tests: [
    {
      title: 'matches() throws without any arguments',
      error: true,
      code: stripIndents`
    import matches from '../src/matches.macro'
    
    const isBasketball = matches()
    `,
    },
    {
      title: 'matches() throws with non-object argument',
      error: true,
      code: stripIndents`
    import matches from '../src/matches.macro'
    
    const isBasketball = matches('hello')
    `,
    },
    stripIndent`
    import matches from '../src/matches.macro'
    
    const isNbaBasketball = matches({
      type: 'basketball',
      'ballColor': 'orange',
      ballMaker: /spalding/i,
      'ballMaker': /spalding/i,
      'league.type': 'NBA'
    })
    `,
  ],
})
