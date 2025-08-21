'use client'

import { type PropsWithChildren, useState } from 'react'
import { PilkadaContext } from './hooks/usePilkada'
import type { ElectionType } from './types'

export default function PilkadaProvider({ children }: PropsWithChildren) {
  const [election, setElection] = useState<ElectionType>()

  return (
    <PilkadaContext
      value={{
        election,
        setElection,
      }}
    >
      {children}
    </PilkadaContext>
  )
}
