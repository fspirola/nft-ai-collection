import React, { useEffect, useMemo, useState } from 'react'
import { GetServerSideProps } from 'next'
import { useAddress, 
    useDisconnect, 
    useMetamask, 
    ConnectWallet, 
    useContract,
    useClaimedNFTSupply, 
    useClaimConditions,
    useContractMetadata,
    useUnclaimedNFTSupply,
    useActiveClaimConditionForWallet,
    MediaRenderer,
    useClaimerProofs,
    useActiveChain,
    useConnectionStatus,
    useNFT
} from '@thirdweb-dev/react'
import { sanityClient, urlFor } from '../../../sanity'
import { Collection } from '../../../typings'
import Link from 'next/link'
import { BigNumber, utils } from 'ethers'
import toast, { Toaster } from 'react-hot-toast'

interface Props {
    collection: Collection[]
}

const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
  
export default function NFTDropPage({ collection }: Props) {
    
    const disconnect = useDisconnect();
    const chain = useActiveChain();
    const status = useConnectionStatus();
     
    const { contract: nftDrop } = useContract(contractAddress)
    const address = useAddress();
    
    const [claimeSupply, setClaimedSupply] = useState<number>(0);
    const [totalSupply, setTotalSupply] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [priceInEth, setPriceInEth] = useState<string>();
    const [quantity, setQuantity] = useState(1);

    
    const { data: contractMetadata } = useContractMetadata(nftDrop);

    const claimConditions = useClaimConditions(nftDrop);
    const claimedSupply = useClaimedNFTSupply(nftDrop);
    const unclaimedSupply = useUnclaimedNFTSupply(nftDrop);
    const nft = useNFT(nftDrop, 1);

    const activeClaimCondition = useActiveClaimConditionForWallet(
        nftDrop,
        address || ""
      );

    const numberClaimed = useMemo(() => {
        return BigNumber.from(claimedSupply.data || 0).toString();
      }, [claimedSupply]);
    
    const maxAvailable = BigNumber.from(unclaimedSupply.data || 0);

    const claimerProofs = useClaimerProofs(nftDrop, address || "");

    const numberTotal = useMemo(() => {
        return BigNumber.from(claimedSupply.data || 0)
          .add(BigNumber.from(unclaimedSupply.data || 0))
          .toString();
        }, [claimedSupply.data, unclaimedSupply.data]);
    
        const priceToMint = useMemo(() => {
            const bnPrice = BigNumber.from(
              activeClaimCondition.data?.currencyMetadata.value || 0
            );
            return `${utils.formatUnits(
              bnPrice.mul(quantity).toString(),
              activeClaimCondition.data?.currencyMetadata.decimals || 18
            )} ${activeClaimCondition.data?.currencyMetadata.symbol}`;
          }, [
            activeClaimCondition.data?.currencyMetadata.decimals,
            activeClaimCondition.data?.currencyMetadata.symbol,
            activeClaimCondition.data?.currencyMetadata.value,
            quantity,
          ]);


          const maxClaimable = useMemo(() => {
            let bnMaxClaimable;
            try {
              bnMaxClaimable = BigNumber.from(
                activeClaimCondition.data?.maxClaimableSupply || 0
              );
            } catch (e) {
              bnMaxClaimable = BigNumber.from(1_000_000);
            }
        
            let perTransactionClaimable;
            try {
              perTransactionClaimable = BigNumber.from(
                activeClaimCondition.data?.maxClaimablePerWallet || 0
              );
            } catch (e) {
              perTransactionClaimable = BigNumber.from(1_000_000);
            }
        
            if (perTransactionClaimable.lte(bnMaxClaimable)) {
              bnMaxClaimable = perTransactionClaimable;
            }
        
            const snapshotClaimable = claimerProofs.data?.maxClaimable;
        
            if (snapshotClaimable) {
              if (snapshotClaimable === "0") {
                // allowed unlimited for the snapshot
                bnMaxClaimable = BigNumber.from(1_000_000);
              } else {
                try {
                  bnMaxClaimable = BigNumber.from(snapshotClaimable);
                } catch (e) {
                  // fall back to default case
                }
              }
            }
        
            const maxAvailable = BigNumber.from(unclaimedSupply.data || 0);
        
            let max;
            if (maxAvailable.lt(bnMaxClaimable)) {
              max = maxAvailable;
            } else {
              max = bnMaxClaimable;
            }
        
            if (max.gte(1_000_000)) {
              return 1_000_000;
            }
            return max.toNumber();
          }, [
            claimerProofs.data?.maxClaimable,
            unclaimedSupply.data,
            activeClaimCondition.data?.maxClaimableSupply,
            activeClaimCondition.data?.maxClaimablePerWallet,
          ]);

          const isSoldOut = useMemo(() => {
            try {
              return (
                (activeClaimCondition.isSuccess &&
                  BigNumber.from(activeClaimCondition.data?.availableSupply || 0).lte(
                    0
                  )) ||
                numberClaimed === numberTotal
              );
            } catch (e) {
              return false;
            }
          }, [
            activeClaimCondition.data?.availableSupply,
            activeClaimCondition.isSuccess,
            numberClaimed,
            numberTotal,
          ]);

          const isLoading = useMemo(() => {
            return (
              activeClaimCondition.isLoading ||
              unclaimedSupply.isLoading ||
              claimedSupply.isLoading ||
              !nftDrop
            );
          }, [
            activeClaimCondition.isLoading,
            nftDrop,
            claimedSupply.isLoading,
            unclaimedSupply.isLoading,
          ]);

    //setLoading(true);
    

    const mintNft = () => {
        if (!nftDrop || !address) return;
        const quantity = 1;
        nftDrop?.erc721.claimTo(address, quantity).then(async (tx) => {
            //const receipt = tx(0).receipt
            //const claimedTokenId = tx(0).id
            //const claimedNFT = await tx(0).data()
            toast("Congratulations! You Successfully Minted", {
                style: {
                    background: 'green',
                    color: 'white',
                    fontWeight: 'bolder',
                    fontSize: '17px',
                    padding:'20px',
                }
            })
            console.log(tx);

        }).catch(err => {
            console.log(err)
            toast('Whoops... Something went wrong', {
                style: {
                    background: 'red',
                    color: 'white',
                    fontWeight: 'bolder',
                    fontSize: '17px',
                    padding:'20px',
                }
            })
        }).finally(() => {
            setLoading(false)
            //toast.dismiss(notification)
        })
    }

    useEffect(() => {
      disconnect
      console.log(chain?.chainId, " ", status)
        if (status === "connected" && chain?.chainId != 80001) {
          console.log("Entrou no IF ", chain)
          toast('Connected to an unsupported network. Please connect to a Mumbai test network', {
            style: {
                background: 'red',
                color: 'white',
                fontWeight: 'bolder',
                fontSize: '17px',
                padding:'20px',
            }
         })
          disconnect;
          console.log(chain?.chainId, " ", status)
       }
    },[chain, disconnect,status])
    
  return (
    <div className='flex h-screen flex-col lg:grid lg:grid-cols-10'>
    <Toaster position='bottom-center' />

    {/* Left */}
    {collection.map((coll, index) => (
        <div key={index} className='bg-gradient-to-br from-cyan-800 to-rose-500 lg:col-span-4 '>
            <div className='flex flex-col items-center justify-center py-2 lg:min-h-screen'>
                <div className='rounded-xl bg-gradient-to-br from-yellow-400 to-purple-600 p-2'>
                    <img className='w-44 rounded-xl object-cover lg:h-96 lg:w-72' 
                        src={urlFor(coll.previewImage).url()} alt="" />
                </div>
                    <div className='space-y-6 p-5 text-center'>
                            <h1 className='text-4xl font-bold text-white'>
                                {/*coll.nftCollection*/}
                                {contractMetadata?.description}
                            </h1>
                            <h2 className='text-xl text-gray-300'>
                            {/*coll.description*/}
                            </h2>
                    </div>
            </div>
        </div>
    ))}
    {/* Right */}
    <div className='flex flex-1 flex-col p-12 lg:col-span-6'>
      
        {/* Header */}
        <header className='flex items-center justify-between'>
            <Link href={'/'}>
                <h1 className='w-52 cursor-pointer text-xl font-extralight sm:w-80'>
                    The{' '} 
                    <span className='font-extrabold underline decoration-pink-600/50'> 
                    AI NFT 
                    </span>{' '}
                    Marketplace
                </h1>  
            </Link>

            <ConnectWallet className='rounded-full bg-rose-400 px-4 py-2 text-xs text-bold text-white 
            lg:px-5 lg:py-3 lg:text-base'
                theme="light"
                btnTitle="Connect Wallet"
            />

        </header>

        <hr className='my-2 border' />
        {address && (
            <p className='text-center text-sm text-rose-400'>You`re logged in with wallet {address.substring(0,5)}...{address.substring(address.length-5)}</p>
        )}
        {/* Content */}

        {collection.map((collection, index) => (
                <div key={index} className='mt-10 flex flex-1 flex-col items-center space-y-6 text-center 
                lg:justify-center lg:space-y-0'>
                    <MediaRenderer
                      className='w-80 object-cover pb-10 lg:h-40'
                      src={contractMetadata?.image} 
                      alt={`${contractMetadata?.name} preview image`}
                    />
                    <h1 className='text-3xl font-bold lg:text-5xl lg:font-extrabold'>
                    {contractMetadata?.name}
                    </h1>
                    {isLoading ? (
                      <p className='animate-pulse pt-2 text-xl text-green-500'> 
                        Loading Supply Count...</p>
                    ) : (
                      <p className='pt-2 text-xl text-green-500'> 
                       {numberClaimed} / {numberTotal?.toString()} NFTs claimed</p>
                    )}

                    {isLoading && (
                        <img className='h-80 w-80 object-contain' 
                        src="https://cdn.hackernoon.com/images/0*4Gzjgh9Y7Gu8KEtZ.gif" alt="" />
                    )}
                    
                </div>
         ))}
                {/* Mint button */}
                <button onClick={mintNft} disabled={isLoading || isSoldOut || !address} 
                className='h-16 w-full rounded-full bg-red-600  text-white font-bold disabled:bg-gray-400'>
                    
                    {isLoading ? (
                        <>Loading</>
                    ): isSoldOut ? (
                        <>SOLD OUT</>
                    ): !address ? (
                        <>Sign in to Mint</>
                    ): (
                        <span className='font-bold'>Claim your NFT</span>
                    )}
                </button>
    </div>
  </div>
  )
}

//export default NFTDropPage

export const getServerSideProps: GetServerSideProps = async ({params}) => {
  const query = `*[_type == "collecction" && slug.current == $id][]{
        _id,
        title,
        address,
        description,
        nftCollectionName,
        mainImage {
          asset
        },
        previewImage {
         asset
        },
       slug {
        current
       },
      creator -> {
        _id,
        name,
        address,
        slug {
          current
        },
      },
    }`

    const collection = await sanityClient.fetch(query, {
        id: params?.id
    })

    if (!collection) {
        return{
            notFound: true
        }
    }

    return {
        props: {
          collection
        }
      }
}