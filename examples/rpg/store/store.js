import { handleStoreCreation } from '../../../src/index'
import gold from './gold'


export default handleStoreCreation()


// const store = handleStoreCreation(null, {
// 	gold: 8000,
// 	potions: {
// 		health: 11,
// 		energy: 2
// 	},
// 	weapons: [ 'dagger', 'crossbow' ],
// 	entities: {
// 		potions: {
// 			health: {
// 				restores: { health: +10 }
// 			},
// 			energy: {
// 				restores: { energy: +20 }
// 			},
// 			strength: {
// 				buffs: {
// 					stats: [ 'damage' ],
// 					effect: +50,
// 					duration: 200
// 				}
// 			}
// 		},
// 		weapons: {
// 			dagger: {
// 				damage: 5,
// 				speed: 22
// 			},
// 			crossbow: {
// 				damage: 16,
// 				speed: 6
// 			},
// 			scimitar: {
// 				damage: 12,
// 				speed: 14
// 			}
// 		}
// 	}
// })


// export default store
