import { InterfaceGenerator } from './components/InterfaceGenerator'
import './index.css'
import './App.css'

function App() {
  return (
    <div className="interfacegen:min-h-screen interfacegen:bg-white interfacegen:dark:bg-gray-900 interfacegen:text-gray-900 interfacegen:dark:text-gray-100">
      <InterfaceGenerator />
    </div>
  )
}

export default App