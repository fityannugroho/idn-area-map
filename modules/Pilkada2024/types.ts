type ElectionType = 'governor' | 'regent'

type Candidate = {
  ts: string
  nama: string
  warna: string
  nomor_urut: number
}

type CandidateData = {
  [areaCode: string]: {
    [candidateId: string]: Candidate
  }
}

type VotesData = {
  progres: {
    total: number
    progres: number
    persen: number
  }
} & {
  [candidateId: string]: number
}

type ElectionData = {
  mode: string
  psu: string
  ts: string
  progres: {
    total: number
    progres: number
    persen?: number
  }
  tungsura: {
    chart: {
      progres: {
        total: number
        persen: number
        progres: number
      }
    } & Record<string, number>
    table: {
      [areaCode: string]: {
        psu: string
        progres: {
          total: number
          persen: number
          progres: number
        }
        status_progress: boolean
      } & Record<string, number>
    }
  }
}

type District = {
  nama: string
  id: number
  kode: string
  tingkat: number
}
