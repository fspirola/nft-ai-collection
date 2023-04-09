import {defineConfig} from 'sanity'
import {deskTool} from 'sanity/desk'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from '../sanity/schemas'

export default defineConfig({
  name: 'default',
  title: 'nft-ai-collect',

  projectId: 'n94uxprg',
  dataset: 'production',

  plugins: [deskTool(), visionTool()],

  schema: {
    types: schemaTypes,
  },
})
