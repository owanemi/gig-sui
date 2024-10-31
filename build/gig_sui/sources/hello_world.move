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

    public fun add(x: u64, y: u64): u64 {
        return x + y
    }
}