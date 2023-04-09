import { createCurrentUserHook } from 'next-sanity'
import createImageUrlBuilder from '@sanity/image-url'
import {createClient} from '@sanity/client'

export const sanityClient = createClient ({
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    apiVersion: '2023-04-07',
    useCdn: process.env.NODE_ENV === 'production',
})

//export const sanityClient = createClient(config)

export const urlFor = (source) => createImageUrlBuilder(sanityClient).image(source)