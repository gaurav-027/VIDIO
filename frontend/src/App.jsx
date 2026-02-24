import {BrowserRouter as Router,Routes,Route} from 'react-router-dom'
import LandingPage from './pages/Landing.jsx'
import Authentication from './pages/Authentication.jsx'
import { AuthProvider } from './contexts/Authcontext.jsx'
import VideoMeet from './pages/VideoMeet.jsx'
import Home from './pages/Home.jsx'
import Profile from './pages/Profile.jsx'
import NotFound from './pages/NotFound.jsx'
import History from './pages/History.jsx'

function App() {

  return (
    <>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path='/' element={<LandingPage/>}/>
            <Route path='/profile' element={<Profile/>}/>
            <Route path='/home' element={<Home/>}/>
            <Route path='/auth' element={<Authentication/>}/>
            <Route path='/meet/:roomId' element={<VideoMeet/>}/>
            <Route path='/callHistory' element={<History/>}/>
            <Route path='*' element={<NotFound/>}/>
           </Routes>
        </AuthProvider>
      </Router>
    </>
  )
}

export default App
