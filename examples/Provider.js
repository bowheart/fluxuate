const storeKey = 'store'


export default class Provider extends React.Component {
	static childContextTypes = {
		[storeKey]: PropTypes.object.isRequired,
	}
	
	getChildContext() {
		return { [storeKey]: this[storeKey] }
	}

	constructor(props, context) {
		super(props, context)
		this[storeKey] = props.store
	}

	render() {
		return React.Children.only(this.props.children)
	}
}
