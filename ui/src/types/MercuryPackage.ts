interface MercuryPackage extends MercuryPackageManifest {
  mirrors: string[]
}

export interface MercuryPackageManifest {
  version: string
  author: string
  description: string
  category: string
  name: string
  label: string
  files: File[]
  manifestVersion: string,
  image?: string
}

export interface MercuryFile {
  path: string
  type: string
  outputPath: string
}

export default MercuryPackage
