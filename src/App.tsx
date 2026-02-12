import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/layout'
import {
  HomePage,
  ArchitecturePage,
  MessageFlowPage,
  MultiAgentDemoPage,
  CodeExamplesPage,
  DashboardPage,
  TranscriptPage,
  DiagramTestPage,
} from './pages'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="architecture" element={<ArchitecturePage />} />
          <Route path="message-flow" element={<MessageFlowPage />} />
          <Route path="multi-agent" element={<MultiAgentDemoPage />} />
          <Route path="code-examples" element={<CodeExamplesPage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="transcript" element={<TranscriptPage />} />
          <Route path="diagram-test" element={<DiagramTestPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
