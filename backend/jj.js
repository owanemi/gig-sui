import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';

const client = new SuiClient({
	url: getFullnodeUrl('testnet'),
});
const coins = await client.getCoins({
	owner: '0x7f894fbcf0b3a4ed715a164d996ada56467d40323e3fed83d3ff48abf30288e6',
	coinType: '0x5ea6aafe995ce6506f07335a40942024106a57f6311cb341239abf2c3ac7b82f::nft::Nft',
});

console.log(coins)