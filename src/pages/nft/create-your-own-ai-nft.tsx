import cn from "classnames";
import Head from "next/head";
import { NFTStorage } from "nft.storage";
import { useState } from "react";
import { toast, Toaster } from "react-hot-toast";
import Link from "next/link";
import { useAddress, 

    ConnectWallet, 
    useContract,

} from '@thirdweb-dev/react'

import axios from 'axios';

const contractAddress = "0x12Be85199878E7B0d82a36c456eac975fD402F73";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState("")
  const [canShowImage, setCanShowImage] = useState(false);
  const [description, setDescription] = useState("")
  const [url, setURL] = useState("")
  const [name, setName] = useState("")
  
   
  const { contract: nftDrop } = useContract(contractAddress)
  const address = useAddress();
  let imageData ="";

  const submitForm = async(e: { preventDefault: () => void; }) => {
    e.preventDefault();
    try {
        setLoading(true);
        toast("Generating your image...", { position: "top-center" });
        imageData = await createImage()
        setLoading(false)
        setCanShowImage(true);
    } catch (error) {
        console.log(error)
    } finally {
      try {
        setLoading(true);
        toast("Uploading image to IPFS", { position: "top-center" });
        uploadImage(imageData);
        setLoading(false);
      } catch (error) {
        console.log(error)
      }
    }

  }

  const createImage = async () => {

    const URL = `https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2-1`

    try {
      // Send the request
      const response = await axios({
      url: URL,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_APP_HUGGING_FACE_API_KEY}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      data: JSON.stringify({
        inputs: description, options: { wait_for_model: true },
      }),
      responseType: 'arraybuffer',
    })
    console.log(response.status)
    if (response.status == 200) {
        const type = response.headers['content-type']
        const data = response.data
        const base64data = Buffer.from(data).toString('base64')
        const img = `data:${type};base64,` + base64data // <-- This is so we can render it on the page
        setImage(img)
        return data
    } else {
      console.log(response.status)
    }
    } catch (error) {
      console.log(error)
    }
    
    
  }

  const uploadImage = async (ImageData: any) => {
  
    console.log("imageData: ", ImageData);
    const nftStorage = new NFTStorage({ token: process.env.NEXT_PUBLIC_APP_NFT_STORAGE_API_KEY! })
    const imageFile = new File([ImageData], "image.jpeg", { type: 'image/jpeg' });
    console.log("imageFile: ", imageFile);

    const { ipnft } = await nftStorage.store({
      image: imageFile,
      name: name,
      description: description,
    })

    const url = `https://ipfs.io/ipfs/${ipnft}/metadata.json`
    setURL(url)
    console.log(url);
    console.log(ipnft);

    return(url)
  }

  const mintNft = async () => {
    if (!nftDrop || !address) return;

    nftDrop?.erc721.mint(url).then(async (tx) => {
        console.log(address, " ", url)
        toast("Congratulations! You Successfully Minted", {
            style: {
                background: 'green',
                color: 'white',
                fontWeight: 'bolder',
                fontSize: '17px',
                padding:'20px',
            }
        })


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
            AI image generator
          </h1>
          <form
            className="flex w-full sm:w-auto flex-col sm:flex-row mb-5"
            onSubmit={submitForm}
          >
            <input
              className="shadow-sm text-gray-700 rounded-sm px-3 py-2 mb-4 sm:mb-0 sm:min-w-[600px]"
              type="text"
              placeholder="Prompt for image"
              onChange={(e) => setDescription(e.target.value)}
            />

                <button disabled={loading || !address} 
                  className='min-h-[40px] shadow-sm sm:w-[100px] py-2 inline-flex justify-center font-medium items-center 
                  px-4 bg-green-600 text-gray-100 sm:ml-2 rounded-md hover:bg-green-700 disabled:bg-gray-400"
                  type="submit'>
                    
                    {loading ? (
                        <>Loading</>
                    ): !address ? (
                        <>Sign in to create</>
                    ): (
                        <span className='font-bold'>Generate </span>
                    )}
                </button>
          </form>
          <div className="relative flex w-full items-center justify-center">
            <div className="rounded-xl bg-gradient-to-br from-yellow-400 to-purple-600 p-2">
              {image && !loading ? (
                <img
                alt={`Image representation of: ${prompt}`}
                className={cn("w-44 rounded-xl object-cover lg:h-96 lg:w-72", {
                  "opacity-100": canShowImage,
                })}
                // src={image}
                src={image}
              />
              ) : loading ? (
                <div className="image__placeholder">
                  <div
                      className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
                      role="status">
                      <span
                        className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]"
                        >Loading...</span
                      >
                    </div>
              </div>
              ) : (
                <></>
              )}
              
            </div>

            <div
              className={cn(
                "w-full sm:w-[400px] absolute top-0.5 overflow-hidden rounded-2xl bg-white/5 shadow-xl shadow-black/5",
                {
                  "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-gray-500/10 before:to-transparent":
                    showLoadingState,
                  "opacity-0 shadow-none": canShowImage,
                }
              )}
            ></div>
          </div>
          <div className='mt-10 flex flex-1 flex-col items-center space-y-6 text-center 
                lg:justify-center lg:space-y-0'>
             {/* Mint button */}
             <button onClick={mintNft} disabled={loading || !address} 
                className='min-h-[40px] shadow-sm sm:w-[100px] py-2 inline-flex justify-center font-medium items-center 
                px-4 bg-green-600 text-gray-100 sm:ml-2 rounded-md hover:bg-green-700 disabled:bg-gray-400"'>
                    
                    {loading ? (
                        <>Loading</>
                    ): !address ? (
                        <>Sign in to Mint</>
                    ): (
                        <span className='font-bold'>Mint NFT</span>
                    )}
                    
                    
                </button>
          </div>
        </div>
      </div>
    </>
  );
}