import { ethers } from 'ethers';
import fs from 'fs';

type BetDetails = {
    targetTimestamp: bigint;
    isCompleted: boolean;
}

export function scheduleBetCompletion(betId: bigint, targetTimestamp: bigint, duelContract: ethers.Contract) {
    const delay = Number(targetTimestamp) * 1000 - Date.now();

    const scheduledBets = loadScheduledBetsFromFile('scheduledBets.json');

    if (delay > 0) {
        console.log(`Bet finished scheduled to be called in ${delay/1000} seconds`);
        
        setTimeout(async () => {
            try {
                console.log("trying to finish bet with id: ", betId.toString())
                const tx = await duelContract.finishBet(betId, {gasLimit: 5000000} ); // TODO get price from orcale
                await tx.wait();
                console.log(`Bet finished successfully: betId=${betId.toString()}`);

                const betDetails = scheduledBets.get(betId);

                if (!betDetails) {
                    // then set
                    scheduledBets.set(betId, { targetTimestamp, isCompleted: true });
                } else {
                    // then update
                    betDetails.targetTimestamp = targetTimestamp;
                    betDetails.isCompleted = true;
                }

                saveScheduledBetsToFile(scheduledBets, 'scheduledBets.json');

            } catch (error) {
                console.error(`Failed to finish bet: betId=${betId.toString()}, Error: ${error}`);
            }
        }, delay);
    }
}


export async function rescheduleBets(duelContract: ethers.Contract) {
    if (!duelContract) {
        throw new Error('Contract not initialized');
    }

    const scheduledBets = loadScheduledBetsFromFile('scheduledBets.json');

    if (scheduledBets) {
        scheduledBets.forEach(async (betDetails, betId) => {
            if (!betDetails.isCompleted) {
                // asynchrously schedule the bet completion
                scheduleBetCompletion(betId, betDetails.targetTimestamp, duelContract);
            } else {
                console.log(`Bet time already passed: betId=${betId}`);
            }
        });
    }
    
}

function saveScheduledBetsToFile(scheduledBets: Map<bigint, BetDetails>, filename: string) {
    // Load existing entries from the file
    let existingEntries = new Map();
    if (fs.existsSync(filename)) {
        existingEntries = loadScheduledBetsFromFile(filename);
    }

    // Merge existing entries with new entries
    for (const [key, value] of scheduledBets.entries()) {
        existingEntries.set(key, value);
    }

    // Convert the merged map to a plain object
    const plainObject: { [key: string]: BetDetails } = {};
    for (const [key, value] of existingEntries.entries()) {
        plainObject[key.toString()] = value;
    }

    // Convert to JSON string and save to the file
    const jsonString = JSON.stringify(plainObject);
    fs.writeFileSync(filename, jsonString);
}

function loadScheduledBetsFromFile(filename: string): Map<bigint, BetDetails> {
    // Check if the file exists
    if (!fs.existsSync(filename)) {
        return new Map();
    }

    // Read the JSON string from the file
    const jsonString = fs.readFileSync(filename, 'utf8');

    // Convert the JSON string to a plain object
    const plainObject = JSON.parse(jsonString);

    // Convert the plain object back to a Map
    const map = new Map();
    for (const [key, value] of Object.entries(plainObject)) {
        map.set(BigInt(key), value);
    }
    return map;
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