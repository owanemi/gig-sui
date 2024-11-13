struct UserBalance has store {
        balance: u64, // user's balance
    }

    public fun initialize_account(account: &signer) {
        let balance = UserBalance { balance: 0 };
        move_to(account, balance);
    }

    // Function for users to deposit tokens
    public fun deposit(account: &signer, amount: u64) {
        // Get the user's current balance
        let user_balance = borrow_global_mut<UserBalance>(signer_address(account));
        
        // Update the user's balance by adding the deposit amount
        user_balance.balance = user_balance.balance + amount;
    }

    // Function to pay out the entire balance to another address
    public fun payout(account: &signer, recipient: address) {
        // Get the user's current balance
        let user_balance = borrow_global_mut<UserBalance>(signer_address(account));
        
        // Get the current balance of the user
        let amount = user_balance.balance;
        
        // Ensure the user has a positive balance to payout
        assert(amount > 0, 1); // Error code 1: Insufficient funds

        // Send the amount to the recipient
        // Note: You can implement the actual transfer logic here based on the token standard used.
        // For the sake of simplicity, let's assume we are transferring this balance to the recipient.
        // This is a placeholder. Replace it with token transfer logic if needed.
        transfer_tokens(account, recipient, amount);

        // Reset the user's balance to zero after payout
        user_balance.balance = 0;
    }

    // Helper function to transfer tokens (Placeholder function)
    fun transfer_tokens(from: &signer, to: address, amount: u64) {
        // Implement token transfer logic here
        // Example: if using SUI token or another custom token
        // sui::transfer(from, to, amount);
        // For now, we will assume this step handles the transfer appropriately.
    }