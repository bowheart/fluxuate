import store from './store/store'
import cart from './store/cart'
import cash from './store/cash'
import cookies from './store/entities/cookies'
import Provider from '../Provider'
import Use from '../Use'


@Use(() => ({
	cart: cart.state,
	cash: cash.state,
	addToCart: cart.action.add,
	cashAfterCheckout: cash.select.afterCheckout,
	getCookieName: cookies.select.name,
	getSubtotal: cart.select.subtotal
}))
class App extends React.Component {
	nextAction = () => {
		actions.shift()()
	}
	
	render() {
		return (
			<div>
				<button onClick={this.nextAction}>Next Action</button>
				<ul>
					{this.props.cart.map(item =>
						<li key={item.id}>
							<div>{this.props.getCookieName(item.cookieId)}</div>
							<div>Quantity: {item.quantity}</div>
						</li>
					)}
				</ul>
				<div>Current Cash: {this.props.cash}</div>
				<div>Subtotal: {this.props.getSubtotal()}</div>
				<div>Difference: {this.props.cashAfterCheckout()}</div>
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
	() => cart.action.add(0, 12),
	() => cart.action.add(1, 16),
	() => cash.action.earn(5000),
	() => cart.action.add(0, 200),
	() => cart.action.checkout(),
	() => cart.action.add(1, 1),
	() => cart.action.add(1, 10)
]
