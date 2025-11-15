import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/login/Login'
import Home from './pages/Home/Home'
import Landing from './pages/Landing/Landing'
import SignUp from './pages/signup/SignUp'
import PatientHomePage from './pages/Patient/Patient'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-900 transition-colors duration-300">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/home" element={<Home />} />
          <Route path="/patient" element={<PatientHomePage/>} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
