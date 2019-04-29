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

## Work

`ComponentWork`: A tgo is a Work. Check with `isComponentWork()`.
`ComponentWorkDoer`: A tgo can do Work related items. Check with `hasComponentWorkDoer`.

Works define recipes to transform from one item to another.
Work is always done by a single Tgo.
Work can take inputs and outputs from `WorkDoer`:`inventory` and possibly `targetTgo`.`inventory`.

See `data/works.ts` for recipes.

Work knowledge is global. Everyone knows about every possible work.

Work availability is based on inventory items. Examples `typeId`s:
	* `tick` for work that take time, but can be done infinitely parallel. `tick` is a special case.
	* `foodHeating` or `tableSaw` with `exclusiveTick` for work that must be done in serial. Only one food item fits in a microwave. Also a special case.
	* `sunlight` without `exclusiveTick` for work that anyone present can use freely.

What makes works available? Some definitely require tools, like a forge, table saw, screwdriver, a skill, another person.
Move practically uses a single inventory.

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
		Converts calories to calories.
	}
}

Pineapple has a prototype with inventory: [
	{
		typeId: 'calories',
		count: 500,
	},
]

When starting to eat a new pineapple, a workInstance is created.
A pineapple is removed from `actor.inventory` inventory. (? `count` pineapples are removed)
A pineapple inventory prototype is copied to `goal` inventory.

`consumeWork` workInstance is created.
workInstance takes input from `actor.inventory.goal.inventory` and outputs to `actor.inventory`. - It shuffles items around.

## Harvest berries work.

Actor = harvester
Target = berrybush

workInstance takes input from `target.inventory` and outputs to `actor.inventory`.

Needs access to other inventories. The berry bush provides the work?

Work is tied to `berrybush` location.

## Smelt ore to metal work.

Actor = blacksmith
Target = furnace

workInstance inputs:
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
