#[allow(duplicate_alias, unused_const)]
module gig_contracts::take_funds {
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::balance::{Self, Balance};
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;

    /// Custom errors
    const EJoblistingNotActive: u64 = 0;
    const EGoalReached: u64 = 1;
    const EDeadlineNotReached: u64 = 2;
    const ENotOwner: u64 = 3;

    /// Struct to represent the fundraiser
    public struct JobListing has key {
        id: UID,
        owner: address,
        balance: Balance<SUI>,
        goal: u64,
        deadline: u64,
        active: bool,
        description: vector<u8>
    }

    /// Events
    public struct JobEvent has copy, drop {
        fundraiser_id: address,
        donor: address,
        amount: u64,
    }

    /// Create a new fundraiser
    public entry fun create_job(
        goal: u64,
        deadline: u64,
        description: vector<u8>,
        ctx: &mut TxContext
    ) {
        let job = JobListing {
            id: object::new(ctx),
            owner: tx_context::sender(ctx),
            balance: balance::zero(),
            goal,
            deadline,
            active: true,
            description
        };

        transfer::share_object(fundraiser);
    }

    /// Withdraw funds (only owner can call after deadline)
    public entry fun withdraw(
        fundraiser: &mut Fundraiser,
        ctx: &mut TxContext
    ) {
        assert!(tx_context::sender(ctx) == fundraiser.owner, ENotOwner);
        assert!(tx_context::epoch(ctx) >= fundraiser.deadline, EDeadlineNotReached);

        let amount = balance::value(&fundraiser.balance);
        let withdrawn_coin = coin::from_balance(
            balance::split(&mut fundraiser.balance, amount),
            ctx
        );
        
        transfer::public_transfer(withdrawn_coin, fundraiser.owner);
        fundraiser.active = false;
    }

    
}