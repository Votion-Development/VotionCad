import { useNavigate } from 'react-router-dom';
import { Link } from "react-router-dom"
import React, { useState, useEffect } from 'react';
import Alert from '../components/Alert';
import login from '../api/login';
import useSWR from 'swr';

export default function Login() {
    const [background, setBackground] = useState(String)
    const [showSpinner, setShowSpinner] = useState("none")
    const [showText, setShowText] = useState("block")
    const [showPasswordEmail, setPasswordEmail] = useState("none")
    const [showCSRF, setCSRF] = useState("none")
    const [showUnknown, setUnknown] = useState("none")
    const [showApproval, setApproval] = useState("none")
    const [message, setMessage] = useState('');
    const [id, setId] = useState(null);
    const navigate = useNavigate();

    async function getBackground() {
        await fetch('http://personal1.jmgcoding.com:3003/api/getBackground', {
            credentials: 'include'
        })
            .then(response => response.json())
            .then(json => {
                setBackground(json.background)
            })
    }

    useEffect(() => {
        getBackground()
    }, []);

    let backgroundStyle

    if (typeof window !== "undefined") {
        backgroundStyle = {
            backgroundImage: `url("${window.location.origin}/backgrounds/${background}")`,
        }
    }

    const formlogin = (event) => {
        login(event).then(data => {
            if (data.success) return navigate('/dashboard');
            if (data.error) setMessage(data.error);
        });
    }

    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" id="main" style={backgroundStyle}>
            <div className="flex items-center justify-center" id="background-container">
                <div className="max-w-md w-full space-y-8" id="not-background">
                    <div>
                        <Alert message={message} id={id}/>
                        {/*<div role="alert" style={{ display: showPasswordEmail }} id="invalid_alert">
                            <div className="border border-red-400 rounded-b rounded-t bg-red-100 px-4 py-3 text-red-700">
                                <p>Email or password not correct.</p>
                            </div>
                        </div>
                        <div role="alert" style={{ display: showCSRF }} id="csrf_alert">
                            <div className="border border-red-400 rounded-b rounded-t bg-red-100 px-4 py-3 text-red-700">
                                <p>CSRF token missmatch. Please reload the page and try again.</p>
                            </div>
                        </div>
                        <div role="alert" style={{ display: showUnknown }} id="unknown_alert">
                            <div className="border border-red-400 rounded-b rounded-t bg-red-100 px-4 py-3 text-red-700">
                                <p>There was an unknown error when logging in. Please contact an administrator.</p>
                            </div>
                        </div>
                        <div role="alert" style={{ display: showApproval }} id="approval_alert">
                            <div className="border border-red-400 rounded-b rounded-t bg-red-100 px-4 py-3 text-red-700">
                                <p>You are still waiting for a Cad Admin to approve your account! Please try again later.</p>
                            </div>
                        </div>*/}
                        <br></br>
                        <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
                            Sign in to your account
                        </h2>
                        <p className="mt-2 text-center text-sm text-gray-600">
                            Or
                            <Link to="/signup" className="font-medium text-indigo-600 hover:text-indigo-500"> sign up </Link>
                        </p>
                    </div>
                    <form className="mt-8 space-y-6" id="loginForm" onSubmit={formlogin}>
                        <input type="hidden" name="csrftoken" value="<%= csrftoken %>" />
                        <div className="rounded-md shadow-sm -space-y-px">
                            <div>
                                <label htmlFor="email" className="sr-only">Email address</label>
                                <input id="email" name="email" type="email" autoComplete="email" required
                                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                    placeholder="Email address" />
                            </div>
                            <div>
                                <label htmlFor="password" className="sr-only">Password</label>
                                <input id="password" name="password" type="password" autoComplete="current-password" required
                                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                    placeholder="Password" />
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                        </div>

                        <div>
                            <button type="submit" className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                                    <svg className="h-5 w-5 text-indigo-500 group-hover:text-indigo-400"
                                        xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
                                        aria-hidden="true">
                                        <path fillRule="evenodd"
                                            d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                                            clipRule="evenodd" />
                                    </svg>
                                </span>
                                <div style={{ display: showSpinner }} id="loading-button">
                                    <svg role="status" className="w-4 mr-3 text-white animate-spin" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="#E5E7EB" />
                                        <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentColor" />
                                    </svg>
                                </div>
                                <a id="button-text" style={{ display: showText }}>Sign in</a>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}