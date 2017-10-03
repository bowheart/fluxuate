import { Actions, Action, After, Before, Manage, Reduce, createFluxuateMiddleware, getConflux, registerStore } from '../../src/index'
import { applyMiddleware, createStore } from 'redux'


let idCounter = 0


@Manage('todos')
@Actions('create', 'toggleCompleted')
class TodosManager {
	entities = []
	
	
	@Reduce('create')
	reduceCreate(state, payload) {
		let newTodo = {id: idCounter++, text: payload, isCompleted: false}
		
		return {...state, entities: state.entities.concat([newTodo])}
	}
	
	
	@Before('toggleCompleted')
	beforeToggleCompleted(action) {
		console.log('intercepted toggle completed action beforehand!', action)
	}
	
	
	@Reduce('toggleCompleted')
	reduceToggleCompleted(state, payload) {
		console.log('reducing toggleCompleted action', payload)
		let entities = state.entities.map(todo => {
			return todo.id === payload
				? {...todo, isCompleted: !todo.isCompleted}
				: todo
		})
		return {...state, entities}
	}
	
	
	@Before('toggleCompleted')
	@After('toggleCompleted')
	afterToggleCompleted(action) {
		console.log('intercepted toggle completed action at some point!', action)
	}
}


let conflux = getConflux()
let fluxuateMiddleware = createFluxuateMiddleware()
let store = createStore(conflux, applyMiddleware(fluxuateMiddleware))
registerStore(store)


store.subscribe(() => {
	console.log('the store was updated. New state:', store.getState())
})


let todosConflux = getConflux('todos')
todosConflux.action.create('a new todo')
todosConflux.action.toggleCompleted(0)
