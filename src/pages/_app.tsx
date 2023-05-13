import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { ThirdwebProvider, metamaskWallet, localWallet } from '@thirdweb-dev/react';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThirdwebProvider 
    activeChain="mumbai"
    supportedWallets={[
      metamaskWallet(),
      localWallet()
    ]}
    sdkOptions={{
      gasless: {
        openzeppelin: {
          relayerUrl: "https://api.defender.openzeppelin.com/autotasks/1dbc083c-34ea-4a14-9283-d97f8f20567c/runs/webhook/fd495984-e720-4ea6-8804-017163488955/BtNwjqCWEFEag1Q1srELyV"
        }
      }
    }}
    >
      <Component {...pageProps}  />
    </ThirdwebProvider>
  )
  
}


