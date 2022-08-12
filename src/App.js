import './App.css'
import './assets/css/style.scss'
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom"
import { useSelector } from 'react-redux'
import Layout from "./components/layout"
import Login from './module/auth/login'
import Dashboard from "./module/dashboard"
import Book from "./module/book"
import Writer from './module/writer'
import Visitor from './module/visitor'
import Favorite from './module/favorite'


function App() {
  const { token } = useSelector(state => state.user); 

  const PrivateRoute = () => {
    return token ? <Outlet /> : <Navigate to="/login" />;
  }

  const PublicRoute = () => {
    return !token ? <Outlet /> : <Navigate to="/" />;
  }


  
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/login" element={<PublicRoute />}>
            <Route exact path='/login' element={<Login/>}/>
          </Route>
          <Route path="/" element={<PrivateRoute />}>
            <Route exact path='/' element={<Dashboard/>}/>
            <Route path="/book" element={<Book />} />
            <Route path="/writer" element={<Writer />} />
            <Route path="/visitor" element={<Visitor />} />
            <Route path="/favorite" element={<Favorite />} />
          </Route>
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App
