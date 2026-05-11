import { HashRouter } from 'react-router-dom'
import { NotificationProvider } from './context/NotificationContext'
import { Layout } from './components/layout/Layout'
import ErrorBoundary from './shared/components/ErrorBoundary'

function App() {
  return (
    <HashRouter>
      <NotificationProvider>
        <ErrorBoundary name="App Principal">
          <Layout />
        </ErrorBoundary>
      </NotificationProvider>
    </HashRouter>
  )
}

export default App
