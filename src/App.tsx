import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import FileUploadWizard from './components/FileUploadWizard'
import InvoiceManager from './components/InvoiceManager'
import MenuManager from './components/MenuManager'
import Sidebar from './components/Sidebar'
import Home from './pages/Home'
import Reports from './pages/Reports'
import CustomFields from './pages/CustomFields'
import { ThemeProvider } from './context/ThemeContext'
import './App.css'

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="app-container">
          <Sidebar />
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
              <Route path="/reports" element={
                <div className="container mx-auto px-4 py-8 fade-in">
                  <Reports />
                </div>
              } />
              <Route path="/custom-fields" element={
                <div className="container mx-auto px-4 py-8 fade-in">
                  <CustomFields />
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
    </ThemeProvider>
  )
}

export default App
