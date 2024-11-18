// module gig_contracts::game {
//     use sui::bag::{Bag, Self};
//     use::sui::tx_context{TxContext};

//     struct GameInventory {
//         items: Bag
//     }

//     public fun create(ctx: &mut TxContext): GameInventory {
//         GameInventory{
//             items: bag::new(ctx)
//         }
//     }

//     // adds the key-value pair to Game Inventory
//     public fun add<K: copy + drop + store, V: store>(bag: &mut GameInventory, k: K, v: V) {
//         bag::add(&mut bag.items, k, v);
//     }

//     // removes the key-value pair from the inventory with provided key and returns the value
//     public fun remove<K: copy + drop + store, V: store>(bag: &mut GameInventory, k: K): V {
//         bag::remove(&mut bag.items, k)
//     }

//     // borrow a mutable referenece to the value associated with the key in game inventory
//     public fun borrow_mut<K: copy + drop + store, V: store>(bag: &mut GameInventory, k: K): &mut V {
//         bag::borrow_mut(&mut bag.items, k)
//     }

//     // checks if a value associated with the key exists in the GameInventory
//     public fun contains<K: copy + drop + store, V: store>(bag: &GameInventory, k: K): bool {
//         bag::contains<K>(&bag.items, k)
//     }

//     // Returns the size of the GamInventory, returns the no. of key-value pairs
//     public fun length(bag: &GameInventory): u64 {
//         bag::length(&bag.items);
//     }

// }