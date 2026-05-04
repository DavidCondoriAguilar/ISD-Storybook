import { BrowserRouter } from 'react-router-dom'
import { NotificationProvider } from './context/NotificationContext'
import { Layout } from './components/layout/Layout'
import ErrorBoundary from './shared/components/ErrorBoundary'

function App() {
  return (
    <BrowserRouter>
      <NotificationProvider>
        <ErrorBoundary name="App Principal">
          <Layout />
        </ErrorBoundary>
      </NotificationProvider>
    </BrowserRouter>
  )
}

export default App
