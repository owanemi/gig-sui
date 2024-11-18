// #[allow(duplicate_alias, unused_use, unused_field)]
// module gig_contracts::vector {
//     use std::vector;

//     public struct Item {}

//     // Vector for a specified item
//     public struct ItemVector {
//         items: vector<Item>
//     }

//     // Vector for a generalzied Item
//     public struct GenericVector<T> {
//         values: vector<T>
//     }

//     // Creates a generic vector that holds items of generic type T
//     public fun create<T>(): GenericVector<T> {
//         GenericVector<T> {
//             values: vector::empty<T>()
//         }
//     }

//     // Add an item of type T to a generic Vector 
//     public fun addItem<T>(vec: &mut GenericVector<T>, item: T) {
//         vector::push_back<T>(&mut vec.values, item)
//     }

//     // Removes an item of type T from the generic vector 
//     public fun removeItem<T>(vec: &mut GenericVector<T>): T {
//         vector::pop_back<T>(&mut vec.values)
//     }

//     // returns the size of the vector
//     public fun getSize<T>(vec: &mut GenericVector<T>): u64 {
//         vector::length<T>(&vec.values)
//     }
// }

// #[allow(unused_field, duplicate_alias, unused_use)]
// module gig_contracts::table {
//     use sui::table::{Table, Self};
//     use sui::tx_context::{TxContext};

//     // defining a table with specified types for the key and value
//     public struct ItemTable {
//         table_values: Table<u8, u8>
//     }

//     // defining a table with generic types for the key and value
//     public struct GenericItemTable<phantom K: copy + drop + store, phantom V: store> {
//         table_values: Table<K, V>
//     }
// }