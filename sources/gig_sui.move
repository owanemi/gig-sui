#[allow(duplicate_alias)]
module hello_world::hello_world {

    use std::string::{Self, String};
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};

    public struct HelloWorldObject has key {
        id: UID,
        text: String
    }


    public entry fun mint(ctx: &mut TxContext) {
        let object = HelloWorldObject {
            id:object::new(ctx),
            text:string::utf8(b"Hello World")
        };
        transfer::transfer(object, tx_context::sender(ctx));
    }

    public fun get_text(obj: &HelloWorldObject): String {
        obj.text
    }

    public fun add(x: &mut u64, y: &mut u64): u64 {
        return *x + *y
    }
}

// module car::shop {
//     use::sui::object::{Self, UID};
//     use::sui::transfer;
//     use::sui::tx_context::{Self, TxContext};
//     use::sui::dynamic_object_field as ofield;
//     use::std::string::{Self, String};
//     use::std::option::{Self, Option};

//     struct ShopAdminCap has key {id: UID}

//     struct Tesla has key {
//         id: UID,
//         type: String,
//         speed: u32,
//         autopilot: Option<Autopilot>
//     }

//     struct Autopilot has key, store {
//         id: UID,
//         level: u32
//     }
//     /*
//         QUESTION (1): An admin role that can create shop, car and autopilot objects 
//     */

// }

struct Hero has key, store {
    id: UID,
    weapon: Option<Weapon>
}

struct Weapon has key, store {
    id: UID,
    damage: u64
}