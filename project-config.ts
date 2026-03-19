import fs from 'fs'
import path from 'path'

const frontEndAbiFile = '../talesoffeather_app/config/abi.json'

const frontEndContractConfigFile =
  '../talesoffeather_app/config/contract-config.json'

// Safely read config files with defaults
const loadJsonFile = (filePath: string, defaultValue: any = null) => {
  try {
    const resolvedPath = path.resolve(__dirname, filePath)
    if (fs.existsSync(resolvedPath)) {
      return JSON.parse(fs.readFileSync(resolvedPath, 'utf8'))
    }
  } catch (error) {
    console.warn(`Warning: Could not load ${filePath}`)
  }
  return defaultValue
}

const contractConfig = loadJsonFile(frontEndContractConfigFile, {
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
})
const hiddenMetadataUri = 'ipfs://QmXWUTUkBuRZZsM1ivXZyYb3gKykkqSkfz449v9QPvq3DN/talesoffeather.json'

const frontEndAllowlistFile = '../talesoffeather_app/config/allowlist.json'

const allowlist = loadJsonFile(frontEndAllowlistFile, [])

export {
  frontEndAbiFile,
  frontEndContractConfigFile,
  contractConfig,
  hiddenMetadataUri,
  allowlist,
}
