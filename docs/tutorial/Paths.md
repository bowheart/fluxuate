# Paths

Paths denote the actions to which a Manager method subscribes. Most method decorators take one or more paths as arguments.

Paths are relative by default (relative to their Manager's namespace). This means that in this example...

```javascript
@Manage('gold')
class GoldManager {
	
	@Reduce('earn', 'spend')
	reduceEarn(state, payload) { ... }
}
```

...`earn` and `spend` refer to the `gold/earn` and `gold/spend` actions, respectively.

### Absolute Paths

Relative paths are what we want in most cases. But sometimes we'll need to reduce an action outside of our `gold` Manager's scope. For this we can use an absolute path:

```javascript
@Manage('gold')
class GoldManager {
	
	@Reduce('earn', 'spend')
	@Reduce('/potions/buy')
	reduceGoldChange(state, amount) {
		return state + amount
	}
}
```

### Match-All

The special paths `*` and `/*` match all local and global actions, respectively.

```javascript
@Manage('gold')
@Value(8000)
@Actions('earn', 'spend')
class GoldManager {
	
	@Reduce('*') // reduces "gold/earn", "gold/spend", and "gold/really/anything"
	reduceLocalAction(state, payload) { ... }
	
	@Reduce('/*') // reduces literally everything
	reduceGlobalAction(state, payload) { ... }
	
	@Reduce('earn') // equivalent to "/gold/earn"
	@Reduce('spend', '/potions/buy') // a decorator can define multiple paths
	reduceChange(state, payload) { ... }
}
```

### Notes

- In most cases where you'd think the global path (`/*`) is what you want, you're actually looking for a Higher-Order Reducer. More on those later.

- In our `gold` Manager, we could replace

```javascript
@Reduce('earn', 'spend')
```

with

```javascript
@Reduce('/gold/earn', '/gold/spend')
```

### Next Step

Our store has some corner-cases. Let's clean those up with [Action Interception](/docs/tutorial/ActionInterception.md).
