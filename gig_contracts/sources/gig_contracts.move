// #[allow(duplicate_alias, unused_const)]
// module gig_contracts::gig_contracts {
//     use sui::object::{Self, UID};
//     use sui::transfer;
//     use sui::tx_context::{Self, TxContext};
//     use sui::balance::{Self, Balance};
//     use sui::coin::{Self, Coin};
//     use sui::sui::SUI;

//     /// Custom errors
//     const EFundraiserNotActive: u64 = 0;
//     const EGoalReached: u64 = 1;
//     const EDeadlineNotReached: u64 = 2;
//     const ENotOwner: u64 = 3;

//     /// Struct to represent the fundraiser
//     public struct Fundraiser has key {
//         id: UID,
//         owner: address,
//         balance: Balance<SUI>,
//         goal: u64,
//         deadline: u64,
//         active: bool,
//         description: vector<u8>
//     }

//     /// Events
//     public struct DonationEvent has copy, drop {
//         fundraiser_id: address,
//         donor: address,
//         amount: u64,
//     }

//     /// Create a new fundraiser
//     public entry fun create_fundraiser(
//         goal: u64,
//         deadline: u64,
//         description: vector<u8>,
//         ctx: &mut TxContext
//     ) {
//         let fundraiser = Fundraiser {
//             id: object::new(ctx),
//             owner: tx_context::sender(ctx),
//             balance: balance::zero(),
//             goal,
//             deadline,
//             active: true,
//             description
//         };

//         transfer::share_object(fundraiser);
//     }

//     /// Donate to the fundraiser
//     public entry fun donate(
//         fundraiser: &mut Fundraiser,
//         payment: &mut Coin<SUI>,
//         amount: u64,
//         ctx: &mut TxContext
//     ) {
//         assert!(fundraiser.active, EFundraiserNotActive);
        
//         let coin_balance = coin::balance_mut(payment);
//         let paid = balance::split(coin_balance, amount);
//         balance::join(&mut fundraiser.balance, paid);

//         // Emit donation event
//         let event = DonationEvent {
//             fundraiser_id: object::id_address(fundraiser),
//             donor: tx_context::sender(ctx),
//             amount
//         };
//         sui::event::emit(event);
//     }

//     /// Withdraw funds (only owner can call after deadline)
//     public entry fun withdraw(
//         fundraiser: &mut Fundraiser,
//         ctx: &mut TxContext
//     ) {
//         assert!(tx_context::sender(ctx) == fundraiser.owner, ENotOwner);
//         assert!(tx_context::epoch(ctx) >= fundraiser.deadline, EDeadlineNotReached);

//         let amount = balance::value(&fundraiser.balance);
//         let withdrawn_coin = coin::from_balance(
//             balance::split(&mut fundraiser.balance, amount),
//             ctx
//         );
        
//         transfer::public_transfer(withdrawn_coin, fundraiser.owner);
//         fundraiser.active = false;
//     }

//     /// View functions
//     public fun get_balance(fundraiser: &Fundraiser): u64 {
//         balance::value(&fundraiser.balance)
//     }

//     public fun get_goal(fundraiser: &Fundraiser): u64 {
//         fundraiser.goal
//     }

//     public fun get_deadline(fundraiser: &Fundraiser): u64 {
//         fundraiser.deadline
//     }

//     public fun is_active(fundraiser: &Fundraiser): bool {
//         fundraiser.active
//     }
// }