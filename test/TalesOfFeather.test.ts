import { ethers, network, deployments, getNamedAccounts } from 'hardhat'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { assert, expect } from 'chai'
import { MerkleTree } from 'merkletreejs'
import keccak256 from 'keccak256'

import { developmentChains } from '../helper-hardhat-config'
import { contractConfig, hiddenMetadataUri } from '../project-config'
import {
  TalesOfFeatherMock as MockContractType,
  TalesOfFeather as ContractType,
} from '../typechain-types'

const allowlistAddresses = [
  // Hardhat test addresses
  // '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', // deployer
  '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', // allowlistMinter
  // '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC', // publicMinter
  // '0x90F79bf6EB2c4f870365E785982E1f101E93b906', // externalUser
  '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65',
  '0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc',
  '0x976EA74026E726554dB657fA54763abd0C3a0aa9',
  '0x14dC79964da2C08b23698B3D3cc7Ca32193d9955',
  '0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f',
  '0xa0Ee7A142d267C1f36714E4a8F75612F20a79720',
  '0xBcd4042DE499D14e55001CcbB24a551F3b954096',
  '0x71bE63f3384f5fb98995898A86B02Fb2426c5788',
  '0xFABB0ac9d68B0B445fB7357272Ff202C5651694a',
  '0x1CBd3b2770909D4e10f157cABC84C7264073C9Ec',
  '0xdF3e18d64BC6A983f673Ab319CCaE4f1a57C7097',
  '0xcd3B766CCDd6AE721141F452C550Ca635964ce71',
  '0x2546BcD3c84621e976D8185a91A922aE77ECEc30',
  '0xbDA5747bFD65F08deb54cb465eB87D40e51B197E',
  '0xdD2FD4581271e230360230F9337D5c0430Bf44C0',
  '0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199',
]

function calcTotalMintWei(mintPrice: string, mintAmount: number) {
  return ethers.utils.parseEther(mintPrice).mul(mintAmount)
}

!developmentChains.includes(network.name)
  ? describe.skip
  : describe('TalesOfFeather Unit Test', function () {
      let deployer: SignerWithAddress,
        allowlistMinter: SignerWithAddress,
        publicMinter: SignerWithAddress,
        externalUser: SignerWithAddress,
        TalesOfFeatherMock: MockContractType,
        mockContractWithDeployer: MockContractType,
        mockContractWithAllowlistMinter: MockContractType,
        mockContractWithPublicMinter: MockContractType,
        mockContractWithExternalUser: MockContractType,
        TalesOfFeather: ContractType,
        contractWithDeployer: ContractType,
        contractWithAllowlistMinter: ContractType,
        contractWithPublicMinter: ContractType,
        contractWithExternalUser: ContractType

      before(async function () {
        await deployments.fixture(['mocks', 'TalesOfFeather'])
        // const { deployer } = await getNamedAccounts()
        const accounts = await ethers.getSigners()
        deployer = accounts[0]
        allowlistMinter = accounts[1]
        publicMinter = accounts[2]
        externalUser = accounts[3]

        TalesOfFeatherMock = await ethers.getContract('TalesOfFeatherMock')
        mockContractWithDeployer = TalesOfFeatherMock.connect(deployer)
        mockContractWithAllowlistMinter =
          TalesOfFeatherMock.connect(allowlistMinter)
        mockContractWithPublicMinter = TalesOfFeatherMock.connect(publicMinter)
        mockContractWithExternalUser = TalesOfFeatherMock.connect(externalUser)

        TalesOfFeather = await ethers.getContract('TalesOfFeather')
        contractWithDeployer = TalesOfFeather.connect(deployer)
        contractWithAllowlistMinter = TalesOfFeather.connect(allowlistMinter)
        contractWithPublicMinter = TalesOfFeather.connect(publicMinter)
        contractWithExternalUser = TalesOfFeather.connect(externalUser)
      })

      describe('constructor()', function () {
        it('initializes the TalesOfFeather contract correctly', async function () {
          assert.equal(await TalesOfFeather.getSaleState(), 0)
          assert.equal(
            (await TalesOfFeather.getMaxSupply()).toString(),
            contractConfig.maxSupply
          )
          assert.equal(
            (await TalesOfFeather.getMintPrice()).toString(),
            calcTotalMintWei(
              contractConfig.saleType.allowlistSale.mintPrice,
              1
            ).toString()
          )
          assert.equal(
            (await TalesOfFeather.getMaxMintAmountPerTx()).toString(),
            contractConfig.saleType.allowlistSale.maxMintAmountPerTx
          )
          assert.equal(
            await TalesOfFeather.getHiddenMetadataUri(),
            hiddenMetadataUri
          )
          assert.isFalse(await TalesOfFeather.getRevealed())

          await expect(TalesOfFeather.tokenURI(1)).to.be.revertedWith(
            'TalesOfFeather_CustomError_NonexistentToken'
          )

          // The total supply of the mocked contract should be 99
          assert.equal(
            (await TalesOfFeatherMock.totalSupply()).toString(),
            '99'
          )
        })
      })

      describe('allowlistMint()', function () {
        let merkleTree: MerkleTree, rootHash: string

        before(async function () {
          // Construct Merkle Tree
          const leafNodes = allowlistAddresses.map((address) =>
            keccak256(address)
          )
          merkleTree = new MerkleTree(leafNodes, keccak256, {
            sortPairs: true,
          })
          rootHash = merkleTree.getHexRoot()

          // Update the root hash
          await TalesOfFeather.setMerkleRoot(rootHash)
        })

        it('returns the value of the root just set', async function () {
          assert.equal(await TalesOfFeather.getMerkleRoot(), rootHash)
        })

        it('reverts when sales are closed', async function () {
          await expect(
            contractWithAllowlistMinter.allowlistMint(
              1,
              merkleTree.getHexProof(
                keccak256(await allowlistMinter.getAddress())
              ),
              {
                value: calcTotalMintWei(
                  contractConfig.saleType.allowlistSale.mintPrice,
                  1
                ),
              }
            )
          ).to.be.revertedWith('TalesOfFeather_CustomError_AllowlistSaleClosed')
        })

        it('reverts when public sale is open', async function () {
          // Set sale state to Public Open
          await TalesOfFeather.setPublicOpen()
          await expect(
            contractWithAllowlistMinter.allowlistMint(
              1,
              merkleTree.getHexProof(
                keccak256(await allowlistMinter.getAddress())
              ),
              {
                value: calcTotalMintWei(
                  contractConfig.saleType.allowlistSale.mintPrice,
                  1
                ),
              }
            )
          ).to.be.revertedWith('TalesOfFeather_CustomError_AllowlistSaleClosed')
        })

        it('reverts if the mint amount is less than 1', async function () {
          // Set sale state to Allowlist Only
          await TalesOfFeather.setAllowlistOnly()
          await expect(
            contractWithAllowlistMinter.allowlistMint(
              0,
              merkleTree.getHexProof(
                keccak256(await allowlistMinter.getAddress())
              ),
              {
                value: calcTotalMintWei(
                  contractConfig.saleType.allowlistSale.mintPrice,
                  0
                ),
              }
            )
          ).to.be.revertedWith('TalesOfFeather_CustomError_InvalidMintAmount')
        })

        it('reverts if the mint amount is greater than maximum amount', async function () {
          await expect(
            contractWithAllowlistMinter.allowlistMint(
              6,
              merkleTree.getHexProof(
                keccak256(await allowlistMinter.getAddress())
              ),
              {
                value: calcTotalMintWei(
                  contractConfig.saleType.allowlistSale.mintPrice,
                  6
                ),
              }
            )
          ).to.be.revertedWith('TalesOfFeather_CustomError_InvalidMintAmount')
        })

        it('reverts if the maximum supply is exceeded when mint', async function () {
          // Use the TalesOfFeatherMock contract
          await expect(
            mockContractWithAllowlistMinter.allowlistMint(
              2,
              merkleTree.getHexProof(
                keccak256(await allowlistMinter.getAddress())
              ),
              {
                value: calcTotalMintWei(
                  contractConfig.saleType.allowlistSale.mintPrice,
                  2
                ),
              }
            )
          ).to.be.revertedWith('TalesOfFeather_CustomError_MaxSupplyExceeded')
        })

        it('reverts if insufficient funds are sent', async function () {
          await expect(
            contractWithAllowlistMinter.allowlistMint(
              1,
              merkleTree.getHexProof(
                keccak256(await allowlistMinter.getAddress())
              ),
              {
                value: calcTotalMintWei(
                  contractConfig.saleType.allowlistSale.mintPrice,
                  1
                ).sub(1),
              }
            )
          ).to.be.revertedWith('TalesOfFeather_CustomError_InsufficientFunds')
        })

        it('reverts if invalid proof is send', async function () {
          await expect(
            contractWithAllowlistMinter.allowlistMint(
              1,
              merkleTree.getHexProof(
                keccak256(await externalUser.getAddress())
              ),
              {
                value: calcTotalMintWei(
                  contractConfig.saleType.allowlistSale.mintPrice,
                  1
                ),
              }
            )
          ).to.be.revertedWith('TalesOfFeather_CustomError_InvalidProof')
        })

        it('reverts if someone pretends to be an allowlisted user', async function () {
          await expect(
            contractWithExternalUser.allowlistMint(
              1,
              merkleTree.getHexProof(
                keccak256(await allowlistMinter.getAddress())
              ),
              {
                value: calcTotalMintWei(
                  contractConfig.saleType.allowlistSale.mintPrice,
                  1
                ),
              }
            )
          ).to.be.revertedWith('TalesOfFeather_CustomError_InvalidProof')
        })

        it('reverts if no proof is sent', async function () {
          await expect(
            contractWithAllowlistMinter.allowlistMint(1, [], {
              value: calcTotalMintWei(
                contractConfig.saleType.allowlistSale.mintPrice,
                1
              ),
            })
          ).to.be.revertedWith('TalesOfFeather_CustomError_InvalidProof')
        })

        it('emits event after mint', async function () {
          await expect(
            contractWithAllowlistMinter.allowlistMint(
              1,
              merkleTree.getHexProof(
                keccak256(await allowlistMinter.getAddress())
              ),
              {
                value: calcTotalMintWei(
                  contractConfig.saleType.allowlistSale.mintPrice,
                  1
                ),
              }
            )
          ).to.emit(TalesOfFeather, 'Mint')
        })

        it('reverts if the address is already claimed', async function () {
          // The second (and subsequent) claims should fail
          await expect(
            contractWithAllowlistMinter.allowlistMint(
              1,
              merkleTree.getHexProof(
                keccak256(await allowlistMinter.getAddress())
              ),
              {
                value: calcTotalMintWei(
                  contractConfig.saleType.allowlistSale.mintPrice,
                  1
                ),
              }
            )
          ).to.be.revertedWith('TalesOfFeather_CustomError_AddressAlreadyClaimed')
        })
      })

      describe('publicMint()', function () {
        before(async function () {
          await TalesOfFeather.setMintPrice(
            ethers.utils.parseEther(
              contractConfig.saleType.publicSale.mintPrice
            )
          )
          await TalesOfFeather.setMaxMintAmountPerTx(
            contractConfig.saleType.publicSale.maxMintAmountPerTx
          )
        })

        it('reverts when allowlist sale is open', async function () {
          await expect(
            contractWithPublicMinter.publicMint(1, {
              value: calcTotalMintWei(
                contractConfig.saleType.publicSale.mintPrice,
                1
              ),
            })
          ).to.be.revertedWith('TalesOfFeather_CustomError_PublicSaleClosed')
        })

        it('reverts when sales are closed', async function () {
          // Set sale state to Closed
          await TalesOfFeather.setClosed()
          await expect(
            contractWithPublicMinter.publicMint(1, {
              value: calcTotalMintWei(
                contractConfig.saleType.publicSale.mintPrice,
                1
              ),
            })
          ).to.be.revertedWith('TalesOfFeather_CustomError_PublicSaleClosed')
        })

        it('reverts if the mint amount is less than 1', async function () {
          // Set sale state to Public Open
          await TalesOfFeather.setPublicOpen()
          await expect(
            contractWithPublicMinter.publicMint(0, {
              value: calcTotalMintWei(
                contractConfig.saleType.publicSale.mintPrice,
                0
              ),
            })
          ).to.be.revertedWith('TalesOfFeather_CustomError_InvalidMintAmount')
        })

        it('reverts if the mint amount is greater than maximum amount', async function () {
          await expect(
            contractWithPublicMinter.publicMint(11, {
              value: calcTotalMintWei(
                contractConfig.saleType.publicSale.mintPrice,
                11
              ),
            })
          ).to.be.revertedWith('TalesOfFeather_CustomError_InvalidMintAmount')
        })

        it('reverts if the maximum supply is exceeded when mint', async function () {
          // Use the TalesOfFeatherMock contract
          await expect(
            mockContractWithPublicMinter.publicMint(5, {
              value: calcTotalMintWei(
                contractConfig.saleType.publicSale.mintPrice,
                5
              ),
            })
          ).to.be.revertedWith('TalesOfFeather_CustomError_MaxSupplyExceeded')
        })

        it('reverts if insufficient funds are sent', async function () {
          await expect(
            contractWithPublicMinter.publicMint(1, {
              value: calcTotalMintWei(
                contractConfig.saleType.publicSale.mintPrice,
                1
              ).sub(1),
            })
          ).to.be.revertedWith('TalesOfFeather_CustomError_InsufficientFunds')
        })

        it('emits event after mint', async function () {
          await expect(
            contractWithPublicMinter.publicMint(1, {
              value: calcTotalMintWei(
                contractConfig.saleType.publicSale.mintPrice,
                1
              ),
            })
          ).to.emit(TalesOfFeather, 'Mint')
        })
      })

      describe('mintForAddress()', function () {
        it('reverts if the mint amount is less than 1', async function () {
          await expect(
            contractWithDeployer.mintForAddress(
              0,
              await externalUser.getAddress()
            )
          ).to.be.revertedWith('TalesOfFeather_CustomError_InvalidMintAmount')
        })

        it('reverts if the mint amount is greater than maximum amount', async function () {
          await expect(
            contractWithDeployer.mintForAddress(
              11,
              await externalUser.getAddress()
            )
          ).to.be.revertedWith('TalesOfFeather_CustomError_InvalidMintAmount')
        })

        it('reverts if the minter is not the deployer', async function () {
          await expect(
            contractWithExternalUser.mintForAddress(
              1,
              await externalUser.getAddress()
            )
          ).to.be.revertedWith('Ownable: caller is not the owner')
        })

        it('can only be done if the minter is the deployer', async function () {
          assert(
            contractWithDeployer.mintForAddress(
              1,
              await externalUser.getAddress()
            )
          )
        })
      })

      describe('withdraw()', function () {
        it('reverts if you are not the deployer', async function () {
          await expect(contractWithExternalUser.withdraw()).to.be.revertedWith(
            'Ownable: caller is not the owner'
          )
        })

        it('can only be done if you are the deployer', async function () {
          assert(contractWithDeployer.withdraw())
        })
      })

      describe('Reveal collection', function () {
        it('returns hidden metadata URI before the collection is revealed', async function () {
          assert.equal(await TalesOfFeather.tokenURI(1), hiddenMetadataUri)
        })

        it('returns NFT metadata URI after the collection is revealed', async function () {
          const baseUri = 'ipfs://__COLLECTION_CID__/'
          await TalesOfFeather.setBaseUri(baseUri)
          await TalesOfFeather.setRevealed(true)
          assert.equal(await TalesOfFeather.getBaseUri(), baseUri)
          assert.equal(await TalesOfFeather.tokenURI(1), `${baseUri}1.json`)
        })
      })

      describe('Test setter and getter functions', function () {
        it('returns 1 when Allowlist Only is set', async function () {
          await TalesOfFeather.setAllowlistOnly()
          assert.equal(await TalesOfFeather.getSaleState(), 1)
        })

        it('returns 2 when Public Open is set', async function () {
          await TalesOfFeather.setPublicOpen()
          assert.equal(await TalesOfFeather.getSaleState(), 2)
        })

        it('returns 0 when Closed is set', async function () {
          await TalesOfFeather.setClosed()
          assert.equal(await TalesOfFeather.getSaleState(), 0)
        })

        it('returns the value of the mint price you set', async function () {
          const wei = ethers.utils.parseEther('1')
          await TalesOfFeather.setMintPrice(wei)
          assert.equal(
            (await TalesOfFeather.getMintPrice()).toString(),
            wei.toString()
          )
        })

        it('returns the value of the maximum mint amount you set', async function () {
          await TalesOfFeather.setMaxMintAmountPerTx(100)
          assert.equal(
            (await TalesOfFeather.getMaxMintAmountPerTx()).toString(),
            '100'
          )
        })

        it('returns the hidden metadata URI you set', async function () {
          const newUri = 'ipfs://__NEW_CID__/hidden.json'
          await TalesOfFeather.setHiddenMetadataUri(newUri)
          assert.equal(await TalesOfFeather.getHiddenMetadataUri(), newUri)
        })
      })
    })
