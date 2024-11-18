/// Copyright (c) Sui Foundation, Inc.
/// SPDX-License-Identifier: Apache-2.0
///

// #[allow(duplicate_alias, unused_mut_parameter)]
// module gig_contracts::gameMarket {
//     use sui::dynamic_object_field as ofield;
//     use sui::tx_context::{Self, TxContext};
//     use sui::object::{Self, ID, UID};
//     use sui::coin::{Self, Coin};
//     use sui::bag::{Bag, Self};
//     use sui::table::{Table, Self};
//     use sui::transfer;

//     /// For when amount paid does not match the expected.
//     const EAmountIncorrect: u64 = 0;
//     /// For when someone tries to delist without ownership.
//     const ENotOwner: u64 = 1;

//     /// A shared `GameMarket`. Can be created by anyone using the
//     /// `create` function. One instance of `GameMarket` accepts
//     /// only one type of Coin - `COIN` for all its listings.
//     public struct GameMarket<phantom COIN> has key {
//         id: UID,
//         gameItems: Bag,
//         payments: Table<address, Coin<COIN>>
//     }

//     /// A single listing which contains the listed item and its
//     /// price in [`Coin<COIN>`].
//     public struct GameListing has key, store {
//         id: UID,
//         ask: u64,
//         owner: address,
//     }

//     /// Create a new shared GameMarket.
//     public entry fun create<COIN>(ctx: &mut TxContext) {
//         let id = object::new(ctx);
//         let gameItems = bag::new(ctx);
//         let payments = table::new<address, Coin<COIN>>(ctx);
//         transfer::share_object(GameMarket<COIN> { 
//             id, 
//             gameItems,
//             payments
//         })
//     }

//     /// List an item at the GameMarket.
//     public entry fun list<T: key + store, COIN>(
//         gameMarket: &mut GameMarket<COIN>,
//         item: T,
//         ask: u64,
//         ctx: &mut TxContext
//     ) {
//         let item_id = object::id(&item);
//         let mut gameListing = GameListing {
//             ask,
//             id: object::new(ctx),
//             owner: tx_context::sender(ctx),
//         };

//         ofield::add(&mut gameListing.id, true, item);
//         bag::add(&mut gameMarket.gameItems, item_id, gameListing)
//     }

//     /// Internal function to remove listing and get an item back. Only owner can do that.
//     fun delist<T: key + store, COIN>(
//         gameMarket: &mut GameMarket<COIN>,
//         item_id: ID,
//         ctx: &mut TxContext
//     ): T {
//         let GameListing {
//             mut id,
//             owner,
//             ask: _,
//         } = bag::remove(&mut gameMarket.gameItems, item_id);

//         assert!(tx_context::sender(ctx) == owner, ENotOwner);

//         let item = ofield::remove(&mut id, true);
//         object::delete(id);
//         item
//     }

//     /// Call [`delist`] and transfer item to the sender.
//     public entry fun delist_and_take<T: key + store, COIN>(
//         gameMarket: &mut GameMarket<COIN>,
//         item_id: ID,
//         ctx: &mut TxContext
//     ) {
//         let item = delist<T, COIN>(gameMarket, item_id, ctx);
//         transfer::public_transfer(item, tx_context::sender(ctx));
//     }

//     /// Internal function to purchase an item using a known GameListing. Payment is done in Coin<C>.
//     /// Amount paid must match the requested amount. If conditions are met,
//     /// owner of the item gets the payment and buyer receives their item.
//     fun buy<T: key + store, COIN>(
//         gameMarket: &mut GameMarket<COIN>,
//         item_id: ID,
//         paid: Coin<COIN>,
//     ): T {
//         let GameListing {
//             mut id,
//             ask,
//             owner
//         } = bag::remove(&mut gameMarket.gameItems, item_id);

//         assert!(ask == coin::value(&paid), EAmountIncorrect);

//         // Check if there's already a Coin hanging and merge `paid` with it.
//         // Otherwise attach `paid` to the `GameMarket` under owner's `address`.
//         if (table::contains<address, Coin<COIN>>(&gameMarket.payments, owner)) {
//             coin::join(
//                 table::borrow_mut<address, Coin<COIN>>(&mut gameMarket.payments, owner),
//                 paid
//             )
//         } else {
//             table::add(&mut gameMarket.payments, owner, paid)
//         };

//         let item = ofield::remove(&mut id, true);
//         object::delete(id);
//         item
//     }

//     /// Call [`buy`] and transfer item to the sender.
//     public entry fun buy_and_take<T: key + store, COIN>(
//         gameMarket: &mut GameMarket<COIN>,
//         item_id: ID,
//         paid: Coin<COIN>,
//         ctx: &mut TxContext
//     ) {
//         transfer::public_transfer(
//             buy<T, COIN>(gameMarket, item_id, paid),
//             tx_context::sender(ctx)
//         )
//     }

//     /// Internal function to take profits from selling items on the `GameMarket`.
//     fun take_profits<COIN>(
//         gameMarket: &mut GameMarket<COIN>,
//         ctx: &mut TxContext
//     ): Coin<COIN> {
//         table::remove<address, Coin<COIN>>(&mut gameMarket.payments, tx_context::sender(ctx))
//     }

//     /// Call [`take_profits`] and transfer Coin object to the sender.
//     public entry fun take_profits_and_keep<COIN>(
//         gameMarket: &mut GameMarket<COIN>,
//         ctx: &mut TxContext
//     ) {
//         transfer::public_transfer(
//             take_profits(gameMarket, ctx),
//             tx_context::sender(ctx)
//         )
//     }
// }

// module gig_contracts::widget {
//     use sui::object::{Self, UID};
//     use sui::transfer;
//     use sui::tx_context::{Self, TxContext};

//     public struct Widget has key, store {
//         id: UID,
//     }

//     public entry fun mint(ctx: &mut TxContext) {
//         let object = Widget {
//             id: object::new(ctx)
//         };
//         transfer::transfer(object, tx_context::sender(ctx));
//     }
// }

// #[allow(duplicate_alias)]
// module gig_contracts::savings_account {
//     use sui::object::{Self, ID, UID};
//     use sui::coin::{Self, Coin};
//     use sui::transfer;
//     use sui::sui::SUI;
//     use sui::tx_context::{Self, TxContext};
//     use sui::balance::{Self, Balance};
//     use sui::event;

//     // Error codes
//     const EInsufficientBalance: u64 = 1;
//     const ENotAccountOwner: u64 = 2;
//     const EInvalidDepositAmount: u64 = 3;

//     // Events
//     public struct DepositEvent has copy, drop {
//         account_id: ID,
//         amount: u64,
//     }

//     public struct WithdrawEvent has copy, drop {
//         account_id: ID,
//         amount: u64,
//     }

//     // Main savings account struct
//     public struct SavingsAccount has key {
//         id: UID,
//         balance: Balance<SUI>,
//         owner: address,
//     }

//     // Create a new savings account
//     public entry fun create_account(ctx: &mut TxContext) {
//         let account = SavingsAccount {
//             id: object::new(ctx),
//             balance: balance::zero(),
//             owner: tx_context::sender(ctx),
//         };
        
//         transfer::transfer(account, tx_context::sender(ctx));
//     }

//     // Deposit by splitting from user's coin
//     public entry fun deposit_with_split(
//         account: &mut SavingsAccount,
//         user_coin: &mut Coin<SUI>,
//         amount: u64,
//         ctx: &mut TxContext
//     ) {
//         // Verify user has enough balance
//         let user_balance = coin::value(user_coin);
//         assert!(user_balance >= amount, EInsufficientBalance);
//         assert!(amount > 0, EInvalidDepositAmount);

//         // Split the specified amount from user's coin
//         let split_coin = coin::split(user_coin, amount, ctx);
        
//         // Convert split coin to balance and add to savings
//         let deposit_balance = coin::into_balance(split_coin);
//         balance::join(&mut account.balance, deposit_balance);

//         // Emit deposit event
//         event::emit(DepositEvent {
//             account_id: object::id(account),
//             amount
//         });
//     }

//     // Deposit entire coin
//     public entry fun deposit_full_coin(
//         account: &mut SavingsAccount,
//         coin: Coin<SUI>,
//         _ctx: &TxContext
//     ) {
//         let amount = coin::value(&coin);
//         let deposit_balance = coin::into_balance(coin);
        
//         balance::join(&mut account.balance, deposit_balance);

//         // Emit deposit event
//         event::emit(DepositEvent {
//             account_id: object::id(account),
//             amount
//         });
//     }

//     // Withdraw SUI coins from the account
//     public entry fun withdraw(
//         account: &mut SavingsAccount,
//         amount: u64,
//         ctx: &mut TxContext
//     ) {
//         // Only owner can withdraw
//         assert!(tx_context::sender(ctx) == account.owner, ENotAccountOwner);
        
//         // Check sufficient balance
//         assert!(balance::value(&account.balance) >= amount, EInsufficientBalance);
        
//         // Create withdrawal coin
//         let withdraw_balance = balance::split(&mut account.balance, amount);
//         let withdraw_coin = coin::from_balance(withdraw_balance, ctx);

//         // Transfer withdrawn coins to sender
//         transfer::public_transfer(withdraw_coin, tx_context::sender(ctx));

//         // Emit withdraw event
//         event::emit(WithdrawEvent {
//             account_id: object::id(account),
//             amount
//         });
//     }

//     // View account balance
//     public fun balance(account: &SavingsAccount): u64 {
//         balance::value(&account.balance)
//     }

//     // View account owner
//     public fun owner(account: &SavingsAccount): address {
//         account.owner
//     }
// }

// module gig_contracts::deposit_and_withdraw {
//     use sui::balance;
//     use sui::tx_context;

//     /// A structure representing a user's account balance
//     struct UserAccount has key, store {
//         owner: address,        // The user's address
//         balance: balance::Balance<coin::CoinType>, // Balance of the user in the contract
//     }

//     /// A shared storage for all user accounts
//     struct ContractStorage has key, store {
//         accounts: table::Table<address, UserAccount>,
//     }

//     /// Initialize the contract with empty storage
//     public entry fun init(ctx: &mut tx_context::TxContext) {
//         let storage = ContractStorage {
//             accounts: table::new<address, UserAccount>(ctx),
//         };
//         tx_context::transfer(storage, tx_context::sender(ctx));
//     }

//     /// Deposit funds into the user's account
//     public entry fun deposit(
//         contract: &mut ContractStorage,
//         coin: coin::Coin<coin::CoinType>,
//         ctx: &mut tx_context::TxContext,
//     ) {
//         let sender = tx_context::sender(ctx);

//         // Check if the user already has an account
//         if (!table::contains(&contract.accounts, &sender)) {
//             let user_account = UserAccount {
//                 owner: sender,
//                 balance: balance::zero<coin::CoinType>(),
//             };
//             table::add(&mut contract.accounts, sender, user_account);
//         }

//         // Add funds to the user's account
//         let user_account = table::borrow_mut(&mut contract.accounts, &sender);
//         balance::add(&mut user_account.balance, coin);
//     }

//     /// Withdraw funds from the user's account
//     public entry fun withdraw(
//         contract: &mut ContractStorage,
//         amount: u64,
//         ctx: &mut tx_context::TxContext,
//     ): coin::Coin<coin::CoinType> {
//         let sender = tx_context::sender(ctx);

//         // Ensure the user has an account
//         assert!(table::contains(&contract.accounts, &sender), "Account not found");

//         let user_account = table::borrow_mut(&mut contract.accounts, &sender);

//         // Ensure sufficient funds
//         assert!(balance::value(&user_account.balance) >= amount, "Insufficient balance");

//         // Subtract funds and return the coin
//         balance::withdraw(&mut user_account.balance, amount, ctx)
//     }

//     /// Transfer funds between accounts
//     public entry fun transfer(
//         contract: &mut ContractStorage,
//         recipient: address,
//         amount: u64,
//         ctx: &mut tx_context::TxContext,
//     ) {
//         let sender = tx_context::sender(ctx);

//         // Ensure both sender and recipient have accounts
//         assert!(table::contains(&contract.accounts, &sender), "Sender account not found");
//         if (!table::contains(&contract.accounts, &recipient)) {
//             let recipient_account = UserAccount {
//                 owner: recipient,
//                 balance: balance::zero<coin::CoinType>(),
//             };
//             table::add(&mut contract.accounts, recipient, recipient_account);
//         }

//         let sender_account = table::borrow_mut(&mut contract.accounts, &sender);
//         let recipient_account = table::borrow_mut(&mut contract.accounts, &recipient);

//         // Ensure sufficient funds
//         assert!(balance::value(&sender_account.balance) >= amount, "Insufficient balance");

//         // Perform the transfer
//         balance::subtract(&mut sender_account.balance, amount);
//         balance::add(&mut recipient_account.balance, balance::from_amount(amount, ctx));
//     }
// }

// module gig_contracts::deposit {
//     use sui::coin::{Self, Coin};
//     use sui::sui::SUI;
//     use sui::balance::{Self, Balance};
//     use sui::package::{Self};
//     use sui::balance::destroy_zero;

//     public fun accept_sui(coin: Coin<SUI>, ctx: &mut TxContext) {
//     // Ensure the coin has a positive value
//     // assert!(coin.value() > 0, 1); // Error code 1 for insufficient balance

//     // Logic to handle the received SUI
//     let balance = coin.into_balance();
//     // You can now use the balance as needed
//     destroy_zero(balance);
//     }

// }

module gig_contracts::deposit {
    use sui::balance::{Self, Balance};
    use sui::sui::SUI;
    use sui::coin::{Self, Coin};
    use sui::package::{Self};
  
   const EInsufficientBalance: u64 = 1;

    public struct Joblisting has key {
        id: UID,
        min_stake: u64
    }

    public struct JOB_OBJ has key {
        id: UID
    }

    public struct DEPOSIT has drop {}

    fun init(otw: DEPOSIT, ctx: &mut TxContext) {
        package::claim_and_keep(otw, ctx);

          let job_cap = JOB_OBJ {
            id: object::new(ctx);
        };

        transfer::transfer(job_cap, ctx.sender());
    }

    public entry fun init_job(job_cap: JOB_OBJ, coin: Coin<SUI>, ctx: &mut TxContext){
        assert!(coin.value() > 0, EInsufficientBalance);

        let job_data = Joblisting {
            id: object::new(ctx),
            min_stake: 1_000_000_000 //1 SUI
        };

        let JOB_OBJ {id} = job_cap;
        object::delete(id);

        transfer::share_object(job_data);
    }

  

}







