
## DApp using Thirdweb NFT Contract to mint and claim NFTs creates by Stable Diffusio, a text-to-image generative Artificial Intelligence model developed by StabilityAI 

## Tools

NFT Drop: to create a lazy-minted ERC721 NFT Collection that our users can claim.
NextJS
Tailwind
Sanity

## Using this Repo

To create your own version of this template, you can use the following steps:

## Run this command from the terminal to clone this project:

## 1. Deploy Your Own NFT Drop on thirdweb

Head to the thirdweb dashboard and create your own NFT Drop contract.

You can learn how to do that with our guide Release an NFT drop on your own site without writing any code.

Be sure to configure a name, description, and image for your NFT drop in the dashboard.

## 2. Plug in your NFT Drop contract address
Replace the value of the myNftDropContractAddress inside index.tsx with your NFT Drop contract address you can find in the dashboard.

## 3. Configure Your Network
Inside _app.tsx you can configure the network you want to use:

// This is the chainId your dApp will work on.
const activeChainId = ChainId.Mumbai;
