# Tales of Feather - Smart Contract

An ERC721A-based NFT smart contract built with Hardhat for the Tales of Feather collection. Features include allowlist minting, public sales, owner mint functions, and collection reveal mechanics.

All credits to https://github.com/kjmczk/hardhat-nft-smart-contract.git

## Prerequisites

- **Node.js**: v18.0.0 or higher (tested with v22.14.0)
- **npm**: v8.0.0 or higher
- **Git**: For version control

## Installation

1. Clone the repository:
```sh
git clone <repository-url>
cd talesoffeather_contract
```

2. Install dependencies:
```sh
npm install
```

3. Create a `.env` file in the root directory (optional, for network deployments):
```env
GOERLI_RPC_URL=your_goerli_rpc_url
MAINNET_RPC_URL=your_mainnet_rpc_url
MUMBAI_TESTNET_RPC_URL=your_mumbai_rpc_url
POLYGON_MAINNET_RPC_URL=your_polygon_rpc_url
TESTNET_PRIVATE_KEY=your_testnet_private_key
MAINNET_PRIVATE_KEY=your_mainnet_private_key
ETHERSCAN_API_KEY=your_etherscan_api_key
POLYGONSCAN_API_KEY=your_polygonscan_api_key
COIN_MARKET_CAP_API_KEY=your_coin_market_cap_api_key
```

## Project Structure

```
contracts/
├── TalesOfFeather.sol          # Main NFT contract
└── mocks/
    └── TalesOfFeatherMock.sol  # Mock contract for testing
deploy/
├── 00-deploy-mocks.ts         # Deploy mock contracts
├── 01-deploy-contract.ts       # Deploy main contract
└── 02-update-front-end.ts      # Update front-end configuration
scripts/
├── 00-close-sales.ts           # Close all sales
├── 01-open-allowlist-sale.ts   # Open allowlist sale
├── 02-open-public-sale.ts      # Open public sale
└── 03-reveal-collection.ts     # Reveal collection metadata
test/
└── TalesOfFeather.test.ts      # Test suite (34 tests)
```

## Contract Features

- **ERC721A Standard**: Optimized NFT implementation with batch minting support
- **Allowlist Minting**: Merkle tree-based allowlist for presale access
- **Public Sale**: Open minting once public sale is active
- **Owner Mint**: Owner can mint NFTs directly
- **Collection Reveal**: Hidden metadata URI that can be revealed later
- **Sale States**: Three states - Closed, Allowlist Only, Public Open
- **Configurable Parameters**: Adjustable mint prices and max mint amounts per transaction

## Testing

Run the full test suite (34 tests):
```sh
npm test
```

or

```sh
npx hardhat test
```

Generate code coverage report:
```sh
npm run coverage
```

## Linting

Lint all Solidity files:
```sh
npm run lint
```

Fix linting issues automatically:
```sh
npm run lint:fix
```

## Deployment

### Local Development (Hardhat Network)

```sh
npx hardhat deploy
```

### Local Node

Terminal 1 - Start Hardhat node:
```sh
npx hardhat node
```

Terminal 2 - Deploy to localhost:
```sh
npx hardhat deploy --network localhost
```

### Testnet/Mainnet Deployment

Deploy to specific network:
```sh
npx hardhat deploy --network <networkName>
```

Supported networks:
- `goerli` - Ethereum Goerli Testnet
- `mainnet` - Ethereum Mainnet
- `mumbai` - Polygon Mumbai Testnet
- `polygon` - Polygon Mainnet

Deploy specific scripts using tags:
```sh
npx hardhat deploy --network <networkName> --tags <tag>
```

Example - Deploy only mock contracts:
```sh
npx hardhat deploy --network localhost --tags mocks
```

## Scripts

### Open Allowlist Sale

```sh
npm run open-allowlist -- --network <networkName>
```

Sets the contract to allowlist-only sale mode.

### Open Public Sale

```sh
npm run open-public -- --network <networkName>
```

Opens sales to the public.

### Close Sales

```sh
npm run close -- --network <networkName>
```

Closes all sales.

### Reveal Collection

```sh
npm run reveal -- --network <networkName>
```

Reveals the actual metadata URI for the collection.

## Merkle Tree Proof Generation

Generate a proof for an allowlisted address:

```sh
npx hardhat proof <address>
```

This will output the Merkle proof needed for allowlist minting.

## Configuration

Contract configuration is loaded from `project-config.ts`. If external config files are not found, sensible defaults are used:

```typescript
{
  contractName: 'TalesOfFeather',
  nftName: 'Tales of Feather',
  nftSymbol: 'TOF',
  maxSupply: 5000,
  saleType: {
    allowlistSale: {
      mintPrice: '0.05',
      maxMintAmountPerTx: 2,
    },
    publicSale: {
      mintPrice: '0.1',
      maxMintAmountPerTx: 5,
    },
  },
}
```

## Network Configuration

The following networks are pre-configured in `hardhat.config.ts`:

| Network | Chain ID | Purpose |
|---------|----------|---------|
| hardhat | 1337 | Local testing |
| localhost | 1337 | Local node |
| goerli | 5 | Ethereum testnet |
| mainnet | 1 | Ethereum mainnet |
| mumbai | 80001 | Polygon testnet |
| polygon | 137 | Polygon mainnet |

## Clean

Remove artifacts and cache:
```sh
npm run clean
```

## Development Tools

- **Hardhat**: Ethereum development framework
- **Solhint**: Solidity linter
- **Solidity Coverage**: Code coverage analysis
- **Typechain**: TypeScript bindings for contracts
- **Hardhat Deploy**: Deployment management
- **Hardhat Gas Reporter**: Gas usage reporting

## Debugging

Run tests with detailed output:
```sh
npx hardhat test --verbose
```

## Troubleshooting

### Node Version Issues
Ensure you're using Node.js v18+ (v22 is supported):
```sh
node --version
```

### Network Connection Issues
Check RPC URL configuration in `.env` file and `hardhat.config.ts`.

### Transaction Failures
- Verify sufficient gas for transactions
- Check network and account balance
- Ensure correct private keys are configured

## Security Considerations

- Never commit `.env` files with real private keys to version control
- Use test networks for development and testing
- Review smart contract code before mainnet deployment
- Consider formal security audits for production contracts

## Gas Optimization

The contract uses ERC721A for optimized gas usage with batch minting. Gas reports can be generated:
```sh
REPORT_GAS=true npx hardhat test
```

## License

This project is based on the work referenced above.
