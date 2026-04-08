import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { init } from "@neutralinojs/lib"
import { Provider } from 'react-redux'
import { store } from "./redux/store"

createRoot(document.getElementById('root')!).render(
    <Provider store={store}>
      <App />
    </Provider>
)

// Verify that Neutralinojs is working
//@ts-ignore
console.log(window.NL_PORT)

// Initialize Neutralinojs client
init()
