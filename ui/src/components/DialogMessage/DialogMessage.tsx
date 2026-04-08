import React from "react"

import { Button, Dialog, DialogBody, DialogFooter } from "@blueprintjs/core"
import Convert from "ansi-to-html"
import { useDispatch, useSelector } from "react-redux"
import {
  clearErrors,
  selectErrors,
  selectTheme,
} from "../../redux/slices/appSlice"

export const DialogMessage = () => {
  const convert = new Convert()
  const dispatch = useDispatch()
  const isDarkThemeEnabled = useSelector(selectTheme) === "dark"
  const themeClass = isDarkThemeEnabled ? "bp4-dark" : ""
  const errors = useSelector(selectErrors)
  return (
    <Dialog
      className={themeClass}
      isOpen={errors.length > 0}
      onClose={() => dispatch(clearErrors())}
      title="Mercury - Message"
      icon="error"
    >
      <DialogBody>
        <div
          className={themeClass}
          style={{ whiteSpace: "pre-wrap" }}
          dangerouslySetInnerHTML={{ __html: convert.toHtml(errors[0] || "") }}
        />
      </DialogBody>
      <DialogFooter
        actions={
          <Button
            intent="primary"
            text="Close"
            onClick={() => dispatch(clearErrors())}
          />
        }
      />
    </Dialog>
  )
}
