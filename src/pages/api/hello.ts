// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { menus } from './menu'

type Data = {
  menus: [
    {
      id: number,
      title: string,
      description: string,
      slug: string,
      imageUrl: string
    }
  ]
  
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.status(200).send(menus)
}
