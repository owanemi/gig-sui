#[allow(lint(self_transfer), duplicate_alias)]
module gig_contracts::gig_contracts {
    use sui::coin::{Self, TreasuryCap, Coin};
    use sui::event;
    use sui::transfer;
    use sui::tx_context::TxContext;
    use sui::object;
    use sui::sui::SUI;

    public struct UserPay has key, store {
        id: UID,
        balance: u64,
        depositor: address,
    }

    public struct DepositEvent has copy, drop {
        depositor: address,
        amount: u64,
    }

    public struct WithdrawEvent has copy, drop {
        withdrawer: address,
        amount: u64,
    }

    public struct TransferEvent has copy, drop {
        sender: address,
        recipient: address,
        amount: u64,
    }

public entry fun deposit(coin: Coin<SUI>, ctx: &mut TxContext) {
    let value = coin::value(&coin);
    let depositor = tx_context::sender(ctx);
    let user_pay = UserPay { id: object::new(ctx), balance: value, depositor };

    // Transfer the coin to consume it
    transfer::public_transfer(coin, depositor);

    // Transfer the user_pay object to consume it
    transfer::public_transfer(user_pay, depositor);

    // Emit deposit event
    event::emit(DepositEvent { depositor, amount: value });
}



    public entry fun withdraw(user_pay: &mut UserPay, treasury_cap: &mut TreasuryCap<SUI>, ctx: &mut TxContext) {
        let sender = tx_context::sender(ctx);
        assert!(sender == user_pay.depositor, 0); // Use an error code instead of a string

        let balance = user_pay.balance;
        let coin = coin::mint(treasury_cap, balance, ctx);
        transfer::public_transfer(coin, sender);
        user_pay.balance = 0;

        // Emit withdraw event
        event::emit(WithdrawEvent { withdrawer: sender, amount: balance });
    }

    public entry fun transfer(user_pay: &mut UserPay, recipient: address, treasury_cap: &mut TreasuryCap<SUI>, ctx: &mut TxContext) {
        let sender = tx_context::sender(ctx);
        assert!(sender == user_pay.depositor, 0); // Use an error code instead of a string

        let balance = user_pay.balance;
        let coin = coin::mint(treasury_cap, balance, ctx);
        transfer::public_transfer(coin, recipient);
        user_pay.balance = 0;

        // Emit transfer event
        event::emit(TransferEvent { sender, recipient, amount: balance });
    }
}
