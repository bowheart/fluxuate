import Provider from '../Provider'
import Use from '../Use'

import gold from './store/gold'
import store from './store/store'
import weapons from './store/weapons'


@Use(() => ({
	
}))
class App extends React.Component {
	nextAction = () => {
		actions.shift()()
	}
	
	render() {
		return (
			<div>
				<button onClick={this.nextAction}>Next Action</button>
			</div>
		)
	}
}


ReactDOM.render(
	<Provider store={store}>
		<App />
	</Provider>,
	document.getElementById('root')
)


let actions = [
	() => console.log(store.getState()),
	() => gold.action.earn(200),
	() => gold.action.spend(4000),
	() => console.log(gold.select.hasSufficientGold(5000)),
	() => gold.action.spend(5000), // will fail
	() => console.log(gold.state),
	
	() => weapons.action.buy('crossbow'),
	() => console.log(gold.state),
	() => weapons.action.sell('dagger'),
	() => console.log(gold.state, weapons.state, store.getState())
]
