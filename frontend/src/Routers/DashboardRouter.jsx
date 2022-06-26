import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Navbar from '../Components/Navbar'

export default () => (
    <>
        <Navbar />
        <Routes>
            <Route path={'/'} element={<a>Home Page</a>} />
        </Routes>
    </>
);