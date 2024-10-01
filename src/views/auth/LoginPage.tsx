import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Dispatch } from 'redux';
import { iUsersAction, iUsersConnected } from '../../features/usermanagement/users';
import { MKR_Services } from '../../services';
import { Spinner } from 'react-bootstrap';
import { Images } from '../../constants';


const LoginPage = () => {
    const navigate = useNavigate();
    const [credentials, setCredentials] = useState({ userNameOrEmail: "", password: "" });
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const dispatch: Dispatch<any> = useDispatch();
    const connectedUsers: iUsersConnected = useSelector(
        (state: iUsersConnected) => state
    );

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        handleLogin();
    };

    const handleLogin = async () => {
        try {
            setLoading(true);
            const response = await MKR_Services("GATEWAY", 'recoveryAuthentification/login', 'POST', credentials);

            console.log(response);

            if (response && response.status === 200) {
                const users: iUsersConnected = response.body.data;

                const action: iUsersAction = {
                    type: "LOGIN",
                    users: users
                };
                dispatch(action);

                // Check loginCount immediately after response
                const loginCount = response.body.data.loginCount || "0";

                if (loginCount === "1") {
                    // User is logging in for the first time, redirect to "/modifypassword"
                    navigate('/modifypassword');
                }
                else {
                    // Continue with the login process
                    // User can navigate freely to the dashboard after authentication
                    navigate('dashboard');

                }
                setSuccessMessage('Login successful!');
                setErrorMessage('');
            }
            else if (response && response.status === 401) {
                setErrorMessage('Login failed. Please check your credentials and try again.' || response.body.message);
                setSuccessMessage('');
            } else {
                setErrorMessage('Network error. Please try again later.');
            }
        } catch (error) {
            setErrorMessage('Network error. Please try again later.');
        }
        setLoading(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
        setCredentials({ ...credentials, [key]: e.target.value });
    };

    return (
        <section className="vh-100" style={{ backgroundColor: '#4B49AC' }}>
            <div className="container py-5 h-100">
                <div className="row d-flex justify-content-center align-items-center h-100">
                    <div className="col col-xl-10">
                        <div className="card" style={{ borderRadius: '1rem' }}>
                            <div className="row g-0">
                                <div className="col-md-6 col-lg-5 d-none d-md-flex justify-content-center align-items-center">
                                    <img
                                        src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/draw2.webp"
                                        alt="login form"
                                        className="img-fluid"
                                        style={{ borderRadius: '1rem 0 0 1rem', }}
                                    />
                                </div>
                                <div className="col-md-6 col-lg-7 d-flex align-items-center">
                                    <div className="card-body p-4 p-lg-5 text-black">
                                        <form onSubmit={handleSubmit}>
                                            <div className="d-flex  align-items-center mb-3 pb-1">
                                                <div className="brand-logo" >

                                                    <img src={Images.logo} style={{ width: '200px', height: '100px' }} alt="logo" />
                                                </div>
                                            </div>
                                            <h5 className="fw-normal mb-3 pb-3" style={{ letterSpacing: '1px' }}>
                                                Sign into your account
                                            </h5>
                                            <div className="form-outline mb-4">
                                                <input
                                                    type="text"
                                                    id="form2Example17"
                                                    className="form-control form-control-lg"
                                                    placeholder="User Name"
                                                    onChange={(e) => handleChange(e, 'userNameOrEmail')}
                                                />
                                                <label className="form-label" htmlFor="form2Example17">
                                                    User Name or Email
                                                </label>
                                            </div>
                                            <div className="form-outline mb-4">
                                                <input
                                                    type="password"
                                                    id="form2Example27"
                                                    className="form-control form-control-lg"
                                                    placeholder="Password"
                                                    onChange={(e) => handleChange(e, 'password')}
                                                />
                                                <label className="form-label" htmlFor="form2Example27">
                                                    Password
                                                </label>
                                            </div>
                                            <div className="pt-1 mb-4">
                                                <button
                                                    className="btn btn-dark btn-lg btn-block"
                                                    type="submit"
                                                >
                                                    {loading ? <div className='text-center'><Spinner variant="primary" /></div> : "Login"}
                                                </button>
                                            </div>
                                            {errorMessage && (
                                                <div className="text-danger">
                                                    {errorMessage}
                                                </div>
                                            )}
                                            {successMessage && (
                                                <div className="text-success">
                                                    {successMessage}
                                                </div>
                                            )}
                                            {/* <a className="small text-muted" href="#!">
                                                Forgot password?
                                            </a>
                                            <p className="mb-5 pb-lg-2" style={{ color: '#393f81' }}>
                                                Don't have an account?{' '}
                                                <a href="#!" style={{ color: '#393f81' }}>
                                                    Register here
                                                </a>
                                            </p> */}
                                            <a href="#!" className="small text-muted">
                                                Terms of use.
                                            </a>
                                            <a href="#!" className="small text-muted">
                                                Privacy policy
                                            </a>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default LoginPage;
