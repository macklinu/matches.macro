import { expectError, expectType } from 'tsd'
import matches from '.'

type Predicate = (value: unknown) => boolean

expectError(matches())
expectError(matches(''))

const isSpaldingBasketball = matches({
  type: 'basketball',
  maker: /^spalding$/i,
  isNew: true,
  cost: value => value > 10,
})

expectType<Predicate>(isSpaldingBasketball)
