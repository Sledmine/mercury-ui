import { os } from "@neutralinojs/lib"
import MercuryPackage from "../types/MercuryPackage"

const noANSI = (text: string) => {
  //return text.replace(/\x1b\[[0-9;]*m/g, "")
  return text
}

const mercury = {
  fetch: async () => {
    const { exitCode, stdOut } = await os.execCommand("mercury fetch --json")
    if (exitCode !== 0) {
      throw new Error(
        noANSI(stdOut) ||
          "Failed to fetch packages, check if mercury is available trough PATH"
      )
    }
    const data = JSON.parse(stdOut)
    return Object.keys(data).map((key) => data[key]) as MercuryPackage[]
  },
  install: async (label: string) => {
    const { exitCode, stdOut } = await os.execCommand(
      `mercury install ${label}`
    )
    return { isInstalled: exitCode === 0, stdOut: noANSI(stdOut) }
  },
  remove: async (label: string) => {
    const { exitCode, stdOut } = await os.execCommand(`mercury remove ${label}`)
    return { isRemoved: exitCode === 0, stdOut: noANSI(stdOut) }
  },
  update: async (label: string) => {
    const { exitCode, stdOut } = await os.execCommand(`mercury update ${label}`)
    return { isUpdated: exitCode === 0, stdOut: noANSI(stdOut) }
  },
  list: async () => {
    const { exitCode, stdOut } = await os.execCommand("mercury list --json")
    if (exitCode !== 0) {
      //throw new Error(noANSI(stdOut) || "Failed to list packages")
      return []
    }
    const data = JSON.parse(stdOut)
    return Object.keys(data).map((key) => data[key]) as MercuryPackage[]
  },
  version: async () => {
    const { exitCode, stdOut } = await os.execCommand("mercury -v")
    if (exitCode !== 0) {
      return null
    }
    return stdOut
  },
  config: async (key?: string, value?: string) => {
    if (key) {
      const { exitCode, stdOut } = await os.execCommand(
        `mercury config ${key} ${value} --json`
      )
      if (exitCode !== 0) {
        return null
      }
      return true
    }
    const { exitCode, stdOut } = await os.execCommand("mercury config --json")
    return JSON.parse(stdOut)
  },
  latest: async () => {
    const { exitCode, stdOut } = await os.execCommand("mercury latest")
    return { isLatest: exitCode === 0, stdOut: noANSI(stdOut) }
  }
}

export default mercury
