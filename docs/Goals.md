# Goals, Contracts and Work

Which should be higher level - Goals or Contracts?

## Goals

`ComponentGoal`: A tgo is a Goal. Check with `isComponentGoal()`.
`ComponentGoalDoer`: A tgo can do Goal related items. Check with `hasComponentGoalDoer`.

Goals define what we want the end-state to be. More commonly in inventory change goals.

* Q: How do goals know when work completes?

## Contracts

When work requirements are asymmetric. For example, hairdressing contract specifies that hairdresser does the work, not the client.
Cooperation would also be done with contracts.

Contracts handle cancellation.

Contracts can have multiple parties. Work done by different workers are transferred by the way of contract.
Multiple parties = Multiple inventories?

Social interaction like sharing locations, knowledge, prices, people while passing by could be handled by this. Or passively with goals and work.

## Recipe

Recipe define ways to transform some resouces to another.

See `data/recipes.ts` for recipes.

Recipe knowledge is global. Everyone knows about every possible recipe. At least for now.

Work availability is based on inventory items. Examples `typeId`s:
	* `tick` for recipe that take time, but can be done infinitely parallel. `tick` is a special case.
	* `foodHeating` or `tableSaw` with `exclusiveTick` for recipe that must be done in serial. Only one food item fits in a microwave. Also a special case.
	* `sunlight` without `exclusiveTick` for recipe that anyone present can use freely.

When can recipes be executed? Some recipes definitely require tools, like a forge, table saw, screwdriver, a skill.

## Work

See `Works.md`.

Move work practically uses a single inventory.

Works live in inventories:

* Either in a Tgo With `ComponentWorkDoer`'s inventory, where the works are done directly.
* Or inside GoalTgo's inventory. In this case it's the goal that activates that work.

* Work lifecycle.
	* Q: What creates works?
		* Maybe manual?
		* Goals?
	* Works are terminated on completion.
	* Q: Creating a new work for each minimal amont of work is feels very inefficient. I don't mind being inefficient, but I don't think making possibly tens of new, single-tick works per tick for each player seems overkill.
	* Goals could control many work lifespans if they don't make multiple works.

# Other concerns

* There could be multiple goals with same type of work.
* What are the priorities of those?
* Do goals run the work or do works work "by themselves"?
* Parallel works are possible with similar inputs. How to prevent those two from double-using limited resources (like thinking power or hand dexterity)?
	* A: Have separate workers inside the "Player" that have their own inventory/buffer of "thinking power". Player has a brain -> it generates up to 10 thinking power each tick.
		* Easier to have a buffer that doesn't exhaust immediately. But do we need this?
	* B: Players have separate mechanisms that fill up player's inventory with "thinking power" each tick.
		* Can be cumbersome to set limits how much the resource can grow, how much there are reserves, etc.
		* The resources must be pre-filled at the start of each tick.
	* C: Make a graph/flow/reactive system?
		* Sounds complicated.

# Work Hierarchy

* Player Tgo 
	* Upper body Tgo
		* Can perform energy+tick->strengthtooluse.
		* Can perform energy+tick->precisiontooluse.
		* Can't do both at the same time. This requires an inventory to keep track of used tick.
	* Lower body Tgo
	* Brain Tgo

Player wants flour, has grains, has a portable hand mill ->
hand mill has grains+strengthtooluse => flour recipe.
system checks inventory
	grains found
	upper body tgo has energy => strengthtooluse recipe.
strengthtooluse requires energy
system checks inventory
	energy found
a new transaction is constructed
	A:
		player:
			-energy
			+strengthtooluse
		upper body:
			-tick
	B:
		player:
			-strengthtooluse
			-grains
			+flour
		hand mill:
			-tick (or not)

Transaction is performed.

??? How do we check if a goal requires 3 crafter items? If we lose some during crafting or even gain some, the count is off.
	* Add +flour into goal's virtual inventory.
		* If someone gifts you 3 flour the crafting would still occur.
	* Have goals somehow spy on player's inventory
		* It's difficult to know if the crafted item was just donated or maybe it was generated for a different purpose, being earmarked for something else.

tick completes:
	upper body:
		reset tick
	hand mill:
		reset tick

API:
	Requirement: 3 flour
		Virtual inventory (probably). Those items don't actually exist here. It's just to keep track of created items.
		This needs a separate Tgo since it has an inventory.
		???: What's the API?
			Goal's requirement.
				If it's goal's requirement, does the goal have an inventory or is the requirement a separate Tgo with an inventory?
	? Something that iterates over all the requirements
		For goal:
			Every GoalDoer has a list of goals.
			Every tick each goaldoer checks for it's goals with requirements.
	Some code searches for recipes with output: flour.
	dispatch(transction())

	Works and recipes HAVE to be doable without goals. It feels stupid that a plant needs a goal to grow.
		? AutoWorker component?
			has a list of recipeId's that are automatically triggered.

	How to do something when work finishes?
		Depend on something that the recipe produces?
		What to do when work finishes? Actions with freeform fillable props like the UI has?
			??? What API to add these?

# Examples

## GoalRequirementMove

handleGoalRequirementMove runs until requirements are met.

Requirements currently:
	TgoId is at position.

Acts on actor inventory.
Will create `move` work to convert `calories` in `actor.inventory` to `position` in `actor.inventory`.
Uses generated `position` to move self closer and closer to target position.

## GoalRequirementConsumeTypeId

### Description
Consumes `count` amount of `typeId`.

Has an inventory that tracks how many items have been eaten.

### Steps

? Reserve items by moving them from user inventory to goal inventory?

While not enough items consumed: {

	EatWork: {
		Converts hydrocarbons to calories.
	}
}

Pineapple has a prototype with inventory: [
	{
		typeId: 'hydrocarbons',
		count: 500,
	},
]

When starting to eat a new pineapple, a work is created.
A pineapple is removed from `actor.inventory` inventory. (? `count` pineapples are removed)
A pineapple inventory prototype is copied to `goal` inventory.

`consumeWork` work is created.
work takes input from `actor.inventory.goal.inventory` and outputs to `actor.inventory`. - It shuffles items around.

## Harvest berries work.

Actor = harvester
Target = berrybush

work takes input from `target.inventory` and outputs to `actor.inventory`.

Needs access to other inventories. The berry bush provides the work?

Work is tied to `berrybush` location.

## Smelt ore to metal work.

Actor = blacksmith
Target = furnace

work inputs:
	ore from `actor.inventory` 
	ticks from `furnace` // Prevents multiple users.
	ticks from `actor` // Prevents actor from doing something else
outputs:
	outputs metal to `actor.inventory`.

Work is tied to `furnace` location.

## Buy items from unattended stop.

Actor = customer
Target = shop register

Item transaction is not part of the work specification.
