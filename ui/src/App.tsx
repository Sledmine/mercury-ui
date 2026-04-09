import React from "react"
import { useEffect } from "react"
import "./App.css"
import "normalize.css"
import "@blueprintjs/core/lib/css/blueprint.css"
import "@blueprintjs/icons/lib/css/blueprint-icons.css"
import "@blueprintjs/table/lib/css/table.css"
import { NavBar } from "./components/NavBar/NavBar"
import PackagesList from "./components/PackagesList/PackagesList"
import PackageView from "./components/PackageView/PackageView"
import MercuryPackage from "./types/MercuryPackage"
import mercury from "./mercury"
import { useDispatch, useSelector } from "react-redux"
import {
  pushError,
  selectCommand,
  selectIsLoading,
  selectPage,
  selectTheme,
  setCommand,
  setIsLoading,
  setLatestPackages,
} from "./redux/slices/appSlice"
import { Overlay, Spinner } from "@blueprintjs/core"
import { BrowserTuner } from "./components/BrowserTuner/BrowserTuner"
import { DialogMessage } from "./components/DialogMessage/DialogMessage"
import { ConsoleView } from "./components/ConsoleView/ConsoleView"
import StatusBar from "./components/StatusBar/StatusBar"
import { BLUEPRINT_DARK_THEME_CLASS } from "./constants/constants"
import SettingsDialog from "./components/SettingsDialog/SettingsDialog"

function App() {
  const dispatch = useDispatch()
  const isDarkThemeEnabled = useSelector(selectTheme) === "dark"
  const themeClass = isDarkThemeEnabled ? BLUEPRINT_DARK_THEME_CLASS : ""
  const isLoading = useSelector(selectIsLoading)
  const [packages, setPackages] = React.useState([] as MercuryPackage[])
  const currentPage = useSelector(selectPage)
  const [forceUpdate, setForceUpdate] = React.useState(false)
  const command = useSelector(selectCommand)
  const [selectedPackage, setSelectedPackage] = React.useState<null | MercuryPackage>(null)
  const [screen, setScreen] = React.useState<'list' | 'detail'>('list')
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = React.useState(false)

  // If the user switches to available/installed while on a package detail,
  // return to the list screen so they can search packages for the selected tab.
  React.useEffect(() => {
    setScreen('list')
    setSelectedPackage(null)
  }, [currentPage])

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
        // clear selection if not present
        if (selectedPackage) {
          const found = packages.find((p) => p.name === selectedPackage.name)
          if (!found) setSelectedPackage(null)
        }
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
      style={{ backgroundColor: isDarkThemeEnabled ? "#15171b" : "" }}
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
      <SettingsDialog
        isOpen={isSettingsDialogOpen}
        onClose={() => setIsSettingsDialogOpen(false)}
      />
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
      <NavBar
        showBack={screen === 'detail'}
        onBack={() => setScreen('list')}
        onOpenSettings={() => setIsSettingsDialogOpen(true)}
      />

      <div style={{ paddingLeft: 10, paddingRight: 10 }}>
        {/* Main two-column layout: packages list on left, package details on right. More spacing for breathe */}
        <div
          style={{
            //display: "flex",
            //gap: 24,
            marginTop: 6,
            height: "calc(100vh - 125px)",
            minHeight: 0,
          }}
        >
          {screen === 'list' && (
            <div style={{ width: "100%", minWidth: 360, display: "flex", flexDirection: "column", height: "100%", position: "relative" }}>
              <PackagesList
                packages={packages}
                triggerUpdate={() => setForceUpdate(!forceUpdate)}
                onSelectPackage={(p: MercuryPackage) => { setSelectedPackage(p); setScreen('detail') }}
                selectedPackageLabel={selectedPackage?.label}
              />
            </div>
          )}

          <div
            style={{
              width: "100%",
              minWidth: 420,
              height: "100%",
              minHeight: 0,
              overflowY: "auto",
            }}
          >
            {screen === 'detail' && selectedPackage && (
              <PackageView
                pack={selectedPackage}
                triggerUpdate={() => setForceUpdate(!forceUpdate)}
              />
            )}
          </div>
        </div>
      </div>
      <StatusBar />
    </div>
  )
}

export default App
