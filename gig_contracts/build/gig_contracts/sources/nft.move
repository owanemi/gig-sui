#[allow(duplicate_alias, unused_const, unused_field, unused_use)]
module gig_contracts::nft {
    use sui::object::{Self, UID};
    use std::string::{Self, String, utf8};
    use sui::tx_context::{Self, TxContext};
    use sui::package;
    use sui::display;
    use sui::transfer;

    public struct Nft has store, key {
        id: UID,
        name: String,
        description: String,
        img_url: String,
    }

    public struct NFT has drop {
        dummy_field: bool,
    }

    fun init(arg0: NFT, arg1: &mut TxContext) {
        let keys = vector[
            utf8(b"name"),
            utf8(b"description"),
            utf8(b"image_url"),
            utf8(b"project_url"),
            utf8(b"creator")
        ];

        let values = vector[
            utf8(b"{name}"),
            utf8(b"{description}"),
            utf8(b"{img_url}"),
            utf8(b"https://gig-sui.vercel.app"),
            utf8(b"GIG SUI TEAM")
        ];

        let publisher = package::claim(arg0, arg1);
        let mut display = display::new_with_fields<Nft>(&publisher, keys, values, arg1);
        display::update_version(&mut display);
        transfer::public_transfer(publisher, tx_context::sender(arg1));
        transfer::public_transfer(display, tx_context::sender(arg1));
    }

    public entry fun mint(name: String, description: String, img_url: String, ctx: &mut TxContext) {
        let nft = Nft {
            id: object::new(ctx),
            name: name,
            description: description,
            img_url: img_url,
        };
        transfer::public_transfer(nft, tx_context::sender(ctx));
    }

    public entry fun transfer(nft: Nft, recipient: address, _: &mut TxContext) {
        transfer::public_transfer(nft, recipient);
    }
}

