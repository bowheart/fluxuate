# The Modular Manager

Coming soon! This part of the spec will allow creation of Manager "extensions" to break up arbitrary sub-tasks of a Manager:

```javascript
@Extend('gold')
class GoldSelectors {
	
	@Select('hasSufficientGold')
	selectHasSufficientGold(memoize, costOfItem) {
		return this.state - costOfItem >= 0
	}
}
```

This is not currently implemented.

### Next Step

[Higher-Order Reducers](/docs/tutorial/HigherOrderReducers.md)
