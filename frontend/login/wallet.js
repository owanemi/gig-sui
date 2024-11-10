import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { WalletStandardProvider } from '@mysten/wallet-standard';
import { formatAddress } from '@mysten/sui.js/utils';

class WalletManager {
    constructor() {
        this.client = new SuiClient({ url: getFullnodeUrl('testnet') });
        this.walletProvider = new WalletStandardProvider();
        this.currentAccount = null;
        
        this.connectButton = document.getElementById('wallet-btn');
        this.statusElement = document.getElementById('wallet-status');
        
        this.init();
    }

    init() {
        this.connectButton.addEventListener('click', () => this.connectWallet());
    }

    async connectWallet() {
        try {
            // Get available wallets
            const availableWallets = this.walletProvider.get();
            
            if (availableWallets.length === 0) {
                this.statusElement.textContent = 'No Sui wallet found. Please install one.';
                window.open('https://chrome.google.com/webstore/detail/sui-wallet/opcgpfmipidbgpenhmajoajpbobppdil', '_blank');
                return;
            }

            const wallet = availableWallets[0];
            
            // Request connection
            const accounts = await wallet.connect();
            
            if (accounts.length > 0) {
                this.currentAccount = accounts[0];
                const address = formatAddress(this.currentAccount.address);
                this.statusElement.textContent = `Connected: ${address}`;
                this.connectButton.textContent = 'Connected';
                this.connectButton.disabled = true;

                // Get account balance
                const balance = await this.getBalance();
                console.log('Balance:', balance);
            }
        } catch (error) {
            console.error('Error connecting wallet:', error);
            this.statusElement.textContent = 'Error connecting wallet. Please try again.';
        }
    }

    async getBalance() {
        if (!this.currentAccount) return null;
        
        try {
            const balance = await this.client.getBalance({
                owner: this.currentAccount.address
            });
            return balance;
        } catch (error) {
            console.error('Error getting balance:', error);
            return null;
        }
    }
}

// Initialize wallet manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new WalletManager();
});