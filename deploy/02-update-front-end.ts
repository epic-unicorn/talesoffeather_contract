import { ethers, network } from 'hardhat'
import fs from 'fs'

import {
  frontEndAbiFile,
  frontEndContractConfigFile,
  contractConfig,
} from '../project-config'

const contractName = contractConfig.contractName
const contractAddresses = contractConfig.contractAddresses

async function updateAbi() {
  const TalesOfFeather = await ethers.getContract(contractName)

  fs.writeFileSync(
    frontEndAbiFile,
    TalesOfFeather.interface.format(ethers.utils.FormatTypes.json) as string
  )
}

async function updateContractAddresses() {
  const TalesOfFeather = await ethers.getContract(contractName)

  if (network.config.chainId) {
    if (network.config.chainId.toString() in contractAddresses) {
      if (
        !contractAddresses[network.config.chainId.toString()].includes(
          TalesOfFeather.address
        )
      ) {
        contractAddresses[network.config.chainId.toString()].push(
          TalesOfFeather.address
        )
      }
    } else {
      contractAddresses[network.config.chainId.toString()] = [
        TalesOfFeather.address,
      ]
    }
    fs.writeFileSync(frontEndContractConfigFile, JSON.stringify(contractConfig))
  }
}

async function updateFrontEnd() {
  if (process.env.UPDATE_FRONT_END === 'true') {
    console.log('Writing to front end...')
    await updateAbi()
    await updateContractAddresses()
    console.log('Front end written!')
  }
}
export default updateFrontEnd
updateFrontEnd.tags = ['updateFrontEnd']
