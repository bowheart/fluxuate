# Higher-Order Reducers

Coming soon! This part of the spec will allow Confluxes to be wrapped in third-party higher-order reducers such as [redux-ignore](https://github.com/omnidan/redux-ignore):

```javascript
import { Enhance, Manage } from 'fluxuate'
import { ignoreActions } from 'redux-ignore'

@Manage('gold')
@Enhance(conflux => ignoreActions(conflux, ['weapons/buy', 'weapons/sell']))
class GoldManager {
	...
}
```

This is not currently implemented.

### Next Step

[The Big Picture](/docs/tutorial/TheBigPicture.md).
