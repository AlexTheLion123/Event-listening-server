export const CONTRACTADDRESS = '0x552ECEeefC04f58748Ef84d8b1e2E0471ad89faA';
export const CONTRACTABI = [
    "event BetCreated(uint256 indexed betId, address indexed player1, uint256 amount, uint256 targetPrice, bool isHigherChosen, uint256 targetTimestamp)",
    "function createBet(uint256 _targetPrice, bool _isHigherChosen, uint256 _targetTimestamp) external payable",
    "function finishBet(uint256 _betId, uint256 _priceAtBetFinished) external"
];

export const BETCREATEDABI = "event BetCreated(uint256 indexed betId, address indexed player1, uint256 indexed amount, uint256 targetPrice, bool isHigherChosen, uint256 targetTimestamp)"
