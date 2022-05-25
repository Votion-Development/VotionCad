import fetch from 'node-fetch';

export default (event) => {
    event.preventDefault();
    return new Promise((resolve, reject) => {
        fetch(`http://personal1.jmgcoding.com:3003/api/auth/login`,
        {
            body: JSON.stringify({
                email: event.target.email.value,
                password: event.target.password.value
            }),
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            method: 'POST',
        }).then(res => resolve(res.json())).catch(reject);
    });
    /*setShowSpinner("block")
    setShowText("none")
    await fetch(`http://personal1.jmgcoding.com:3003/api/auth/login`,
        {
            body: JSON.stringify({
                email: event.target.email.value,
                password: event.target.password.value
            }),
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            method: 'POST',
        }
    )
        .then(response => response.json())
        .then(json => {
            if (json.error) {
                if (json.error === "approval") {
                    setMessage('You are still waiting for a Cad Admin to approve your account! Please try again later.');
                    setId('approval_alert');
                    //setApproval("block")
                    //setShowSpinner("none")
                    //setShowText("block")
                } else if (json.error === "invaliduserorpass") {
                    setMessage('Email or password not correct.');
                    setId('invalid_alert');
                    //setPasswordEmail("block")
                    //setShowSpinner("none")
                    //setShowText("block")
                } else if (json.error === "csrftokenmissmatch") {
                    setMessage('CSRF token missmatch. Please reload the page and try again.');
                    setId('csrf_alert');
                    //setCSRF("block")
                    //setShowSpinner("none")
                    //setShowText("block")
                } else {
                    setMessage('There was an unknown error when logging in. Please contact an administrator.');
                    setId('unknown_alert');
                    //setUnknown("block")
                    //setShowSpinner("none")
                    //setShowText("block")
                }
            } else if (json.success) {
                if (json.success === true) {
                    return navigate("/dashboard");
                } else {
                    setUnknown("block")
                    setShowSpinner("none")
                    setShowText("block")
                }
            } else {
                setUnknown("block")
                setShowSpinner("none")
                setShowText("block")
            }
        })*/
}