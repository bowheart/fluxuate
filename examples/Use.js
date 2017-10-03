export default function Use(getState) {
	return WrappedComponent => {
		return class extends React.Component {
			static contextTypes = {
				store: PropTypes.object.isRequired
			}
			
			constructor(props, context) {
				super(props)
				
				this.store = props.store || context.store
				this.state = getState()
			}
			
			componentDidMount() {
				this.unsubscribe = this.store.subscribe(() => {
					this.setState(getState())
				})
			}
			
			componentWillUnmount() {
				this.unsubscribe()
			}
			
			render() {
				return <WrappedComponent {...this.props} {...this.state} />
			}
		}
	}
}
