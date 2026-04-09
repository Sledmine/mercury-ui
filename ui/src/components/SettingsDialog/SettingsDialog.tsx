import React, { useEffect, useState } from "react"
import {
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  FormGroup,
  InputGroup,
  Spinner,
} from "@blueprintjs/core"
import { os } from "@neutralinojs/lib"
import { useDispatch, useSelector } from "react-redux"
import mercury from "../../mercury"
import { BLUEPRINT_DARK_THEME_CLASS } from "../../constants/constants"
import { pushError, selectTheme } from "../../redux/slices/appSlice"

interface SettingsDialogProps {
  isOpen: boolean
  onClose: () => void
}

export const SettingsDialog: React.FC<SettingsDialogProps> = ({ isOpen, onClose }) => {
  const dispatch = useDispatch()
  const isDarkThemeEnabled = useSelector(selectTheme) === "dark"
  const themeClass = isDarkThemeEnabled ? BLUEPRINT_DARK_THEME_CLASS : ""

  const [gamePath, setGamePath] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  const loadGamePath = async () => {
    try {
      const pathFromEnv = await os.getEnv("HALO_CE_PATH")
      if (pathFromEnv) {
        setGamePath(pathFromEnv)
        return
      }

      const config = await mercury.config()
      setGamePath(config?.game?.path || "")
    } catch (error) {
      dispatch(pushError((error as Error).message || "Failed to load settings."))
    }
  }

  useEffect(() => {
    if (isOpen) {
      loadGamePath()
    }
  }, [isOpen])

  const openFolderDialog = async () => {
    try {
      const path = await os.showFolderDialog("Select game path")
      if (path) {
        setGamePath(path)
      }
    } catch (error) {
      dispatch(pushError((error as Error).message || "Failed to open folder dialog."))
    }
  }

  const saveSettings = async () => {
    try {
      setIsSaving(true)
      const result = await mercury.config("game.path", `"${gamePath}"`)
      if (!result) {
        dispatch(
          pushError(
            "Failed to set game path, verify you have permissions to write to the config file."
          )
        )
        return
      }
      onClose()
      window.location.reload()
    } catch (error) {
      dispatch(pushError((error as Error).message || "Failed to save settings."))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog
      className={themeClass}
      isOpen={isOpen}
      onClose={onClose}
      title="Settings"
      icon="cog"
      canEscapeKeyClose={!isSaving}
      canOutsideClickClose={!isSaving}
    >
      <DialogBody>
        <FormGroup label="Game path" helperText="Path to your Halo CE installation directory.">
          <div style={{ display: "flex", gap: 8 }}>
            <InputGroup
              value={gamePath}
              onChange={(e) => setGamePath(e.target.value)}
              placeholder="Select a folder"
              fill
              disabled={isSaving}
            />
            <Button icon="folder-open" onClick={openFolderDialog} disabled={isSaving}>
              Browse
            </Button>
          </div>
        </FormGroup>
      </DialogBody>
      <DialogFooter
        actions={
          <>
            <Button onClick={onClose} disabled={isSaving}>
              Cancel
            </Button>
            <Button intent="primary" onClick={saveSettings} disabled={!gamePath || isSaving}>
              {isSaving ? <Spinner size={14} /> : "Save"}
            </Button>
          </>
        }
      />
    </Dialog>
  )
}

export default SettingsDialog
