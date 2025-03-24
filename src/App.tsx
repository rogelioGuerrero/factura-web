import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import FileUploadWizard from './components/FileUploadWizard'
import InvoiceManager from './components/InvoiceManager'
import MenuManager from './components/MenuManager'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import './App.css'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/invoices" element={
            <div className="container mx-auto px-4 py-8">
              <FileUploadWizard />
            </div>
          } />
          <Route path="/firebase-invoices" element={
            <div className="container mx-auto px-4 py-8">
              <InvoiceManager showUploadOnly={true} />
            </div>
          } />
          <Route path="/view-invoices" element={
            <div className="container mx-auto px-4 py-8">
              <InvoiceManager showUploadOnly={false} />
            </div>
          } />
          <Route path="/menu-manager" element={
            <div className="container mx-auto px-4 py-8">
              <MenuManager />
            </div>
          } />
        </Routes>
      </div>
    </Router>
  )
}

export default App
