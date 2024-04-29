import { ethers } from 'ethers';

type BetDetails = {
    targetTimestamp: bigint;
    isCompleted: boolean;
}

const duelAddress = '0x2cbD72063405738b7c5f8e2830b31d0e8532DAb5'
const scheduledBets: Map<bigint, BetDetails> = new Map()


export function scheduleBetCompletion(betId: bigint, targetTimestamp: bigint, duelContract: ethers.Contract) {
    const delay = Number(targetTimestamp) * 1000 - Date.now();
    console.log("delay:");
    console.log(delay);
    console.log("times:");
    console.log(Number(targetTimestamp)*1000);
    console.log(Date.now());

    if (delay > 0) {
        console.log(`Bet finished scheduled to be called in ${delay/1000} seconds`);
        
        setTimeout(async () => {
            try {
                console.log("trying to finish bet with id: ", betId.toString())
                const tx = await duelContract.finishBet(betId, 10, {gasLimit: 5000000} ); // TODO get price from orcale
                await tx.wait();

                const betDetails = scheduledBets.get(betId);

                if (!betDetails) {
                    throw new Error(`Bet not found: betId=${betId.toString()}`);
                }

                betDetails.isCompleted = true;

                console.log(`Bet finished successfully: betId=${betId.toString()}`);
            } catch (error) {
                console.error(`Failed to finish bet: betId=${betId.toString()}, Error: ${error}`);
            }
        }, delay);
    }
}


async function rescheduleBets(duelContract: ethers.Contract) {
    if (!duelContract) {
        throw new Error('Contract not initialized');
    }

    scheduledBets.forEach(async (betDetails, betId) => {
        if (!betDetails.isCompleted) {
            // asynchrously schedule the bet completion
            scheduleBetCompletion(betId, betDetails.targetTimestamp, duelContract);
        } else {
            console.log(`Bet time already passed: betId=${betId}`);
        }
    });
}


// export async function listenToBetCreated() {
//   const duelContract = await ethers.getContractAt("MyContract", duelAddress) as unknown as DuelContract;

//   console.log("Listening to BetCreated events...");

//   duelContract.on(duelContract.filters.BetCreated(),
//     (betId: bigint, player1: string, amount: bigint, targetPrice: bigint, isHigherChosen: boolean, targetTimestamp: bigint, event: any) => {
//       console.log(`BetCreated: betId=${betId}, player1=${player1}, amount=${amount}, targetPrice=${targetPrice}, isHigherChosen=${isHigherChosen}, targetTimestamp=${targetTimestamp}`);

//       scheduledBets.set(betId, {targetTimestamp, isCompleted: false});

//       console.log(targetTimestamp)
//       console.log(Date.now())

//       scheduleBetCompletion(betId, targetTimestamp, duelContract);

//     });

// }