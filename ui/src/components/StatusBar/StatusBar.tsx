import React, { useEffect, useState } from "react"
import {
  Button,
  Navbar,
  NavbarDivider,
  NavbarGroup,
  NavbarHeading,
} from "@blueprintjs/core"
import { os, app } from "@neutralinojs/lib"
import mercury from "../../mercury"
import { useDispatch } from "react-redux"
import { pushError, setCommand, setIsLoading } from "../../redux/slices/appSlice"

export const StatusBar = () => {
  const [gamePath, setGamePath] = useState("")
  const [version, setVersion] = useState("")
  const [config, setConfig] = useState({} as any)
  const dispatch = useDispatch()

  useEffect(() => {
    const getConfig = async () => {
      try {
        const config = await mercury.config()
        if (config) {
          setConfig(config)
        }
        const v = await mercury.version()
        setVersion(v || "unknown")
      } catch (error) {
        console.error(error)
      }
    }
    getConfig()
  }, [])

  useEffect(() => {
    const getPath = async () => {
      const pathFromEnv = await os.getEnv("HALO_CE_PATH")
      if (pathFromEnv) {
        setGamePath(`${pathFromEnv} (from HALO_CE_PATH)`)
        return
      }
      if (config?.game?.path) {
        setGamePath(config.game.path)
      }
    }
    getPath()
  }, [config])

  return (
    <Navbar
      style={{
        position: "sticky",
        bottom: 0,
        marginTop: "auto",
      }}
    >
      <NavbarGroup align="left">
          <b>Game Path: </b> {gamePath ? gamePath : "Not configured"}
      </NavbarGroup>
      <NavbarGroup align="right">
        <Button
          icon="download"
          text="Check for updates"
          onClick={async () => {
            dispatch(setIsLoading(true))
            const result = await mercury.latest()
            dispatch(setIsLoading(false))
            if (!result.isLatest) {
              // Exit application
              app.exit()
            } else {
              dispatch(pushError("You are already on the latest version."))
            }
          }}
        />
        <Button
          icon="cog"
          text="Game path"
          onClick={async () => {
            const path = await os.showFolderDialog("Select game path")
            if (path) {
              //dispatch(setCommand(`mercury config game.path ${path}`))
              const result = await mercury.config("game.path", `"${path}"`)
              if (result) {
                // Refresh application
                window.location.reload()
              } else {
                dispatch(
                  pushError(
                    "Failed to set game path, verify you have permissions to write to the config file."
                  )
                )
              }
            }
          }}
        />
        <NavbarDivider />
        <small>v{version || import.meta.env.REACT_APP_VERSION}</small>
      </NavbarGroup>
    </Navbar>
  )
}

export default StatusBar
