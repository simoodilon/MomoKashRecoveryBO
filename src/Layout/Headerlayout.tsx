import React, { useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Images } from '../constants';
import { useNavigate } from 'react-router-dom';
import { Dispatch } from 'redux';
import { useDispatch } from 'react-redux';
import { iUsersAction, iUsersConnected } from '../features/usermanagement/users';
import { useSelector } from 'react-redux';

const INACTIVITY_TIMEOUT = 90 * 60 * 1000; // 60 minutes


const Headerlayout = () => {
    const navigate = useNavigate();
    const dispatch: Dispatch<any> = useDispatch();
    const connectedUsers: iUsersConnected = useSelector(

        (state: iUsersConnected) => state)

    // const token = connectedUsers.token
    const logOut = () => {
        const action: iUsersAction = {
            type: "LOGOUT",
            users: {}
        }
        dispatch(action);

        // navigate('/');
        console.log("connc==============", connectedUsers);

    };
    const { isAuthenticated, token } = useSelector((state: iUsersConnected) => state);

    useEffect(() => {
        console.log("connectedUsers=====", connectedUsers);
        console.log("isAuthenticated=====", isAuthenticated);

    }, [connectedUsers]);

    useEffect(() => {
        if (!isAuthenticated || !token) {
            const action: iUsersAction = {
                type: "LOGOUT",
                users: {}
            }
            dispatch(action);
            navigate('/');
        }
    }, [isAuthenticated, token, navigate]);

    useEffect(() => {
        // Set a timer to log out the user after 1 hour
        const timer = setTimeout(() => {
            dispatch({ type: 'LOGOUT' });
            // toast.warning('You have been logged out due to inactivity.'); // Uncomment if using toast notifications
            navigate('/');
        }, INACTIVITY_TIMEOUT);

        // Cleanup timer on component unmount
        return () => {
            clearTimeout(timer);
        };
    }, [dispatch, navigate]);

    return (
        <nav className="navbar col-lg-12 col-12 p-0 fixed-top d-flex flex-row">
            <div className="text-center navbar-brand-wrapper d-flex align-items-center justify-content-center">
                <a className="navbar-brand brand-logo mr-5" href="index.html">
                    <img src={Images.logo} className="mr-2" alt="logo" style={{ width: '100px', height: '50px' }} />
                    {/* <small style={{ fontSize: '15px' }}>MomoKash Recovery</small> */}
                </a>
                <a className="navbar-brand brand-logo-mini" href="/dashboard">
                    <img src={Images.logo} style={{ width: '400px', height: '40px' }} alt="logo" />
                </a>
            </div>
            <div className="navbar-menu-wrapper d-flex align-items-center justify-content-end">
                <button className="navbar-toggler navbar-toggler align-self-center" type="button" data-toggle="minimize">
                    <span className="icon-menu"></span>
                </button>
                {/* <ul className="navbar-nav mr-lg-2">
                    <li className="nav-item nav-search d-none d-lg-block">
                        <div className="input-group">
                            <div className="input-group-prepend hover-cursor" id="navbar-search-icon">
                                <span className="input-group-text" id="search">
                                    <i className="icon-search"></i>
                                </span>
                            </div>
                            <input type="text" className="form-control" id="navbar-search-input" placeholder="Search now" aria-label="search" aria-describedby="search" />
                        </div>
                    </li>
                </ul> */}
                <ul className="navbar-nav navbar-nav-right">
                    {/* <li className="nav-item dropdown">
                        <a className="nav-link count-indicator dropdown-toggle" id="notificationDropdown" href="#" data-toggle="dropdown">
                            <i className="icon-bell mx-0"></i>
                            <span className="count"></span>
                        </a>
                        <div className="dropdown-menu dropdown-menu-right navbar-dropdown preview-list" aria-labelledby="notificationDropdown">
                            <p className="mb-0 font-weight-normal float-left dropdown-header">Notifications</p>
                            <a className="dropdown-item preview-item">
                                <div className="preview-thumbnail">
                                    <div className="preview-icon bg-success">
                                        <i className="ti-info-alt mx-0"></i>
                                    </div>
                                </div>
                                <div className="preview-item-content">
                                    <h6 className="preview-subject font-weight-normal">Application Error</h6>
                                    <p className="font-weight-light small-text mb-0 text-muted">Just now</p>
                                </div>
                            </a>
                            <a className="dropdown-item preview-item">
                                <div className="preview-thumbnail">
                                    <div className="preview-icon bg-warning">
                                        <i className="ti-settings mx-0"></i>
                                    </div>
                                </div>
                                <div className="preview-item-content">
                                    <h6 className="preview-subject font-weight-normal">Settings</h6>
                                    <p className="font-weight-light small-text mb-0 text-muted">Private message</p>
                                </div>
                            </a>
                            <a className="dropdown-item preview-item">
                                <div className="preview-thumbnail">
                                    <div className="preview-icon bg-info">
                                        <i className="ti-user mx-0"></i>
                                    </div>
                                </div>
                                <div className="preview-item-content">
                                    <h6 className="preview-subject font-weight-normal">New user registration</h6>
                                    <p className="font-weight-light small-text mb-0 text-muted">2 days ago</p>
                                </div>
                            </a>
                        </div>
                    </li> */}
                    <li className="nav-item nav-profile dropdown">
                        <a className="nav-link dropdown-toggle" href="#" data-toggle="dropdown" id="profileDropdown">
                            <img src={Images.adminicon} alt="profile" />
                        </a>
                        <div className="dropdown-menu dropdown-menu-right navbar-dropdown" aria-labelledby="profileDropdown">
                            <a className="dropdown-item" href='/profile'>
                                <i className="ti-settings text-primary"></i>
                                User Profile
                            </a>
                            <a className="dropdown-item" onClick={logOut}>
                                <i className="ti-power-off text-primary"></i>
                                Logout
                            </a>
                        </div>
                    </li>
                    {/* <li className="nav-item nav-settings d-none d-lg-flex">
                        <a className="nav-link" href="#">
                            <i className="icon-ellipsis"></i>
                        </a>
                    </li> */}
                </ul>
                <button className="navbar-toggler navbar-toggler-right d-lg-none align-self-center" type="button" data-toggle="offcanvas">
                    <span className="icon-menu"></span>
                </button>
            </div>
        </nav>
    );
}

export default Headerlayout
