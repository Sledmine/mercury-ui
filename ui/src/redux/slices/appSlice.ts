import { createSlice } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"
import type { RootState } from "../store"
import MercuryPackage, {
  MercuryPackageManifest,
} from "../../types/MercuryPackage"

interface AppState {
  theme: "light" | "dark"
  page: "available" | "installed"
  isLoading: boolean
  errors: string[]
  command: string | null
  latestPackages: MercuryPackageManifest[]
}

const initialState: AppState = {
  theme: "dark",
  page: "available",
  isLoading: false,
  errors: [],
  command: null,
  latestPackages: [],
}

export const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<"light" | "dark">) => ({
      ...state,
      theme: action.payload,
    }),
    setPage: (state, action: PayloadAction<"available" | "installed">) => ({
      ...state,
      page: action.payload,
    }),
    setIsLoading: (state, action: PayloadAction<boolean>) => ({
      ...state,
      isLoading: action.payload,
    }),
    pushError: (state, action: PayloadAction<string>) => ({
      ...state,
      errors: [...state.errors, action.payload],
    }),
    clearErrors: (state) => {
      return { ...state, errors: [] }
    },
    setCommand: (state, action: PayloadAction<string | null>) => ({
      ...state,
      command: action.payload,
    }),
    setLatestPackages: (
      state,
      action: PayloadAction<MercuryPackageManifest[]>
    ) => ({
      ...state,
      latestPackages: action.payload,
    }),
  },
})

export const {
  setTheme,
  setPage,
  setIsLoading,
  pushError,
  clearErrors,
  setCommand,
  setLatestPackages,
} = appSlice.actions
export const selectTheme = (state: RootState) => state.app.theme
export const selectPage = (state: RootState) => state.app.page
export const selectIsLoading = (state: RootState) => state.app.isLoading
export const selectErrors = (state: RootState) => state.app.errors
export const selectCommand = (state: RootState) => state.app.command
export const selectLatestPackages = (state: RootState) =>
  state.app.latestPackages

export default appSlice.reducer
