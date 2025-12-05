import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Verify from './pages/Verify'
import NotFound from './pages/NotFound'
import Layout from './components/Layout'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/verify/:certificateId?" element={<Verify />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  )
}

export default App
