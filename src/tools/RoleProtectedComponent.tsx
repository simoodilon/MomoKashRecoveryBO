// RoleProtectedComponent.tsx
import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { iUsersConnected } from '../features/usermanagement/users';

interface RoleProtectedComponentProps {
    allowedRoles: string[];
    children: React.ReactNode;
}

const RoleProtectedComponent: React.FC<RoleProtectedComponentProps> = ({ allowedRoles, children }) => {
    const connectedUsers: iUsersConnected = useSelector(
        (state: iUsersConnected) => state
    );

    const role = connectedUsers.roles;

    if (!allowedRoles.some(r => role.includes(r))) {
        // If the user does not have the required role, redirect to error page
        return <Navigate to="/error" />;
    }

    return <>{children}</>;
};

export default RoleProtectedComponent;
