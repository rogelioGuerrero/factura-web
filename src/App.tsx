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
        <div className="content-wrapper">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/invoices" element={
              <div className="container mx-auto px-4 py-8 fade-in">
                <FileUploadWizard />
              </div>
            } />
            <Route path="/firebase-invoices" element={
              <div className="container mx-auto px-4 py-8 fade-in">
                <InvoiceManager showUploadOnly={true} />
              </div>
            } />
            <Route path="/view-invoices" element={
              <div className="container mx-auto px-4 py-8 fade-in">
                <InvoiceManager showUploadOnly={false} />
              </div>
            } />
            <Route path="/menu-manager" element={
              <div className="container mx-auto px-4 py-8 fade-in">
                <MenuManager />
              </div>
            } />
          </Routes>
        </div>
      </div>
    </Router>
  )
}

export default App
