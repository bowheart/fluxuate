# First Manager

Consider this state representing a simple Role-Playing Game:

```javascript
{
	gold: 8000,
	weapons: [ 'dagger' ],
	entities: {
		weapons: {
			dagger: {
				cost: 500
			},
			crossbow: {
				cost: 2600
			}
		}
	}
}
```

If you know Redux, your mind has already written over 100 lines of boilerplate to configure this store's state management, not including the actual logic. But using Fluxuate, we're going to try to write everything necessary to manage this store in **100 lines of code or less**.

It all starts with a Manager.

```javascript
import { Manage } from 'fluxuate'

@Manage('gold')
class GoldManager {}
```

In Fluxuate, every piece of the store is managed by a Manager. Managers are just plain ES6 classes that are given a namespace to control and may define the shape and default initial state of that namespace. Managers can define decorated methods to create action creators, reducers, selectors, and pre- and post-action hooks.

In this example, `GoldManager` is the Manager and `gold` is its namespace. This means that in the root store object, there will be a property called `gold` whose value is controlled by `GoldManager`. Fluxuate will make our store's state looks like the following:

```javascript
{
	gold: {}
}
```

You may have noticed that we didn't define any "shape and default initial state" in our Manager. As such it'll default to an empty object (`{}`). Not quite what we want. Let's define a property on our Manager:

```javascript
@Manage('gold')
class GoldManager {
	gold = 8000
}
```

When using class fields from the stage 3 ECMAScript proposal, we are assuming that the data type controlled by the Manager is an object. In this case, our store's default state will now look like:

```javascript
{
	gold: {
		gold: 8000
	}
}
```

Still not what we want. In this case, we need to use the special Fluxuate `@Value()` decorator:

```javascript
import { Manage, Value } from 'fluxuate'

@Manage('gold')
@Value(8000)
class GoldManager {}
```

This'll give our store the default state of:

```javascript
{
	gold: 8000
}
```

### Notes

- The default value of a Manager is an empty object (`{}`).

- Defining properties on our Manager tells Fluxuate to add those fields to the default object.

- Those fields can't be private! Fluxuate needs access to them. So using the `#privateVar = val` syntax is out.

- We don't have to use the class fields proposal. We could, of course, just use straight ES5 - declaring properties via `this.prop = val` in the constructor function. But you'd be pretty weird to use Fluxuate without lots of future stuff (namely the stage 2 decorators proposal). These docs will not so much as give an example of such a thing.

- The `@Value()` decorator will override the Manager's default object. Any class fields declared on a Manager with a `@Value()` decorator will be ignored.

### Next step

Let's look at this Manager's [Conflux](/docs/tutorial/TheConflux.md).
