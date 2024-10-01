// React Component
import { Outlet, Navigate } from "react-router-dom";
import { shallowEqual, useSelector } from "react-redux";
import { iUsersConnected } from "../features/usermanagement/users";

// Features

const ProtectedComponent = () => {
    const connectedUsers: iUsersConnected = useSelector(
        (state: iUsersConnected) => state,
        shallowEqual
    );

    console.log("connectedUsersRoute", connectedUsers);


    return (
        connectedUsers.isAuthenticated ? <Outlet /> : <Navigate to={`/`} />
    )


}

export default ProtectedComponent;