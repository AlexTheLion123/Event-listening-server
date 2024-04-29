import express, { Request, Response } from 'express';
import dotenv from "dotenv";

import { ethers } from 'ethers';
import { CONTRACTADDRESS, CONTRACTABI, BETCREATEDABI } from './constants';
import { scheduleBetCompletion } from './betCreatedHandler';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 4000;

const PRIVATE_KEY = process.env.PRIVATE_KEY as any;

// Ethereum setup
const provider = new ethers.providers.JsonRpcProvider('https://scroll-sepolia.drpc.org');
const signer = new ethers.Wallet(PRIVATE_KEY, provider);

const contract = new ethers.Contract(CONTRACTADDRESS, CONTRACTABI, signer);


app.get('/', (req: Request, res: Response) => {
    res.send('Event listener setup and running!');
});


app.listen(PORT, async () => {
    console.log('Listening on port', PORT);

    const filter = {
        address: CONTRACTADDRESS,
        topics: [
            // the name of the event, parnetheses containing the data type of each event, no spaces
            ethers.utils.id("BetCreated(uint256,address,uint256,uint256,uint256,bool)")
        ]
    }
    provider.on(filter, (event) => {
        const data = ethers.utils.defaultAbiCoder.decode(
            ["uint256", "address", "uint256"],
            event.topics[1] + event.topics[2].slice(2) + event.topics[3].slice(2)
        )

        const betId = data[0]
        const player1 = data[1]
        const targetTimestamp = data[2]

        console.log("betId", betId.toString());
        console.log("player1", player1);
        console.log("targetTimestamp", targetTimestamp.toString());
        
        scheduleBetCompletion(betId, targetTimestamp, contract)

    })


    const tx = await contract.createBet(ethers.utils.parseUnits("0.00000001", "ether"), true, BigInt(Math.floor(Date.now() / 1000) + 20), {
        value: ethers.utils.parseEther("0.00000001") // Sending 0.1 ETH as an example
    });

    await tx.wait(); // Wait for the transaction to be mined
    console.log(`Transaction successful with hash: ${tx.hash}`);

});

// console.log("Current block number:", await provider.getBalance('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'));


// async function createBet(targetPrice: bigint, isHigherChosen: boolean, targetTimestamp: bigint) {
//     const tx = await contract.createBet(targetPrice, isHigherChosen, targetTimestamp, {
//         value: ethers.parseEther("0.1") // Sending 0.1 ETH as an example
//     });
//     await tx.wait(); // Wait for the transaction to be mined
//     console.log(`Transaction successful with hash: ${tx.hash}`);
// }
