import { NotificationProvider } from './context/NotificationContext'
import { Layout } from './components/layout/Layout'

function App() {
  return (
    <NotificationProvider>
      <Layout />
    </NotificationProvider>
  )
}

export default App
