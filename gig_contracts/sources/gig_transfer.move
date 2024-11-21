// module gig_contracts::transfer_to_sender {
//     use sui::object::{Self, UID};
//     use sui::tx_context::TxContext;
//     use std::string::{Self, String};
//     use sui::url::{Self, Url};

//     public struct TestnetNFT has key, store {
//         id: UID,
//         name: String,
//         description: String,
//         url: Url,
//     }

//     public entry fun mint_and_transfer(
//         name: String,
//         description: String,
//         url_bytes: String,
//         recipient: address,
//         ctx: &mut TxContext
//     ) {
//         let nft = TestnetNFT {
//             id: object::new(ctx),
//             name: string::utf8(name),
//             description: string::utf8(description),
//             url: url::new_unsafe_from_bytes(url_bytes)
//         };
//         transfer::transfer(nft, recipient);
//     }
// }
