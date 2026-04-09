import React from "react"
import { Card, Button, Tag, Tabs, Tab, Divider } from "@blueprintjs/core"
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

interface PackageViewProps {
  pack: MercuryPackage
  triggerUpdate?: Function
  onBack?: () => void
}

const PackageView: React.FC<PackageViewProps> = ({ pack, triggerUpdate, onBack }) => {
  const dispatch = useDispatch()
  const latestPackages = useSelector(selectLatestPackages)
  const currentTheme = useSelector(selectTheme)

  const handleBack = () => {
    if (onBack) onBack()
  }

  const isPackageUpdatable = (p: MercuryPackage) => {
    const latestPackage = latestPackages.find((x) => x.name === p.name)
    if (!latestPackage) return false
    return latestPackage.version > p.version
  }

  const install = async (label: string) => {
    dispatch(setCommand(`mercury install ${label}`))
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
        if (triggerUpdate) triggerUpdate()
      }
    } catch (error) {
      dispatch(setIsLoading(false))
      //@ts-ignore
      dispatch(pushError(error.message))
    }
  }

  const image = pack.image || latestPackages.find((p) => p.name === pack.name)?.image
  const backdropImage = pack.backdropImageUrl || latestPackages.find((p) => p.name === pack.name)?.backdropImageUrl

  const imageFiles = (pack.files || []).filter((f: any) => {
    return /\.(png|jpe?g|webp|gif)$/i.test(f.path)
  })

  return (
    <div>
      {/* Back button to return to package list */}
      <div style={{ marginBottom: 2 }}>
        {onBack && (
          <button className="bp4-button bp4-minimal" onClick={handleBack}>
            <span className="bp4-icon bp4-icon-arrow-left" /> Back
          </button>
        )}
      </div>
      <div
        style={{
          height: 220,
          borderRadius: 8,
          backgroundImage: `linear-gradient(rgba(0,0,0,0.45), rgba(0, 0, 0, 0.753)), url(${image})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          color: "white",
          display: "flex",
          alignItems: "flex-end",
          padding: 20,
          boxShadow: "0 6px 18px rgba(0,0,0,0.4)",
        }}
      >
        <div style={{ display: "flex", gap: 18, alignItems: "end" }}>
          <div
            style={{
              width: 160,
              height: 160,
              borderRadius: 6,
              backgroundImage: `url(${image})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              boxShadow: "0 4px 12px rgba(0,0,0,0.6)",
              border: "1px solid rgba(100, 100, 100, 0.836)",
            }}
          />
          <div>
            <h2 style={{ margin: 0 }}>{pack.name}</h2>
            <div style={{ marginTop: 6, gap: 8, display: "flex", flexWrap: "wrap" }}>
              <Tag intent="primary">{pack.category}</Tag>
              <Tag intent="success">v{pack.version}</Tag>
              <Tag intent="none">{pack.author}</Tag>
            </div>
          </div>
        </div>
      </div>

      <Card style={{ marginTop: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 style={{ margin: 0 }}>{pack.description}</h3>
            <p style={{ color: currentTheme === "dark" ? "#cfd8e3" : "#444" }}>{pack.author}</p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {pack.mirrors && (
              <Button intent="primary" icon="cloud-download" onClick={() => install(pack.label)}>
                Install
              </Button>
            )}
            {pack.files && isPackageUpdatable(pack) && (
              <Button intent="warning" icon="refresh" onClick={() => update(pack.label)}>
                Update
              </Button>
            )}
            {pack.files && (
              <Button intent="danger" icon="delete" onClick={() => remove(pack.label)}>
                Remove
              </Button>
            )}
          </div>
        </div>
        <Divider style={{ margin: "12px 0" }} />
        <div style={{ marginTop: 12 }}>
          <Tabs id="package-tabs">
            <Tab id="overview" title="Overview" panel={<div>{pack.description}</div>} />
            <Tab
              id="images"
              title={`Images (${imageFiles.length + (image ? 1 : 0)})`}
              panel={
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {image && (
                    <img src={backdropImage || image} style={{ maxWidth: 320, borderRadius: 6 }} alt="backdrop" />
                  )}
                  {imageFiles.map((f: any, idx: number) => (
                    <img key={idx} src={f.path} style={{ width: 180, borderRadius: 6 }} alt={`img-${idx}`} />
                  ))}
                </div>
              }
            />
            <Tab
              id="files"
              title={`Files (${(pack.files || []).length})`}
              panel={<div><ul>{(pack.files || []).map((f: any, i: number) => (<li key={i}>{f.path}</li>))}</ul></div>}
            />
          </Tabs>
        </div>
      </Card>
    </div>
  )
}

export default PackageView
