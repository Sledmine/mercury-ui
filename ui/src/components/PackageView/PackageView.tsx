import React from "react"
import { Card, Button, Tag, Tabs, Tab, Divider } from "@blueprintjs/core"
import { useDispatch, useSelector } from "react-redux"
import { marked } from "marked"
import {
  pushError,
  selectLatestPackages,
  selectTheme,
  setCommand,
  setIsLoading,
} from "../../redux/slices/appSlice"
import MercuryPackage from "../../types/MercuryPackage"
import mercury from "../../mercury"
import "./PackageView.css"

interface PackageViewProps {
  pack: MercuryPackage
  triggerUpdate?: Function
  onBack?: () => void
}

const PackageView: React.FC<PackageViewProps> = ({ pack, triggerUpdate, onBack }) => {
  const dispatch = useDispatch()
  const latestPackages = useSelector(selectLatestPackages)
  const currentTheme = useSelector(selectTheme)
  const latestPackage = latestPackages.find((x) => x.name === pack.name)

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

  const image = pack.image || latestPackage?.image
  const backdropImage = pack.backdropImageUrl || latestPackage?.backdropImageUrl
  const changelog = pack.changelog || latestPackage?.changelog
  const files = pack.files || []

  const decodeHtmlEntities = (input: string) => {
    if (typeof window === "undefined") return input
    const txt = window.document.createElement("textarea")
    txt.innerHTML = input
    return txt.value
  }

  const toMarkdownSource = (value: unknown) => {
    if (!value) return "No changelog available for this package."
    if (Array.isArray(value)) return value.map((x) => String(x)).join("\n")
    if (typeof value === "object") return `\`\`\`json\n${JSON.stringify(value, null, 2)}\n\`\`\``

    const raw = String(value)
    // Some packages wrap markdown text inside HTML tags (<p> / <br>)
    const unwrapped = raw
      .replace(/\r\n/g, "\n")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>\s*<p>/gi, "\n\n")
      .replace(/<\/?p>/gi, "")

    return decodeHtmlEntities(unwrapped).trim()
  }

  const renderChangelogHtml = (value: unknown) => {
    const markdown = toMarkdownSource(value)
    return marked.parse(markdown, {
      gfm: true,
      breaks: true,
    }) as string
  }

  const imageFiles = (pack.files || []).filter((f: any) => {
    return /\.(png|jpe?g|webp|gif)$/i.test(f.path)
  })

  const fileNameFromPath = (path: string) => path.split("/").pop() || path
  const fileIconFromPath = (path: string) => {
    if (/\.(map|yelo)$/i.test(path)) return "map"
    if (/\.(ogg|wav|mp3)$/i.test(path)) return "music"
    if (/\.(txt|md)$/i.test(path)) return "document"
    if (/\.(png|jpe?g|webp|gif)$/i.test(path)) return "media"
    if (/\.(zip|7z|rar|merc|mercu)$/i.test(path)) return "archive"
    return "document-open"
  }

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

      <div className="pv-body-layout" style={{ marginTop: 12 }}>
        <Card className="pv-main-card" style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
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
                <div className="pv-images-grid">
                  {image && (
                    <div className="pv-image-card pv-image-card-cover">
                      <img src={backdropImage || image} alt="backdrop" />
                      <div className="pv-image-overlay">Cover</div>
                    </div>
                  )}
                  {imageFiles.map((f: any, idx: number) => (
                    <div key={idx} className="pv-image-card">
                      <img src={f.path} alt={`img-${idx}`} />
                      <div className="pv-image-overlay">{fileNameFromPath(f.path)}</div>
                    </div>
                  ))}
                </div>
              }
            />
            <Tab
              id="files"
              title={`Files (${files.length})`}
              panel={
                <div className="pv-files-list">
                  {files.map((f: any, i: number) => (
                    <div key={i} className="pv-file-row">
                      <div className="pv-file-main">
                        <span className={`bp6-icon bp6-icon-${fileIconFromPath(f.path)} pv-file-icon`} />
                        <div>
                          <div className="pv-file-name">{fileNameFromPath(f.path)}</div>
                          <div className="pv-file-meta">{f.path}</div>
                        </div>
                      </div>
                      <div className="pv-file-side">{f.type || "file"}</div>
                    </div>
                  ))}
                </div>
              }
            />
            <Tab
              id="changelog"
              title="CHANGELOG"
              panel={
                <div
                  className="package-changelog-markdown"
                  style={{
                    color: currentTheme === "dark" ? "#d7dee7" : "#2b2b2b",
                    lineHeight: 1.5,
                    padding: "6px 8px",
                    borderRadius: 8,
                    background: currentTheme === "dark" ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
                  }}
                >
                  <div
                    dangerouslySetInnerHTML={{ __html: renderChangelogHtml(changelog) }}
                  />
                  <style>{`
                    .package-changelog-markdown h1,
                    .package-changelog-markdown h2,
                    .package-changelog-markdown h3,
                    .package-changelog-markdown h4 {
                      margin: 14px 0 8px;
                      line-height: 1.3;
                      font-weight: 700;
                    }
                    .package-changelog-markdown h1 { font-size: 1.35rem; }
                    .package-changelog-markdown h2 { font-size: 1.15rem; }
                    .package-changelog-markdown h3 { font-size: 1rem; }
                    .package-changelog-markdown p { margin: 8px 0; }
                    .package-changelog-markdown ul,
                    .package-changelog-markdown ol { margin: 8px 0 8px 20px; }
                    .package-changelog-markdown li { margin: 4px 0; }
                    .package-changelog-markdown hr {
                      border: none;
                      height: 1px;
                      margin: 14px 0;
                      background: ${currentTheme === "dark" ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0.15)"};
                    }
                    .package-changelog-markdown a {
                      color: ${currentTheme === "dark" ? "#7ab6ff" : "#106ba3"};
                      text-decoration: none;
                      font-weight: 600;
                    }
                    .package-changelog-markdown a:hover { text-decoration: underline; }
                    .package-changelog-markdown code {
                      font-family: var(--pt-font-family-monospace, ui-monospace, monospace);
                      font-size: 0.9em;
                      padding: 1px 5px;
                      border-radius: 4px;
                      background: ${currentTheme === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"};
                    }
                    .package-changelog-markdown pre {
                      margin: 10px 0;
                      padding: 12px;
                      border-radius: 8px;
                      overflow: auto;
                      background: ${currentTheme === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)"};
                    }
                    .package-changelog-markdown pre code {
                      background: transparent;
                      padding: 0;
                    }
                  `}</style>
                </div>
              }
            />
          </Tabs>
        </div>
        </Card>
        <Card className="pv-side-card" style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
          <div className="pv-side-row">
            <div className="pv-side-label">Version</div>
            <div className="pv-side-value pv-side-value-accent">{pack.version}</div>
          </div>
          <div className="pv-side-divider" />
          <div className="pv-side-row">
            <div className="pv-side-label">Author</div>
            <div className="pv-side-value">{pack.author}</div>
          </div>
          <div className="pv-side-row">
            <div className="pv-side-label">Type</div>
            <div className="pv-side-value">{pack.category}</div>
          </div>
          <div className="pv-side-row">
            <div className="pv-side-label">Files</div>
            <div className="pv-side-value">{files.length}</div>
          </div>
          <div className="pv-side-divider" />
          <div className="pv-side-row">
            <div className="pv-side-label">Changelog</div>
            <div className="pv-side-value">{changelog ? "Available" : "Not available"}</div>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default PackageView
