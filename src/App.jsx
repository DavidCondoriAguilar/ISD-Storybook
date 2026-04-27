import { BrowserRouter } from 'react-router-dom'
import { NotificationProvider } from './context/NotificationContext'
import { Layout } from './components/layout/Layout'

function App() {
  return (
    <BrowserRouter>
      <NotificationProvider>
        <Layout />
      </NotificationProvider>
    </BrowserRouter>
  )
}

export default App
