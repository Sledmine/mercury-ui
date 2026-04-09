import React from "react"
import { Button } from "@blueprintjs/core"
import "./PackageActionButton.css"

export type PackageActionType = "install" | "update" | "remove"

interface PackageActionButtonProps {
  action: PackageActionType
  onClick: (ev?: React.MouseEvent<HTMLElement>) => void
  compact?: boolean
  cover?: boolean
  disabled?: boolean
  style?: React.CSSProperties
}

const actionToIcon: Record<PackageActionType, string> = {
  install: "cloud-download",
  update: "refresh",
  remove: "delete",
}

const actionToLabel: Record<PackageActionType, string> = {
  install: "Install",
  update: "Update",
  remove: "Remove",
}

export const PackageActionButton: React.FC<PackageActionButtonProps> = ({
  action,
  onClick,
  compact = false,
  cover = false,
  disabled = false,
  style,
}) => {
  const className = [
    "pkg-action-btn",
    `pkg-action-${action}`,
    cover ? "pkg-action-cover" : "",
    compact ? "pkg-action-compact" : "",
  ]
    .filter(Boolean)
    .join(" ")

  return (
    <Button
      className={className}
      icon={actionToIcon[action] as any}
      onClick={(ev) => onClick(ev)}
      small={compact}
      disabled={disabled}
      style={style}
    >
      {!compact ? actionToLabel[action] : undefined}
    </Button>
  )
}

export default PackageActionButton
