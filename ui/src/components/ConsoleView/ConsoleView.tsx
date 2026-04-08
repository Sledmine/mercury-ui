import React, { useState, useEffect } from "react"
import {
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  Spinner,
} from "@blueprintjs/core"
import Convert from "ansi-to-html"
import { useSelector } from "react-redux"
import { selectTheme } from "../../redux/slices/appSlice"
import { os, events } from "@neutralinojs/lib"

// Ensure just one event will be used, if we assign eventer later multiple events will be triggered
let currentProcessId: number | null
let currentProcessPID = 0
let onSpawnedProcess = (evt: CustomEvent) => {}
events.on("spawnedProcess", (evt) => {
  onSpawnedProcess(evt)
})

export const ConsoleView: React.FC<{
  command: string | null
  onCommandFinished?: () => void
  onClose?: () => void
}> = ({ command, onCommandFinished, onClose }) => {
  const convert = new Convert()
  const isDarkThemeEnabled = useSelector(selectTheme) === "dark"
  const themeClass = isDarkThemeEnabled ? "bp4-dark" : ""
  const [terminalOutput, setTerminalOutput] = useState("")
  const [exitCode, setExitCode] = useState(0)

  const printMessage = (data: string) => {
    // If we have a return carriage, replace last line
    setTerminalOutput((prev) => {
      if (data.includes("\r")) {
        const lines = prev.split("\n")
        lines[lines.length - 1] = data
        return lines.join("\n")
      }
      return `${prev}${data}`
    })
  }

  const runCommand = async () => {
    if (!command) return
    setExitCode(1)
    const { id, pid } = await os.spawnProcess(command)
    currentProcessId = id
    currentProcessPID = pid
  }

  const cancelCommand = async () => {
    if (currentProcessId === null) return
    try {
      //console.log("Canceling process", currentProcessPID)
      await os.updateSpawnedProcess(currentProcessId, "exit")
      console.log("Process canceled")
      currentProcessId = null
    } catch (error) {
      console.error(error)
    }
  }

  const clearConsole = () => {
    setTerminalOutput("")
  }

  const cleanUp = async () => {
    onClose && onClose()
    clearConsole()
    await cancelCommand()
  }

  useEffect(() => {
    clearConsole()
  }, [])

  useEffect(() => {
    clearConsole()
    onSpawnedProcess = (evt: CustomEvent) => {
      if (evt.detail.id === currentProcessId) {
        switch (evt.detail.action) {
          case "stdOut":
            printMessage(evt.detail.data)
            //console.log(JSON.stringify(evt.detail.data))
            break
          case "stdErr":
            printMessage(evt.detail.data)
            //console.log(JSON.stringify(evt.detail.data))
            //console.error(evt.detail.data)
            break
          case "exit":
            console.log(`Process terminated with exit code: ${evt.detail.data}`)
            currentProcessId = null
            setExitCode(evt.detail.data)
            if (onCommandFinished) {
              onCommandFinished()
            }
            break
          default:
            console.log("Unknown event", evt.detail)
            break
        }
      }
    }
    if (command) runCommand()
  }, [command])

  // Scroll to bottom when terminal output changes
  useEffect(() => {
    const consoleElement = document.getElementById("console")
    if (consoleElement) {
      consoleElement.scrollTo(0, consoleElement.scrollHeight)
    }
  }, [terminalOutput])

  return (
    <>
      <Dialog
        className={themeClass}
        isOpen={terminalOutput !== ""}
        onClose={() => {
          cleanUp()
        }}
        title="Mercury Console - View"
        canOutsideClickClose={false}
        icon="console"
        style={{ overflow: "hidden" }}
      >
        <DialogBody>
          <div
            id="console"
            className={themeClass}
            // For some weird CSS reason if this div does not have a maxHeight, app will crash
            // ONLY when the UI is of really small size, lol
            style={{
              whiteSpace: "pre-wrap",
              maxHeight: "300px",
              overflowY: "scroll",
              scrollBehavior: "smooth",
            }}
            dangerouslySetInnerHTML={{
              __html: convert.toHtml(terminalOutput || ""),
            }}
          />
        </DialogBody>
        <DialogFooter
          actions={
            <Button
              intent={exitCode === 0 ? "success" : "danger"}
              text={exitCode === 0 ? "Close" : "Cancel"}
              onClick={() => {
                cleanUp()
              }}
            />
          }
        >
          {currentProcessId !== null ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                position: "relative",
              }}
            >
              <Spinner size={32} />
              <div style={{ width: "10px" }} />
              Mercury is running, please wait...
            </div>
          ) : null}
        </DialogFooter>
      </Dialog>
    </>
  )
}
