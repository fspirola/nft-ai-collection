import Head from "next/head";
import {  useState, useEffect } from "react";
import { Toaster } from "react-hot-toast";
import Link from "next/link";
import { useAddress, 
    ConnectWallet, 
    useContract,
    MediaRenderer,
    useOwnedNFTs,
    useTransferNFT,
} from '@thirdweb-dev/react'

//const contractAddress = "0x12Be85199878E7B0d82a36c456eac975fD402F73";
const contractAddress = "0x937ac677Ea4E01Fb4F9f3A1Bd86ee2f45423a3Cd";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState("")
  const [canShowImage, setCanShowImage] = useState(false);
 
  const { contract: nftDrop } = useContract(contractAddress)
  const address = useAddress();
  const collection = useOwnedNFTs(nftDrop, address);
  const transferNFT = useTransferNFT(nftDrop);

  const showLoadingState = loading || (image && !canShowImage);

  return (
    <>
      <Head>
        <title>AI Image Generator</title>
      </Head>
      <div className="max-w-8xl mx-w-7xl flex flex-col min-w-7xl py-5 px-10 2xl:px-0">

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

        <Toaster position='bottom-center' />
        <div className="flex flex-col items-center justify-center py-1 lg:min-h-screen">
          <h1 className="text-5xl tracking-tighter pb-5 font-bold text-gray-800">
            Manage NFT Collection
          </h1>
          <section className="bg-gray-100 dark:bg-gray-900 py-5 px-12">
            <div className="grid grid-flow-row gap-8 text-neutral-600 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"> 
                {collection.data?.map(function(d){
                  if (d.owner.trim() === address?.trim()) {
                    console.log("IF ", d.owner, " ", address)
                    return (
                      <div key={d.metadata.id} className='my-8 rounded shadow-lg shadow-gray-200 dark:shadow-gray-900 bg-white dark:bg-gray-800 duration-300 hover:-translate-y-1'>
                          <MediaRenderer
                              className='object-cover w-full h-56 rounded-lg lg:w-64'
                              src={d.metadata.image} 
                              alt={`${d.metadata.description} preview image`}
                          />
                          <div className="p-4 leading-5 text-gray-500 dark:text-gray-400">
                              <p className="text-lg mb-4 font-bold leading-relaxed text-gray-800 dark:text-gray-300">ID #{d.metadata.id}</p>
                              <small className="text-sm text-gray-800 dark:text-white ">
                                  {d.metadata.description}
                              </small>
                            <div className='mt-5 flex flex-1 flex-col items-center space-y-6 text-center 
                                  lg:justify-center lg:space-y-0'>
                               <div className="w-full text-center mx-auto">
                                  {/* Transfer button 
                                  <button  disabled={loading || !address} 
                                      className='group rounded-2xl h-12 w-48 bg-green-500 font-bold text-lg text-white relative overflow-hidden hover:bg-green-700 disabled:bg-gray-400'>
                                          {loading ? (
                                              <>Loading</>
                                          ): !address ? (
                                              <>Sign in to Transfer</>
                                          ): (
                                              <span className='font-bold'>Transfer NFT</span>
                                          )}
                                  </button>*/}
                                </div>
                           </div>
                         </div>   
                     </div>
                   )
                  } else {
                    console.log("ELSE ",collection.data.length)
                    return (
                      <h1 key={d.metadata.id}>Nothing to show!!!</h1>
                    )
                  }
                })}
           </div>
         </section>
        </div>
      </div>
    </>
  );
}

