var Neutralino = (function (e) {
  "use strict";
  function t(e, t, n, o) {
    return new (n || (n = Promise))(function (i, r) {
      function s(e) {
        try {
          u(o.next(e));
        } catch (e) {
          r(e);
        }
      }
      function a(e) {
        try {
          u(o.throw(e));
        } catch (e) {
          r(e);
        }
      }
      function u(e) {
        var t;
        e.done
          ? i(e.value)
          : ((t = e.value),
            t instanceof n
              ? t
              : new n(function (e) {
                  e(t);
                })).then(s, a);
      }
      u((o = o.apply(e, t || [])).next());
    });
  }
  function n() {
    return l("extensions.getStats");
  }
  var o = {
    __proto__: null,
    dispatch: function (e, o, i) {
      return new Promise((r, s) =>
        t(this, void 0, void 0, function* () {
          let t = yield n();
          if (t.loaded.includes(e))
            if (t.connected.includes(e))
              try {
                let t = yield l("extensions.dispatch", {
                  extensionId: e,
                  event: o,
                  data: i,
                });
                r(t);
              } catch (e) {
                s(e);
              }
            else
              !(function (e, t) {
                e in c ? c[e].push(t) : (c[e] = [t]);
              })(e, {
                method: "extensions.dispatch",
                data: { extensionId: e, event: o, data: i },
                resolve: r,
                reject: s,
              });
          else s({ code: "NE_EX_EXTNOTL", message: `${e} is not loaded` });
        })
      );
    },
    broadcast: function (e, t) {
      return l("extensions.broadcast", { event: e, data: t });
    },
    getStats: n,
  };
  function i(e, t) {
    return (
      window.addEventListener(e, t),
      Promise.resolve({ success: !0, message: "Event listener added" })
    );
  }
  function r(e, t) {
    let n = new CustomEvent(e, { detail: t });
    return (
      window.dispatchEvent(n),
      Promise.resolve({ success: !0, message: "Message dispatched" })
    );
  }
  let s,
    a = {},
    u = [],
    c = {};
  function d() {
    console.log(window.NL_TOKEN)
    window.NL_TOKEN && sessionStorage.setItem("NL_TOKEN", window.NL_TOKEN),
      (s = new WebSocket(`ws://${window.location.hostname}:${window.NL_PORT}`)),
      (function () {
        if (
          (i("ready", () =>
            t(this, void 0, void 0, function* () {
              if ((yield f(u), !window.NL_EXTENABLED)) return;
              let e = yield n();
              for (let t of e.connected) r("extensionReady", t);
            })
          ),
          i("extClientConnect", (e) => {
            r("extensionReady", e.detail);
          }),
          !window.NL_EXTENABLED)
        )
          return;
        i("extensionReady", (e) =>
          t(this, void 0, void 0, function* () {
            e.detail in c && (yield f(c[e.detail]), delete c[e.detail]);
          })
        );
      })(),
      (function () {
        s.addEventListener("message", (e) => {
          var t, n;
          const o = JSON.parse(e.data);
          o.id && o.id in a
            ? ((null === (t = o.data) || void 0 === t ? void 0 : t.error)
                ? (a[o.id].reject(o.data.error),
                  "NE_RT_INVTOKN" == o.data.error.code &&
                    (s.close(),
                    (document.body.innerText = ""),
                    document.write(
                      "<code>NE_RT_INVTOKN</code>: Neutralinojs application configuration prevents accepting native calls from this client."
                    )))
                : (null === (n = o.data) || void 0 === n
                    ? void 0
                    : n.success) &&
                  a[o.id].resolve(
                    o.data.hasOwnProperty("returnValue")
                      ? o.data.returnValue
                      : o.data
                  ),
              delete a[o.id])
            : o.event && r(o.event, o.data);
        }),
          s.addEventListener("open", (e) =>
            t(this, void 0, void 0, function* () {
              r("ready");
            })
          ),
          s.addEventListener("close", (e) =>
            t(this, void 0, void 0, function* () {
              r("serverOffline", {
                code: "NE_CL_NSEROFF",
                message:
                  "Neutralino server is offline. Try restarting the application",
              });
            })
          );
      })();
  }
  function l(e, t) {
    return new Promise((n, o) => {
      if ((null == s ? void 0 : s.readyState) != WebSocket.OPEN)
        return (
          (i = { method: e, data: t, resolve: n, reject: o }), void u.push(i)
        );
      var i;
      const r = "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (e) =>
          (
            e ^
            (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (e / 4)))
          ).toString(16)
        ),
        c = window.NL_TOKEN || sessionStorage.getItem("NL_TOKEN") || "";
      (a[r] = { resolve: n, reject: o }),
        s.send(JSON.stringify({ id: r, method: e, data: t, accessToken: c }));
    });
  }
  function f(e) {
    return t(this, void 0, void 0, function* () {
      for (; e.length > 0; ) {
        let t = e.shift();
        try {
          let e = yield l(t.method, t.data);
          t.resolve(e);
        } catch (e) {
          t.reject(e);
        }
      }
    });
  }
  function p(e, t) {
    return l("filesystem.writeBinaryFile", { path: e, data: g(t) });
  }
  function g(e) {
    let t = new Uint8Array(e),
      n = "";
    for (let e of t) n += String.fromCharCode(e);
    return window.btoa(n);
  }
  var w,
    m,
    v = {
      __proto__: null,
      createDirectory: function (e) {
        return l("filesystem.createDirectory", { path: e });
      },
      removeDirectory: function (e) {
        return l("filesystem.removeDirectory", { path: e });
      },
      writeFile: function (e, t) {
        return l("filesystem.writeFile", { path: e, data: t });
      },
      appendFile: function (e, t) {
        return l("filesystem.appendFile", { path: e, data: t });
      },
      writeBinaryFile: p,
      appendBinaryFile: function (e, t) {
        return l("filesystem.appendBinaryFile", { path: e, data: g(t) });
      },
      readFile: function (e, t) {
        return l("filesystem.readFile", Object.assign({ path: e }, t));
      },
      readBinaryFile: function (e, t) {
        return new Promise((n, o) => {
          l("filesystem.readBinaryFile", Object.assign({ path: e }, t))
            .then((e) => {
              let t = window.atob(e),
                o = t.length,
                i = new Uint8Array(o);
              for (let e = 0; e < o; e++) i[e] = t.charCodeAt(e);
              n(i.buffer);
            })
            .catch((e) => {
              o(e);
            });
        });
      },
      openFile: function (e) {
        return l("filesystem.openFile", { path: e });
      },
      updateOpenedFile: function (e, t, n) {
        return l("filesystem.updateOpenedFile", { id: e, event: t, data: n });
      },
      getOpenedFileInfo: function (e) {
        return l("filesystem.getOpenedFileInfo", { id: e });
      },
      removeFile: function (e) {
        return l("filesystem.removeFile", { path: e });
      },
      readDirectory: function (e) {
        return l("filesystem.readDirectory", { path: e });
      },
      copyFile: function (e, t) {
        return l("filesystem.copyFile", { source: e, destination: t });
      },
      moveFile: function (e, t) {
        return l("filesystem.moveFile", { source: e, destination: t });
      },
      getStats: function (e) {
        return l("filesystem.getStats", { path: e });
      },
    };
  function _(e, t) {
    return l("os.execCommand", Object.assign({ command: e }, t));
  }
  !(function (e) {
    (e.WARNING = "WARNING"),
      (e.ERROR = "ERROR"),
      (e.INFO = "INFO"),
      (e.QUESTION = "QUESTION");
  })(w || (w = {})),
    (function (e) {
      (e.OK = "OK"),
        (e.OK_CANCEL = "OK_CANCEL"),
        (e.YES_NO = "YES_NO"),
        (e.YES_NO_CANCEL = "YES_NO_CANCEL"),
        (e.RETRY_CANCEL = "RETRY_CANCEL"),
        (e.ABORT_RETRY_IGNORE = "ABORT_RETRY_IGNORE");
    })(m || (m = {}));
  var h = {
    __proto__: null,
    get Icon() {
      return w;
    },
    get MessageBoxChoice() {
      return m;
    },
    execCommand: _,
    spawnProcess: function (e) {
      return l("os.spawnProcess", { command: e });
    },
    updateSpawnedProcess: function (e, t, n) {
      return l("os.updateSpawnedProcess", { id: e, event: t, data: n });
    },
    getSpawnedProcesses: function () {
      return l("os.getSpawnedProcesses");
    },
    getEnv: function (e) {
      return l("os.getEnv", { key: e });
    },
    getEnvs: function () {
      return l("os.getEnvs");
    },
    showOpenDialog: function (e, t) {
      return l("os.showOpenDialog", Object.assign({ title: e }, t));
    },
    showFolderDialog: function (e, t) {
      return l("os.showFolderDialog", Object.assign({ title: e }, t));
    },
    showSaveDialog: function (e, t) {
      return l("os.showSaveDialog", Object.assign({ title: e }, t));
    },
    showNotification: function (e, t, n) {
      return l("os.showNotification", { title: e, content: t, icon: n });
    },
    showMessageBox: function (e, t, n, o) {
      return l("os.showMessageBox", {
        title: e,
        content: t,
        choice: n,
        icon: o,
      });
    },
    setTray: function (e) {
      return l("os.setTray", e);
    },
    open: function (e) {
      return l("os.open", { url: e });
    },
    getPath: function (e) {
      return l("os.getPath", { name: e });
    },
  };
  var y = {
    __proto__: null,
    getMemoryInfo: function () {
      return l("computer.getMemoryInfo");
    },
    getArch: function () {
      return l("computer.getArch");
    },
    getKernelInfo: function () {
      return l("computer.getKernelInfo");
    },
    getOSInfo: function () {
      return l("computer.getOSInfo");
    },
    getCPUInfo: function () {
      return l("computer.getCPUInfo");
    },
    getDisplays: function () {
      return l("computer.getDisplays");
    },
    getMousePosition: function () {
      return l("computer.getMousePosition");
    },
  };
  var N,
    E = {
      __proto__: null,
      setData: function (e, t) {
        return l("storage.setData", { key: e, data: t });
      },
      getData: function (e) {
        return l("storage.getData", { key: e });
      },
      getKeys: function () {
        return l("storage.getKeys");
      },
    };
  function O(e, t) {
    return l("debug.log", { message: e, type: t });
  }
  !(function (e) {
    (e.WARNING = "WARNING"), (e.ERROR = "ERROR"), (e.INFO = "INFO");
  })(N || (N = {}));
  var R = {
    __proto__: null,
    get LoggerType() {
      return N;
    },
    log: O,
  };
  function T(e) {
    return l("app.exit", { code: e });
  }
  var b = {
    __proto__: null,
    exit: T,
    killProcess: function () {
      return l("app.killProcess");
    },
    restartProcess: function (e) {
      return new Promise((n) =>
        t(this, void 0, void 0, function* () {
          let t = window.NL_ARGS.reduce((e, t) => (e += " " + t), "");
          (null == e ? void 0 : e.args) && (t += " " + e.args),
            yield _(t, { background: !0 }),
            T(),
            n();
        })
      );
    },
    getConfig: function () {
      return l("app.getConfig");
    },
    broadcast: function (e, t) {
      return l("app.broadcast", { event: e, data: t });
    },
  };
  const P = new WeakMap();
  function S(e, t) {
    return l("window.move", { x: e, y: t });
  }
  function D() {
    return l("window.getSize");
  }
  var L = {
    __proto__: null,
    setTitle: function (e) {
      return l("window.setTitle", { title: e });
    },
    getTitle: function () {
      return l("window.getTitle");
    },
    maximize: function () {
      return l("window.maximize");
    },
    unmaximize: function () {
      return l("window.unmaximize");
    },
    isMaximized: function () {
      return l("window.isMaximized");
    },
    minimize: function () {
      return l("window.minimize");
    },
    setFullScreen: function () {
      return l("window.setFullScreen");
    },
    exitFullScreen: function () {
      return l("window.exitFullScreen");
    },
    isFullScreen: function () {
      return l("window.isFullScreen");
    },
    show: function () {
      return l("window.show");
    },
    hide: function () {
      return l("window.hide");
    },
    isVisible: function () {
      return l("window.isVisible");
    },
    focus: function () {
      return l("window.focus");
    },
    setIcon: function (e) {
      return l("window.setIcon", { icon: e });
    },
    move: S,
    setDraggableRegion: function (e) {
      return new Promise((n, o) => {
        const i = e instanceof Element ? e : document.getElementById(e);
        let r = 0,
          s = 0;
        if (!i)
          return o({
            code: "NE_WD_DOMNOTF",
            message: "Unable to find DOM element",
          });
        if (P.has(i))
          return o({
            code: "NE_WD_ALRDREL",
            message: "This DOM element is already an active draggable region",
          });
        function a(e) {
          return t(this, void 0, void 0, function* () {
            yield S(e.screenX - r, e.screenY - s);
          });
        }
        function u(e) {
          0 === e.button &&
            ((r = e.clientX),
            (s = e.clientY),
            i.addEventListener("pointermove", a),
            i.setPointerCapture(e.pointerId));
        }
        function c(e) {
          i.removeEventListener("pointermove", a),
            i.releasePointerCapture(e.pointerId);
        }
        i.addEventListener("pointerdown", u),
          i.addEventListener("pointerup", c),
          P.set(i, { pointerdown: u, pointerup: c }),
          n({ success: !0, message: "Draggable region was activated" });
      });
    },
    unsetDraggableRegion: function (e) {
      return new Promise((t, n) => {
        const o = e instanceof Element ? e : document.getElementById(e);
        if (!o)
          return n({
            code: "NE_WD_DOMNOTF",
            message: "Unable to find DOM element",
          });
        if (!P.has(o))
          return n({
            code: "NE_WD_NOTDRRE",
            message: "DOM element is not an active draggable region",
          });
        const { pointerdown: i, pointerup: r } = P.get(o);
        o.removeEventListener("pointerdown", i),
          o.removeEventListener("pointerup", r),
          P.delete(o),
          t({ success: !0, message: "Draggable region was deactivated" });
      });
    },
    setSize: function (e) {
      return new Promise((n, o) =>
        t(this, void 0, void 0, function* () {
          let t = yield D();
          l("window.setSize", (e = Object.assign(Object.assign({}, t), e)))
            .then((e) => {
              n(e);
            })
            .catch((e) => {
              o(e);
            });
        })
      );
    },
    getSize: D,
    getPosition: function () {
      return l("window.getPosition");
    },
    setAlwaysOnTop: function (e) {
      return l("window.setAlwaysOnTop", { onTop: e });
    },
    create: function (e, t) {
      return new Promise((n, o) => {
        function i(e) {
          return (
            "string" != typeof e ||
              ((e = e.trim()).includes(" ") && (e = `"${e}"`)),
            e
          );
        }
        let r = window.NL_ARGS.reduce(
          (e, t, n) => (
            (t.includes("--path=") ||
              t.includes("--debug-mode") ||
              t.includes("--load-dir-res") ||
              0 == n) &&
              (e += " " + i(t)),
            e
          ),
          ""
        );
        r += " --url=" + i(e);
        for (let e in t) {
          if ("processArgs" == e) continue;
          r += ` --window${e.replace(
            /[A-Z]|^[a-z]/g,
            (e) => "-" + e.toLowerCase()
          )}=${i(t[e])}`;
        }
        t && t.processArgs && (r += " " + t.processArgs),
          _(r, { background: !0 })
            .then((e) => {
              n(e);
            })
            .catch((e) => {
              o(e);
            });
      });
    },
  };
  var I = {
    __proto__: null,
    broadcast: function (e, t) {
      return l("events.broadcast", { event: e, data: t });
    },
    on: i,
    off: function (e, t) {
      return (
        window.removeEventListener(e, t),
        Promise.resolve({ success: !0, message: "Event listener removed" })
      );
    },
    dispatch: r,
  };
  let F = null;
  var C = {
    __proto__: null,
    checkForUpdates: function (e) {
      return new Promise((n, o) =>
        t(this, void 0, void 0, function* () {
          if (!e)
            return o({
              code: "NE_RT_NATRTER",
              message: "Missing require parameter: url",
            });
          try {
            let t = yield fetch(e);
            (F = JSON.parse(yield t.text())),
              !(function (e) {
                return !!(
                  e.applicationId &&
                  e.applicationId == window.NL_APPID &&
                  e.version &&
                  e.resourcesURL
                );
              })(F)
                ? o({
                    code: "NE_UP_CUPDMER",
                    message:
                      "Invalid update manifest or mismatching applicationId",
                  })
                : n(F);
          } catch (e) {
            o({
              code: "NE_UP_CUPDERR",
              message: "Unable to fetch update manifest",
            });
          }
        })
      );
    },
    install: function () {
      return new Promise((e, n) =>
        t(this, void 0, void 0, function* () {
          if (!F)
            return n({
              code: "NE_UP_UPDNOUF",
              message: "No update manifest loaded",
            });
          try {
            let t = yield fetch(F.resourcesURL),
              n = yield t.arrayBuffer();
            yield p(window.NL_PATH + "/resources.neu", n),
              e({
                success: !0,
                message: "Update installed. Restart the process to see updates",
              });
          } catch (e) {
            n({ code: "NE_UP_UPDINER", message: "Update installation error" });
          }
        })
      );
    },
  };
  var x = {
    __proto__: null,
    readText: function (e, t) {
      return l("clipboard.readText", { key: e, data: t });
    },
    writeText: function (e) {
      return l("clipboard.writeText", { data: e });
    },
  };
  var A = {
    __proto__: null,
    getMethods: function () {
      return l("custom.getMethods");
    },
  };
  let M = !1;
  return (
    (e.app = b),
    (e.clipboard = x),
    (e.computer = y),
    (e.custom = A),
    (e.debug = R),
    (e.events = I),
    (e.extensions = o),
    (e.filesystem = v),
    (e.init = function (e = {}) {
      if (((e = Object.assign({ exportCustomMethods: !0 }, e)), !M)) {
        if (
          (d(),
          window.NL_ARGS.find((e) => "--neu-dev-auto-reload" == e) &&
            i("neuDev_reloadApp", () =>
              t(this, void 0, void 0, function* () {
                yield O("Reloading the application..."), location.reload();
              })
            ),
          e.exportCustomMethods &&
            window.NL_CMETHODS &&
            window.NL_CMETHODS.length > 0)
        )
          for (let e of window.NL_CMETHODS)
            Neutralino.custom[e] = (...t) => {
              let n = {};
              for (let [e, o] of t.entries())
                n =
                  "object" != typeof o || Array.isArray(o) || null == o
                    ? Object.assign(Object.assign({}, n), { ["arg" + e]: o })
                    : Object.assign(Object.assign({}, n), o);
              return l("custom." + e, n);
            };
        (window.NL_CVERSION = "3.8.2"),
          (window.NL_CCOMMIT = "2fe7fd9b765aeaffb95eaa5b662b890508a57af3"),
          (M = !0);
      }
    }),
    (e.os = h),
    (e.storage = E),
    (e.updater = C),
    (e.window = L),
    e
  );
})({});
