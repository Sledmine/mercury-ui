import {
  Button,
  Navbar,
  NavbarDivider,
  NavbarGroup,
  NavbarHeading,
  Classes,
  Tabs,
  Tab,
} from "@blueprintjs/core"
import { useDispatch, useSelector } from "react-redux"
import {
  setCommand,
  pushError,
  selectPage,
  setPage,
} from "../../redux/slices/appSlice"
import { os } from "@neutralinojs/lib"

interface NavBarProps {
  showBack?: boolean
  onBack?: () => void
  onOpenSettings?: () => void
}

export const NavBar = ({ showBack = false, onBack, onOpenSettings }: NavBarProps) => {
  const currentPage = useSelector(selectPage)
  const dispatch = useDispatch()

  const insert = async (path: string) => {
    dispatch(setCommand(`mercury insert "${path}"`))
  }

  const insertDialog = async () => {
    try {
      const downloadsPath = await os.getPath("downloads")
      let entries = await os.showOpenDialog(
        "Select a Mercury Package to insert",
        {
          defaultPath: `${downloadsPath}/`,
          multiSelections: false,
          filters: [
            {
              name: "Mercury Packages",
              extensions: ["zip", "merc", "mercu"],
            },
          ],
        }
      )
      if (entries.length === 0) {
        return
      }
      insert(entries[0])
    } catch (error) {
      dispatch(pushError((error as any).message))
    }
  }

  return (
    <Navbar
      style={{
        position: "sticky",
        top: 0,
        zIndex: 40,
        padding: "8px 12px",
        height: 68,
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <NavbarGroup align="left">
            {showBack && (
              <Button className={Classes.MINIMAL} style={{ marginRight: 6 }} icon="arrow-left" onClick={() => { if (onBack) onBack() }} />
            )}
            <NavbarHeading>Mercury UI</NavbarHeading>
            <NavbarDivider />
          </NavbarGroup>

          {/* Tabs inline with the heading */}
          <div style={{ display: "flex", alignItems: "center" }}>
            <Tabs id="nav-tabs" selectedTabId={currentPage} onChange={(id) => dispatch(setPage(id as "available" | "installed"))} large>
              <Tab id="available" title="Available" />
              <Tab id="installed" title="Installed" />
            </Tabs>
          </div>
        </div>

        <NavbarGroup align="right" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Button
            //className={Classes.MINIMAL}
            large
            icon="plus"
            onClick={insertDialog}
            text="Insert"
          />
          <Button
            large
            icon="cog"
            onClick={() => onOpenSettings && onOpenSettings()}
            text="Settings"
          />
        </NavbarGroup>
      </div>
    </Navbar>
  )
}

export default NavBar
