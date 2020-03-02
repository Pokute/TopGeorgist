# Goals, Contracts and Work

Which should be higher level - Goals or Contracts?

## Goals

`ComponentGoal`: A tgo is a Goal. Check with `isComponentGoal()`.
`ComponentGoalDoer`: A tgo can do Goal related items. Check with `hasComponentGoalDoer`.

Goals define what we want the end-state to be. More commonly in inventory change goals.

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

`ComponentWork`: A tgo is a Work. Check with `isComponentWork()`.
`ComponentWorkDoer`: A tgo can do Work related items. Check with `hasComponentWorkDoer`.

Work is an application of recipe. Work is always done by a single Tgo.

Work Inventory, inputs and outputs:

	* Some works are immediate and don't require their own inventory:
		* Their recipe have at most one tangible & continous input&output item.
		* Their recipe never take longer than one tick.
		* THINK: Do these still need an inventory, since inputing all different items/work at the same time is difficult?
		* Examples:
			* A screwdriving work.
	* Other works have their own inventory:
		* Their recipe has multiple tangible inputs so these might "buffer" to internal inventory.
		* Their recipe requires multiple ticks.
		* Items inputed might be refunded.
		* Can't be assigned to an in-world item.
		* Examples:
			* Long thinking process, like deciding where to shop.
			* Eating, requires time, inventory items and skills.
	* Some works are actually in-world items:
		* Examples:
			* Building a house
			* Continuing of furniture assembling:
				* MORE DETAIL NEEDED
			* Repairing a screwdriver.
				* HOW WOULD THIS WORK?
		* Q: Sounds like prime candidate for contract. This could have multiple contributors?

Work can take inputs and outputs from `WorkDoer`:`inventory` and possibly `targetTgo`.`inventory`.

Move work practically uses a single inventory.

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
