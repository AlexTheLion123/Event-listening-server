export const CONTRACTADDRESS = '0x7EACc490BCFC3E13D746B3575c07068Ea0809F49';
export const CONTRACTABI = [
    "event BetCreated(uint256 indexed betId, address indexed player1, uint256 amount, uint256 targetPrice, bool isHigherChosen, uint256 targetTimestamp)",
    "function createBet(uint256 _targetPrice, bool _isHigherChosen, uint256 _targetTimestamp) external payable",
    "function finishBet(uint256 _betId) external"
];

export const BETCREATEDABI = "event BetCreated(uint256 indexed betId, address indexed player1, uint256 indexed amount, uint256 targetPrice, bool isHigherChosen, uint256 targetTimestamp)"
