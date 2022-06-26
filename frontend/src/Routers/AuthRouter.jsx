import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Login from '../Pages/Login';
//import Register from '../Pages/Register';

export default () => (
    <Routes>
        <Route path={'/login'} element={<Login />} />
        <Route path={'/register'} element={<a />} />
    </Routes>
);