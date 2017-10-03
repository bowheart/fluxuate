## Philosophies and Project Goals

- Simpler is better.

- Syntax should be easy to remember, easy to write, and **easy to read**.

- Should massively reduce Redux boilerplate

- No arbitrary 1:1:1 groupings (or any sub-groupings thereof) of actions to reducers to components should be required or even encouraged.

- Should be entirely decoupled from React and other view libraries.

- Naming schemes should be patterned after core Redux.

- All features should be opt-in. This allows existing projects to migrate to Fluxuate bit-by-bit.

- Everything should have an escape hatch. Nothing should lock you in to doing things the "Fluxuate" way. Raw Redux (or other helper libraries) should always be readily at hand.

- Reducer composition should be easy.

- Asynchronous side effects, etc, should be easy.

- Action creators should be unnecessary, but still an option. Correct FSA actions should be completely abstracted away by default.

- String constants should be unnecessary. String literals should be safer to use than in raw Redux.

- Hot Module Replacement should just work.

- Code splitting should be a breeze.

- Should provide a solid foundation for learning Redux itself with little or no deviations from the ideologies espoused by it.

- Should be appealing to beginners and to people coming from non-functional-programming paradigms, specifically people with Object-Oriented backgrounds.

- Should provide common utilities such as composable, memoized selectors, before and after action hooks, request/success/failure sub-actions, and optimistic updates.

- The state tree should be relatively traversable.

- Should be extensible. Add-ons to Fluxuate functionality should be straightforward to write and use.

- Should integrate easily with immutability libraries and the concept in general.
