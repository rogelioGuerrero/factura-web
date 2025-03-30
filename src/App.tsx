import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import FileUploadWizard from './modules/upload/components/FileUploadWizard'
import MenuManager from '@/modules/layout/menu/components/MenuManager'
// import Sidebar from './modules/layout/sidebar/components/Sidebar'
// import MainNavigation from './modules/layout/navigation/components/MainNavigation'
import HomeButton from './modules/layout/navigation/components/HomeButton'
import Home from './pages/Home'
import Reports from './pages/Reports'
import CustomFields from './pages/CustomFields'
import { ThemeProvider } from './context/ThemeContext'
import { FieldsProvider } from './modules/fields/contexts/FieldsContext'
import { ViewSelector } from './modules/invoices/views'
import './App.css'

// Componente que renderiza el HomeButton solo cuando no estamos en la página principal
const HomeButtonWrapper = () => {
  const location = useLocation();
  
  // No mostrar el botón en la página principal
  if (location.pathname === '/') {
    return null;
  }
  
  return <HomeButton />;
};

function App() {
  return (
    <ThemeProvider>
      <FieldsProvider>
        <Router>
          <div className="app-container">
            {/* Sidebar eliminado */}
            <div className="content-wrapper full-width">
              {/* MainNavigation deshabilitado */}
              <HomeButtonWrapper />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/invoices" element={
                  <div className="container mx-auto px-4 py-8 fade-in">
                    <FileUploadWizard />
                  </div>
                } />
                <Route path="/firebase-invoices" element={
                  <div className="container mx-auto px-4 py-8 fade-in">
                    <ViewSelector />
                  </div>
                } />
                <Route path="/view-invoices" element={
                  <div className="container mx-auto px-4 py-8 fade-in">
                    <ViewSelector />
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
      </FieldsProvider>
    </ThemeProvider>
  )
}

export default App
