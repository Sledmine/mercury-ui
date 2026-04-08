import React, { useEffect, useState } from "react"
import {
  Button,
  Navbar,
  NavbarDivider,
  NavbarGroup,
  NavbarHeading,
  Classes,
  Tab,
  Tabs,
} from "@blueprintjs/core"
import { useDispatch, useSelector } from "react-redux"
import {
  selectPage,
  selectTheme,
  setPage,
  setTheme,
  setCommand,
  pushError,
} from "../../redux/slices/appSlice"
import { os } from "@neutralinojs/lib"

export const NavBar = () => {
  const currentTheme = useSelector(selectTheme)
  const dispatch = useDispatch()
  const toggledTheme = currentTheme === "light" ? "dark" : "light"
  const currentPage = useSelector(selectPage)

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
      }}
    >
      <NavbarGroup align="left">
        <NavbarHeading>Mercury UI</NavbarHeading>
        <NavbarDivider />
        <Button
          //className={Classes.MINIMAL}
          large
          intent={currentPage === "available" ? "primary" : "none"}
          onClick={() => dispatch(setPage("available"))}
          icon="globe-network"
          text="Available"
        />
        <Button
          //className={Classes.MINIMAL}
          large
          intent={currentPage === "installed" ? "primary" : "none"}
          onClick={() => dispatch(setPage("installed"))}
          icon="box"
          text="Installed"
        />
      </NavbarGroup>
      <NavbarGroup align="right">
        <Button
          //className={Classes.MINIMAL}
          large
          onClick={insertDialog}
          icon="plus"
          text="Insert"
        />
        <Button
          className={Classes.MINIMAL}
          icon={currentTheme === "light" ? "moon" : "flash"}
          onClick={() => dispatch(setTheme(toggledTheme))}
          text={currentTheme === "light" ? "Dark Theme" : "Light Theme"}
        />
      </NavbarGroup>
    </Navbar>
  )
}

export default NavBar
