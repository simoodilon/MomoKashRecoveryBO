import React from 'react';
import { iUsersConnected } from '../features/usermanagement/users';
import { useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSms } from '@fortawesome/free-solid-svg-icons';

const NavBar: React.FC = () => {

    const connectedUsers: iUsersConnected = useSelector(
        (state: iUsersConnected) => state);

    console.log("connectedUsers", connectedUsers);

    const role = connectedUsers.roles;
    return (
        <nav className="sidebar sidebar-offcanvas" id="sidebar" style={{ height: '100vh', overflowY: 'auto' }}>
            <ul className="nav">
                <li className="nav-item">
                    <a className="nav-link" href="/dashboard">
                        <i className="icon-grid menu-icon"></i>
                        <span className="menu-title mt-2">Dashboard</span>
                    </a>
                </li>
                {role.includes("ADMIN") && (

                    <>
                        <li className="nav-item">
                            <a className="nav-link" href="/bank">
                                <i className="ti-package menu-icon"></i>
                                <span className="menu-title mt-2">Bank Management</span>
                            </a>
                        </li>

                        <li className="nav-item">
                            <a className="nav-link" href="/lawyers">
                                <i className="icon-briefcase menu-icon"></i>
                                <span className="menu-title mt-2">Lawyers</span>
                            </a>
                        </li>

                        <li className="nav-item">
                            <a className="nav-link" data-toggle="collapse" href="#ui-basic1" aria-expanded="false" aria-controls="ui-basic1">
                                <i className="ti-money menu-icon"></i>
                                <span className="menu-title mt-2">Loans</span>
                                <i className="menu-arrow"></i>
                            </a>
                            <div className="collapse" id="ui-basic1">
                                <ul className="nav flex-column sub-menu">
                                    <li className="nav-item">
                                        <a className="nav-link" href="/loans">View all Loans</a>
                                    </li>
                                    <li className="nav-item">
                                        <a className="nav-link" href="/loancategory">Details</a>
                                    </li>
                                    <li className="nav-item">
                                        <a className="nav-link" href="/refunds">Refunds</a>
                                    </li>
                                </ul>
                            </div>
                        </li>

                        <li className="nav-item">
                            <a className="nav-link" href="/tfj">
                                <i className="ti-bar-chart menu-icon"></i>
                                <span className="menu-title mt-2">TFJ</span>
                            </a>
                        </li>

                        {/* <li className="nav-item">
                            <a className="nav-link" href="/sms">
                                <i className="ti-ticket menu-icon"></i>
                                <span className="menu-title mt-2">SMS</span>
                            </a>
                        </li> */}

                        <li className="nav-item">
                            <a className="nav-link" data-toggle="collapse" href="#ui-basic4" aria-expanded="false" aria-controls="ui-basic4">
                                <i className="ti-ticket menu-icon"></i>
                                <span className="menu-title mt-2">SMS</span>
                                <i className="menu-arrow"></i>
                            </a>
                            <div className="collapse" id="ui-basic4">
                                <ul className="nav flex-column sub-menu">
                                    <li className="nav-item">
                                        <a className="nav-link" href="/sms">Sent Sms</a>
                                    </li>
                                    <li className="nav-item">
                                        <a className="nav-link" href="/smsmanagement">SMS Management</a>
                                    </li>

                                </ul>
                            </div>
                        </li>

                        <li className="nav-item">
                            <a className="nav-link" data-toggle="collapse" href="#ui-basic" aria-expanded="false" aria-controls="ui-basic">
                                <i className="ti-settings menu-icon"></i>
                                <span className="menu-title mt-2">Settings</span>
                                <i className="menu-arrow"></i>
                            </a>
                            <div className="collapse" id="ui-basic">
                                <ul className="nav flex-column sub-menu">
                                    <li className="nav-item">
                                        <a className="nav-link" href="/rolemanagement">Role Management</a>
                                    </li>
                                    <li className="nav-item">
                                        <a className="nav-link" href="/catalog">Menus</a>
                                    </li>
                                    <li className="nav-item">
                                        <a className="nav-link" href="/usermanagement">Users</a>
                                    </li>
                                </ul>
                            </div>
                        </li>
                    </>
                )}

                {role.includes("AVOCAT") && (
                    <>
                        <li className="nav-item">
                            <a className="nav-link" data-toggle="collapse" href="#ui-basic1" aria-expanded="false" aria-controls="ui-basic1">
                                <i className="ti-money menu-icon"></i>
                                <span className="menu-title mt-2">Loans</span>
                                <i className="menu-arrow"></i>
                            </a>
                            <div className="collapse" id="ui-basic1">
                                <ul className="nav flex-column sub-menu">
                                    <li className="nav-item">
                                        <a className="nav-link" href="/loans">View all Loans</a>
                                    </li>
                                    <li className="nav-item">
                                        <a className="nav-link" href="/loancategory">Details</a>
                                    </li>
                                </ul>
                            </div>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" href="/sms">
                                <i className="ti-ticket menu-icon"></i>
                                <span className="menu-title mt-2">SMS</span>
                            </a>
                        </li>

                    </>



                )}



            </ul>
        </nav>
    );
};

export default NavBar;



// import React from 'react';
// import { NavLink } from 'react-router-dom';

// const NavBar: React.FC = () => {
//     return (
//         <nav className="sidebar sidebar-offcanvas" id="sidebar">
//             <ul className="nav">
//                 <li className="nav-item">
//                     <NavLink className="nav-link" to="/dashboard">
//                         <i className="icon-grid menu-icon"></i>
//                         <span className="menu-title mt-2">Dashboard</span>
//                     </NavLink>
//                 </li>

//                 <li className="nav-item">
//                     <NavLink className="nav-link" to="/bank">
//                         <i className="ti-package menu-icon "></i>
//                         <span className="menu-title mt-2">Bank Management</span>
//                     </NavLink>
//                 </li>

//                 <li className="nav-item">
//                     <NavLink className="nav-link" to="/lawyers">
//                         <i className="icon-briefcase menu-icon"></i>
//                         <span className="menu-title mt-2">Lawyers</span>
//                     </NavLink>
//                 </li>
//                 {/* <li className="nav-item">
//                     <NavLink className="nav-link" to="/loans">
//                         <i className="ti-money menu-icon "></i>
//                         <span className="menu-title mt-2">Loans</span>
//                     </NavLink>
//                 </li> */}

//                 <li className="nav-item">
//                     <a className="nav-link" data-toggle="collapse" href="#ui-basic1" aria-expanded="false" aria-controls="ui-basic1">
//                         <i className="ti-money menu-icon"></i>
//                         <span className="menu-title mt-2">Loans</span>
//                         <i className="menu-arrow"></i>
//                     </a>
//                     <div className="collapse" id="ui-basic1">
//                         <ul className="nav flex-column sub-menu">
//                             <li className="nav-item">
//                                 <NavLink className="nav-link" to="/loans">View all Loans</NavLink>
//                             </li>
//                             <li className="nav-item">
//                                 <NavLink className="nav-link" to="/loancategory">Category</NavLink>
//                             </li>
//                         </ul>
//                     </div>

//                 </li>

//                 <li className="nav-item">
//                     <NavLink className="nav-link" to="/tfj">
//                         <i className="ti-bar-chart menu-icon "></i>
//                         <span className="menu-title mt-2">TFJ</span>
//                     </NavLink>
//                 </li>
//                 <li className="nav-item">
//                     <a className="nav-link" data-toggle="collapse" href="#ui-basic" aria-expanded="false" aria-controls="ui-basic">
//                         <i className="ti-settings menu-icon"></i>
//                         <span className="menu-title mt-2">Settings</span>
//                         <i className="menu-arrow"></i>
//                     </a>
//                     <div className="collapse" id="ui-basic">
//                         <ul className="nav flex-column sub-menu">
//                             <li className="nav-item">
//                                 <NavLink className="nav-link" to="/rolemanagement">Role Management</NavLink>
//                             </li>
//                             <li className="nav-item">
//                                 <NavLink className="nav-link" to="/catalog">Catalog</NavLink>
//                             </li>

//                         </ul>
//                     </div>

//                 </li>
//             </ul>
//         </nav>
//     );
// };

// export default NavBar;