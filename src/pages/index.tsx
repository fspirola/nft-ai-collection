import { GetServerSideProps } from 'next'
import Head from 'next/head'
//import { sanityClient, urlFor } from '../../sanity'
import { Collection, CollectionApi } from '../../typings'
import Link from 'next/link'
import { MediaRenderer } from "@thirdweb-dev/react";

interface Props {
  collections: Collection[]
  collectionsApi: CollectionApi[]
}

const dev = process.env.NEXT_PUBLIC_APP_ENV !== 'production'
const server = dev ? 'http://localhost:3000' : 'https://nft-ai-collection-git-main-fspirola.vercel.app/'

export default function Home({  collections, collectionsApi }: Props) {
  console.log("API ", collectionsApi, " Connections: ", collections)
  console.log(server)
  return (
    <div className='max-w-7xl mx-w-7xl flex flex-col min-w-7xl py-5 px-10 2xl:px-0'>
        <Head>
          <title>NFT AI Collection</title>
          <link rel="icon" href='/favicon.ico' />
        </Head>
         <h1 className='mb-10 text-4xl font-extralight'>
            The{' '} 
            <span className='font-extrabold underline decoration-pink-600/50'> 
             AI NFT 
            </span>{' '}
            Marketplace
          </h1>  
          <main className='bg-slate-100 p-5 shadow-xl shadow-rose-400/20'>
            <div className='grid space-x-3 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4'>
              {collectionsApi.map((collection, index) => (
                <Link key={index} href={`/nft/${collection.slug}`}>
                  <div key={index} className='flex flex-col items-center cursor-pointer 
                  transition-all duration-200 hover:scale-105'>
                    {/*<img className='h-96 w-60 rounded-2xl object-cover'
                      src={collection.imageUrl} alt="" />*/}
                      <MediaRenderer className='h-96 w-60 rounded-2xl object-cover' 
                      src={collection.imageUrl} alt="" />
                    <div className='p-5'>
                      <h2 className='text-3xl'>{collection.title}</h2>
                      <p className='mt-2 text-sm text-gray-400'>{collection.description}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </main>
      </div>
  )
}


export const getServerSideProps: GetServerSideProps = async (context) => {
  {/*const query = `*[_type == "collecction"]{
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
  }`*/}


  //const collections = await sanityClient.fetch(query)
  const res = await fetch(`${server}/api/hello`)
  const collectionsApi = await res.json()

  return {
    props: {
      //collections,
      collectionsApi: JSON.parse(JSON.stringify(collectionsApi))
    }
  }

}