import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Landing from './pages/Landing'; // Assuming this is your landing page component
import Login from './pages/Login'; // Your refactored Login 
import Home from './pages/Home';
import JobPost from './pages/jobPost';
import Messages from './pages/Messages'

const App = () => {
    return (
        <Router>
            <Routes>
                {/* Define the routes for your pages */}
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/home" element={<Home/>} />
                <Route path='/job-post' element={<JobPost/>} />
                <Route path='/messages' element={<Messages/>}/>
            </Routes>
        </Router>
    );
};

export default App;
