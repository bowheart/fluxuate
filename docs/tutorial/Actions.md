# Actions

Here's our `gold` Manager:

```javascript
import { Manage, Value, getConflux } from 'fluxuate'

@Manage('gold')
@Value(8000)
class GoldManager {}
```

Our character can't do much with that. In fact, he can't do anything. Let's give our Manager some Actions.

```javascript
@Manage('gold')
@Value(8000)
class GoldManager {
	
	@Action('earn')
	actionEarn(amount) {
		return amount
	}
	
	@Action('spend')
	actionSpend(amount) {
		return amount
	}
}
```

If you noticed that these methods aren't normal Redux action creators, you're right. They're payload creators. Fluxuate will handle creating the actual Redux `action` objects for us. All we need to specify is the `payload` property of that object. See the [Flux Standard Action](https://github.com/acdlite/flux-standard-action) github page for more info.

The resulting action types created by these two actions are `gold/earn` and `gold/spend` respectively.

> Note: In Fluxuate, all action creators are bound by default. This means that the action will be automatically dispatched to the store upon creation.

Cool. But I'm seeing duplication. There's no need for this in Fluxuate!

```javascript
@Manage('gold')
@Value(8000)
class GoldManager {
	
	@Action('earn')
	@Action('spend')
	payloadCreator(amount) {
		return amount
	}
}
```

> Fact: Any method in a Fluxuate Manager can be multi-purposed indefinitely by adding more decorators.

So this is better. But you'll notice that the `payloadCreator()` method just returns exactly what it's given. This is the identity function.

```javascript
arg => arg
```

Since this pattern is so common amongst payload creators, we really shouldn't have to create that function at all. `@Actions()` to the rescue!

```javascript
@Manage('gold')
@Value(8000)
@Actions('earn', 'spend')
class GoldManager {}
```

This allows us to declare all the actions belonging to a Manager in one place. All actions will default to the identity function. Even if we end up overriding some actions, we can still leave their names in the `Actions` list, making it as much meta info as it is functionality.

```javascript
@Manage('gold')
@Value(8000)
@Actions('earn', 'spend')
class GoldManager {
	
	@Action('spend')
	payloadCreator(pricePerItem, numItems) {
		return pricePerItem * numItems
	}
}
```

### Next Step

Let's create some [action reducers](/docs/tutorial/Reducers.md).
