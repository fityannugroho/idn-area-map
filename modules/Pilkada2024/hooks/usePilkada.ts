import { useQuery } from '@tanstack/react-query'
import { createContext, useContext } from 'react'

const baseUrl =
  'https://raw.githubusercontent.com/razanfawwaz/pilkada-scrap/main'

const electionTypes = {
  governor: 'pkwkp',
  regent: 'pkwkk',
} as const

const endpoints = {
  candidates: (election: ElectionType) => {
    return `${baseUrl}/paslon/${electionTypes[election]}.json`
  },
  results: (
    election: ElectionType,
    level: 'province' | 'regency',
    areaCode: string,
  ) => {
    switch (level) {
      case 'province':
        return `${baseUrl}/${electionTypes[election]}/${areaCode}/${areaCode}.json`
      case 'regency':
        return `${baseUrl}/${electionTypes[election]}/${areaCode.slice(0, 2)}/${areaCode}.json`
    }
  },
}

export function useCandidates({
  election,
  enabled = true,
}: {
  election: ElectionType
  enabled?: boolean
}) {
  const { data, status, ...args } = useQuery({
    queryKey: ['candidates', election],
    queryFn: async () => {
      const res = await fetch(endpoints.candidates(election))

      if (res.ok) {
        return (await res.json()) as CandidateData
      }

      throw new Error(`Failed to fetch candidates data: ${res.statusText}`)
    },
    enabled,
  })

  return {
    status,
    ...args,
    /**
     * Get candidates data for a specific area.
     * @param areaCode The area code to get the candidates data.
     * @returns The candidates data for the specified area.
     * @throws An error if the data is not ready.
     */
    getCandidates: (areaCode: string) => {
      if (status !== 'success') {
        throw new Error('Ensure the data is ready before calling this function')
      }
      return data[areaCode]
    },
    /**
     * Get a specific candidate data.
     * @param areaCode The area code of the candidate.
     * @param candidateId The ID of the candidate.
     * @returns The candidate data.
     * @throws An error if the data is not ready.
     */
    getCandidate: (areaCode: string, candidateId: string) => {
      if (status !== 'success') {
        throw new Error('Ensure the data is ready before calling this function')
      }
      return data[areaCode][candidateId]
    },
  }
}

export function useElectionResults({
  election,
  level,
  areaCode,
  enabled = true,
}: {
  election: ElectionType
  level: 'province' | 'regency'
  areaCode: string
  enabled?: boolean
}) {
  const { data, status, ...args } = useQuery({
    queryKey: ['votes', election, level, areaCode],
    queryFn: async () => {
      const res = await fetch(endpoints.results(election, level, areaCode))

      if (res.ok) {
        return (await res.json()) as ElectionData
      }

      throw new Error(`Failed to fetch election data (area code: ${areaCode})`)
    },
    enabled,
  })

  return {
    data,
    status,
    ...args,
    /**
     * Get the election recap data.
     * @returns The election recap data.
     * @throws An error if the data is not ready.
     */
    getRecap: () => {
      if (status !== 'success') {
        throw new Error('Ensure the data is ready before calling this function')
      }
      return data.tungsura.chart
    },
    /**
     * Get the election data for a specific area.
     * @param childAreaCode The area code to get the election data.
     * @returns The election data for the specified area.
     * @throws An error if the data is not ready.
     */
    getVotesByArea: (childAreaCode: string) => {
      if (status !== 'success') {
        throw new Error('Ensure the data is ready before calling this function')
      }
      return data.tungsura.table[childAreaCode]
    },
  }
}

type PropsContext = {
  election?: ElectionType
  setElection: React.Dispatch<React.SetStateAction<ElectionType | undefined>>
  votes?: VotesData
  setVotes?: React.Dispatch<React.SetStateAction<VotesData | undefined>>
  candidates?: { [candidateId: string]: Candidate }
  setCandidates?: React.Dispatch<
    React.SetStateAction<{ [candidateId: string]: Candidate } | undefined>
  >
}

export const PilkadaContext = createContext<PropsContext | undefined>(undefined)

export function usePilkada() {
  const context = useContext(PilkadaContext)

  if (!context) {
    throw new Error('usePilkada must be used within a PilkadaProvider')
  }

  return context
}
