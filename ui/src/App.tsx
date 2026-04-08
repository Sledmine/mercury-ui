import React from "react"
import { useEffect } from "react"
import "./App.css"
import "normalize.css"
import "@blueprintjs/core/lib/css/blueprint.css"
import "@blueprintjs/icons/lib/css/blueprint-icons.css"
import "@blueprintjs/table/lib/css/table.css"
import { NavBar } from "./components/NavBar/NavBar"
import PackagesList from "./components/PackagesList/PackagesList"
import MercuryPackage from "./types/MercuryPackage"
import mercury from "./mercury"
import { useDispatch, useSelector } from "react-redux"
import {
  clearErrors,
  pushError,
  selectCommand,
  selectErrors,
  selectIsLoading,
  selectPage,
  selectTheme,
  setCommand,
  setIsLoading,
  setLatestPackages,
} from "./redux/slices/appSlice"
import {
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  Overlay,
  Spinner,
} from "@blueprintjs/core"
import { BrowserTuner } from "./components/BrowserTuner/BrowserTuner"
import Convert from "ansi-to-html"
import { DialogMessage } from "./components/DialogMessage/DialogMessage"
import { ConsoleView } from "./components/ConsoleView/ConsoleView"
import StatusBar from "./components/StatusBar/StatusBar"
import { BLUEPRINT_DARK_THEME_CLASS } from "./constants/constants"

function App() {
  const convert = new Convert()
  const dispatch = useDispatch()
  const isDarkThemeEnabled = useSelector(selectTheme) === "dark"
  const themeClass = isDarkThemeEnabled ? BLUEPRINT_DARK_THEME_CLASS : ""
  const isLoading = useSelector(selectIsLoading)
  const [packages, setPackages] = React.useState([] as MercuryPackage[])
  const currentPage = useSelector(selectPage)
  const errors = useSelector(selectErrors)
  const [forceUpdate, setForceUpdate] = React.useState(false)
  const command = useSelector(selectCommand)

  useEffect(() => {
    const getPackages = async () => {
      try {
        dispatch(setIsLoading(true))
        let packages = []
        if (currentPage === "available") {
          packages = await mercury.fetch()
          dispatch(setLatestPackages(packages))
          const installedPackages = await mercury.list()
          packages = packages.filter(
            (pack) => !installedPackages.find((p) => p.name === pack.name)
          )
        } else {
          packages = await mercury.list()
        }
        setPackages(packages)
      } catch (error) {
        dispatch(setIsLoading(false))
        //@ts-ignore
        dispatch(pushError(error.message))
      }
      dispatch(setIsLoading(false))
    }
    getPackages()
  }, [currentPage, forceUpdate])

  return (
    <div
      className={`App ${themeClass}`}
      style={{ backgroundColor: isDarkThemeEnabled ? "#25282e" : "" }}
    >
      <BrowserTuner />
      <ConsoleView
        command={command}
        onCommandFinished={() => {
          setForceUpdate(!forceUpdate)
        }}
        onClose={() => {
          dispatch(setCommand(null))
        }}
      />
      <DialogMessage />
      <Overlay isOpen={isLoading} shouldReturnFocusOnClose>
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <Spinner intent="primary" aria-label={"Loading..."} />
          <p style={{ marginTop: 20 }} className={`${themeClass}`}>
            Loading...
          </p>
        </div>
      </Overlay>
      <NavBar />
      <div>
        <PackagesList
          packages={packages}
          triggerUpdate={() => setForceUpdate(!forceUpdate)}
        />
      </div>
      <StatusBar/>
    </div>
  )
}

export default App
