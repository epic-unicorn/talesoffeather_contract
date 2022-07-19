import fs from 'fs'

const frontEndAbiFile = '../talesoffeather_app/config/abi.json'

const frontEndContractConfigFile =
  '../talesoffeather_app/config/contract-config.json'

const contractConfig = JSON.parse(
  fs.readFileSync(frontEndContractConfigFile, 'utf8')
)
const hiddenMetadataUri = 'ipfs://QmXWUTUkBuRZZsM1ivXZyYb3gKykkqSkfz449v9QPvq3DN/talesoffeather.json'

const frontEndAllowlistFile = '../talesoffeather_app/config/allowlist.json'

const allowlist = JSON.parse(fs.readFileSync(frontEndAllowlistFile, 'utf8'))

export {
  frontEndAbiFile,
  frontEndContractConfigFile,
  contractConfig,
  hiddenMetadataUri,
  allowlist,
}
