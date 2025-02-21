# How works work.

Work is the process of production and should be used for almost anything from harvesting crops, buying items, moving around, participating in elections and even basic metabolism. Recipes are the blueprints of production and works are the ongoing process. A work has one designated worker, but can get inputs from multiple inventories and has one output inventory.

## What's what.

`ComponentWork`: A tgo, usually contained in a `workDoer`'s inventory. Check with `isComponentWork()`.
`ComponentWorkDoer`: A tgo that can process Works residing in his inventory. Check with `hasComponentWorkDoer`.
`ComponentWorkIssuer`: A tgo that can create new Works for `workDoer`s. All `workDoer`s are also `workIssuer`s. Check with `hasComponentWorkIssuer`.

## The logic in high level.

### Creation

Usually `createWork` action is called with following parameters:
	* The recipe
	* The workDoer
	* Input inventories.
	* Output inventory.
	* The workIssuer, which can often be the workDoer.

### Initialisation

* A work tgo is created and inserted in WorkDoer's inventory.
* If needed, temporary tgo's for virtual inventories are created.
	* For each committer, a separate virtual inventory is created.
	* That virtual inventory tracks committed items.
	* On work calcellation, the items in virtual inventory are given back.

### Ticking

This is run every tick.

* First we calculate all the items that are needed, the `input` to fulfill the requirements and their item info.
* Then we find the committedItems inventories to see all the items committed by both the worker and the target.
* We subtract committed items from required items to find the missing item count.
* If missing items still remain
	* (Should work like this) Allocate required items from target inventory
	* (Should work like this) Allocate rest of required items from workDoer inventory.
	* Create a transaction based on allocated items
		* If `tick`'s are required, one is added from `tickSourceDummyTgoId`.
	* Commit the transaction
* If missing item count is zero
	* Create transaction for adding the `output` to `target` inventory.
	* Commit the transaction.

### Cancelling

Cancelling repays the committed items to their source inventories and removes all work item and associated temp inventories.
If source inventories no longer exist, the items are transported to workDoer's inventory or workIssuer's inventory. In the end, workDoer should always exist.

### Finalizing

When the work completes, the work tgo and all it's related inventories are deleted (usually).

## Current big issue.

* Current big painpoint:
* * When a work creates a subwork, the inventory tracking is all messed up.
* * * Having the subwork put created items in workDoer's inventory is not elegant.
* * * Same for even work like 'move', where movementAmount, where isStorable shoud be false, but can't be since we store it in player's inventory.
* * Solution would be that by default, works should input temporary items in their own inventory.
* * When multiple things require some resource, there could be two different works created for producing that resource, but it one produces that resource, it's practically up to chance which requirer snatches that resource up first.

For the calories->calculation->trade chain.

1) Trades are requested and work for 'trade' recipe is created.
2) 'trade' work runs and notices that 'calculation' items are required which were not found in player's inventory.
3) 'trade' work creates work for 'calculation' recipe. Output of that work will be put into work's inventory(?).
4) 'calculation' work runs by taking 'calories' from player's inventory and 'tick's.
5) 'calculation' works are completed a few times, but at some point, player runs out of 'calories'
6) ??? Does 'calculation' just wait until player itself gets more calories?
7) ??? Or does 'calculation' automatically 'consume' items. But if that happens, how does the overflow of 'calories' get back to 'player' (though this should be automatic after the work has finished, but waiting for it / relying on it is not ideal)
8) Finally all 'calculation' works are finished and trade is done. All works are destroyed, their inventories are moved to 'player' for items that are storable.

If subwork's output 'calculation' is put directly into parent work's inventory, how are the item commits tracked?
How this works, is that 'calculation' will not be committed directly.
However, on 'trade' work tick, it could look at 'calculationWork' 's output inventory and find 'calculation' there. But it 'tradeWork' 's own inventory, so it just moves it from there to committed inventory. And on work cancellation it could try to redeem to 'calculationWork's outout inventory which is it's own inventory. What a mess.

**Let's do this:** SubWork's output could instead be deposited directly into parentWork's committedItems. This also works as a kind of inventory.
Side effects items don't work for that really, so these would need a separate mechanism.

On work cancellation/completion, redeems/surplus/sideoutputs could be moved upward either to the issuer's inventory or workDoer's inventory...

## Current bugs.

* If both the `workDoer` and `target` inventories have required `input` items, double-commit might happen.

## Limitations.

* Having `tick`'s in the output doesn't do anything useful, but could be used to distribute the `output` during multiple `tick`s.
* For some recipes, like a public workshop or a quarry, there's no way to earmark certain produced items to a `workDoer`.

## Work transferability.

Work must be inside WorkDoer's inventory for any work to progress. However, in-progress work can be transferred to another inventory, but it might not continue inside that other inventory.

## Unsorted bullet points.

Work is an application of recipe. Work is always done by a single Tgo.
Works must be inside inventories.
Works inside inventories of ComponentWorkDoer are processed each tick.

## Other improvements under consideration.

* Priorities would be fine.

## Possibility: Three different kinds of works.

* Some works are immediate and don't require their own inventory:
	* Req: Their recipe have at most one tangible & continous input&output item.
	* Req: Their recipe never take longer than one tick.
	* THINK: Do these still need an inventory, since inputing all different items/work at the same time is difficult? - Prolly yeah.
	* THINK: These works should probably performed by separate, specialised tgos.
	* Examples:
		* Planning, thinking, dexterity, precision, lower body strength, upper body strength works.
		* Convert hydrocarbons to energy.
* Other works have their own inventory:
	* Either:
		* Req: Their recipe has multiple tangible inputs so these might "buffer" to internal inventory.
		* Req: Their recipe requires multiple ticks.
	* Items inputed might be refunded.
	* Examples:
		* Long thinking process, like deciding where to shop.
		* Eating, requires time, inventory items and skills.
* Some works are actually in inventories of world items which are not ComponentWorkDoer:
	* Examples:
		* Constructions site for buildings.
			* Q: How is completion handled. What replaces the construction site with the building?
	* Q: Sounds like prime candidate for contract. This could have multiple contributors?
* Unresolved cases:
	* Furnishing a house
		* Either dummy world item or just ComponentWork with ComponentPosition.
	* Prospecting an area for ores.
		* Either dummy world item (Prospecting marker) or just ComponentWork with ComponentPosition.
	* Repairing a screwdriver.
		* Maybe work is inside screwdriver's inventory or placed within the WorkDoer's (repairman) inventory?

# Multi-work chain

The current example is buying/selling at a shop. Currently trading requires `trade` items which are created with `trade` recipe.
Those in turn require `calculation` items created with `calculation` from `tick`s and `calories`. Obviously automatically creating a single work from a single recipe is not enough.

Additionally, considering how complex the recipe network is going to be, manual work creation would be overwhelming.

How automatic work creation is currently done:

* Goals create them
	* Currently only goal of type `RequirementMove` is properly implemented
	* While goal is not completed and when goal tick is triggered, a list of required items for the goal is enumerated.
		* This list is only one level deep.
	* For each item in required items list, we find if there's a recipe that can be automatically generated for it.
	* Works are automatically generated with those recipes. 

**Since works can also require other works, there becomes a need to move work creation away from goal code into a separate concern!**

Let's put aside how the initial work is created and think how the work-chain is created and used instead:

* Work chains should be created by works themselves, but in which way?
	* Directly?
		* But then some works are created by works and some not.
	* Indirectly through some requiredItems interface?
		* Easier to have a single concern responsible for work creation.
* In which inventory does the work go?
* Work chains put intermediary items into virtual inventories?
	* Solves the problem of `isStorable: false` items where the items would need to go through intermediary inventories.
	* Solves the problem of multiple requiring works/goals trying to claim the same items.
* Work chains put side-effect items into either workDoer's inventory or the environment.

