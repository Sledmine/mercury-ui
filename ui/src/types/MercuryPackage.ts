interface MercuryPackage extends Omit<MercuryPackageManifest, 'files, manifestVersion'> {
  mirrors: string[]
  versions: string[]
  checksum: string,
}

export interface MercuryPackageManifest {
  version: string
  author: string
  description: string
  category: string
  name: string
  label: string
  files: File[]
  manifestVersion: string
  image?: string
  backdropImageUrl?: string
  changelog?: string
}

export interface MercuryFile {
  path: string
  type: string
  outputPath: string
}

export default MercuryPackage
