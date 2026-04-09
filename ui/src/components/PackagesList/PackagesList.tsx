import React from "react"
import { Button, Card, Tag, InputGroup } from "@blueprintjs/core"
import { Icon } from "@blueprintjs/core"
import { useDispatch, useSelector } from "react-redux"
import {
  pushError,
  selectLatestPackages,
  selectTheme,
  setCommand,
  setIsLoading,
} from "../../redux/slices/appSlice"
import MercuryPackage from "../../types/MercuryPackage"
import mercury from "../../mercury"
import "./PackagesList.css"

interface PackageListProps {
  packages?: MercuryPackage[]
  triggerUpdate?: Function
  onSelectPackage?: (pack: MercuryPackage) => void
  selectedPackageLabel?: string | undefined
  collapsed?: boolean
}

export const PackagesList: React.FC<PackageListProps> = ({
  packages = [],
  triggerUpdate,
  onSelectPackage,
  selectedPackageLabel,
  collapsed = false,
}) => {
  const currentTheme = useSelector(selectTheme)
  const [searchTerm, setSearchTerm] = React.useState("")
  const dispatch = useDispatch()
  const latestPackages = useSelector(selectLatestPackages)

  const install = async (label: string) => {
    dispatch(setCommand(`mercury install ${label}`))
  }

  const updateByCLI = async (label: string) => {
    try {
      dispatch(setIsLoading(true))
      const { isUpdated, stdOut } = await mercury.update(label)
      dispatch(setIsLoading(false))
      if (!isUpdated) {
        dispatch(pushError(stdOut))
      } else {
        if (triggerUpdate) {
          triggerUpdate()
        }
      }
    } catch (error) {
      dispatch(setIsLoading(false))
      //@ts-ignore
      dispatch(pushError(error.message))
      console.error(error)
    }
  }

  const update = async (label: string) => {
    dispatch(setCommand(`mercury update ${label}`))
  }

  const remove = async (label: string) => {
    try {
      dispatch(setIsLoading(true))
      const { isRemoved, stdOut } = await mercury.remove(label)
      dispatch(setIsLoading(false))
      if (!isRemoved) {
        dispatch(pushError(stdOut))
      } else {
        if (triggerUpdate) {
          triggerUpdate()
        }
      }
    } catch (error) {
      dispatch(setIsLoading(false))
      //@ts-ignore
      dispatch(pushError(error.message))
      console.error(error)
    }
  }

  const isPackageUpdatable = (pack: MercuryPackage) => {
    const latestPackage = latestPackages.find((p) => p.name === pack.name)
    if (!latestPackage) {
      return false
    }
    return latestPackage.version > pack.version
  }

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ position: "sticky", top: 50, zIndex: 5, paddingRight: collapsed ? 6 : 0 }}>
        <InputGroup
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value.toLowerCase())
          }}
          leftIcon="search"
          placeholder="Search packages..."
          large
          style={{
            backgroundColor: currentTheme === "dark" ? "#1f2329" : undefined,
            display: collapsed ? "none" : undefined,
          }}
        />
      </div>

      <div style={{ flex: 1, width: "100%", overflowY: "auto", paddingTop: 8 }}>
        {packages
          .filter((pack) => {
            return pack.name.toLowerCase().includes(searchTerm)
          })
          .map((pack) => (
            <Card
              key={pack.name}
              style={{
                cursor: "pointer",
                border:
                  selectedPackageLabel && selectedPackageLabel === pack.label
                    ? "2px solid #137cbd"
                    : undefined,
                marginBottom: 12,
                display: "flex",
                alignItems: "center",
                padding: collapsed ? "8px" : undefined,
              }}
              onClick={() => {
                if (onSelectPackage) onSelectPackage(pack)
              }}
            >
              <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
                <div style={{ width: collapsed ? 48 : 128, height: collapsed ? 48 : 128, backgroundImage: `url(${pack.image || latestPackages.find((p) => p.name === pack.name)?.image})`, backgroundSize: "cover", backgroundPosition: "center", borderRadius: 6, boxShadow: "0px 0px 10px rgba(0,0,0,0.6)", marginRight: collapsed ? 6 : 20 }} />
                {!collapsed && (
                  <div style={{ flex: 1 }}>
                    <h2 style={{ margin: 0 }}>
                      <a href="#" onClick={(e) => { e.preventDefault(); if (onSelectPackage) onSelectPackage(pack) }}>{pack.name}</a>{' '}{pack.category && <Tag>{pack.category}</Tag>}
                    </h2>
                    <h4 style={{ margin: '6px 0' }}>{pack.version} • {pack.author}</h4>
                    <p style={{ marginTop: 6 }}>{pack.description}</p>
                    <div style={{ marginTop: 8 }}>
                      {pack.mirrors && <Button icon="cloud-download" intent="primary" onClick={(ev) => { ev.stopPropagation(); install(pack.label) }}>Install</Button>}
                      {pack.files && isPackageUpdatable(pack) && <Button intent="success" icon="refresh" onClick={(ev) => { ev.stopPropagation(); update(pack.label) }} style={{ marginLeft: 8 }}>Update</Button>}
                      {pack.files && <Button intent="danger" icon="delete" onClick={(ev) => { ev.stopPropagation(); remove(pack.label) }} style={{ marginLeft: 8 }}>Remove</Button>}
                    </div>
                  </div>
                )}
                {collapsed && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {pack.mirrors && <Button small minimal icon="cloud-download" onClick={(ev) => { ev.stopPropagation(); install(pack.label) }} />}
                    {pack.files && isPackageUpdatable(pack) && <Button small minimal icon="refresh" onClick={(ev) => { ev.stopPropagation(); update(pack.label) }} />}
                    {pack.files && <Button small minimal icon="delete" onClick={(ev) => { ev.stopPropagation(); remove(pack.label) }} />}
                  </div>
                )}
              </div>
            </Card>
          ))}
      </div>
    </div>
  )
}

export default PackagesList
