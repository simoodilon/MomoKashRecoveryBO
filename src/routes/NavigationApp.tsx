// NavigationApp.tsx
import React from "react";
import { createBrowserRouter, createRoutesFromElements, Route } from "react-router-dom";
import Dashboard from "../views/dashboard/Dashboard";
import AppLayout from "../Layout/AppLayout";
import TestView from "../views/testview/TestView";
import LoginPage from "../views/auth/LoginPage";
import ProtectedComponent from "../tools/ProtectedComponent";
import RoleProtectedComponent from "../tools/RoleProtectedComponent";
import Catalog from "../views/settingsPage/Catalog";
import ErrorPage from "../views/auth/ErrorPage";
import RoleManagement from "../views/settingsPage/RoleManagement";
import Lawyers from "../views/lawyers/Lawyers";
import Loans from "../views/loans/Loans";
import AddBank from "../views/bankmanagement/AddBank";
import BankManagement from "../views/bankmanagement/BankManagement";
import Tfj from "../views/tfj/Tfj";
import Category from "../views/loans/Category";
import Register from "../views/auth/Register";
import UserManagement from "../views/settingsPage/UsersManagement";
import Refunds from "../views/loans/Refunds";
import Profile from "../views/profile/Profile";
import Sms from "../views/Sms/Sms";
import ModifyPassword from "../views/auth/ModifyPassword";
import ManageSms from "../views/Sms/ManageSms";

const NavigationApp = createBrowserRouter(
    createRoutesFromElements(
        <Route>
            <Route path="/" element={<LoginPage />} />
            <Route path="*" element={<ErrorPage />} />
            <Route element={<ProtectedComponent />}>
                <Route path="/modifypassword" element={<ModifyPassword />} />
                <Route path="/dashboard" element={<AppLayout><Dashboard /></AppLayout>} />
                <Route path="/register" element={<AppLayout><Register /></AppLayout>} />
                <Route path="/testview" element={<AppLayout><TestView /></AppLayout>} />
                <Route
                    path="/catalog"
                    element={
                        <RoleProtectedComponent allowedRoles={['ADMIN']}>
                            <AppLayout><Catalog /></AppLayout>
                        </RoleProtectedComponent>
                    }
                />
                <Route
                    path="/rolemanagement"
                    element={
                        <RoleProtectedComponent allowedRoles={['ADMIN']}>
                            <AppLayout><RoleManagement /></AppLayout>
                        </RoleProtectedComponent>
                    }
                />
                <Route
                    path="/lawyers"
                    element={
                        <RoleProtectedComponent allowedRoles={['ADMIN']}>
                            <AppLayout><Lawyers /></AppLayout>
                        </RoleProtectedComponent>
                    }
                />
                <Route
                    path="/loans"
                    element={
                        <RoleProtectedComponent allowedRoles={['ADMIN', 'AVOCAT']}>
                            <AppLayout><Loans /></AppLayout>
                        </RoleProtectedComponent>
                    }
                />
                <Route
                    path="/bank"
                    element={
                        <RoleProtectedComponent allowedRoles={['ADMIN']}>
                            <AppLayout><BankManagement /></AppLayout>
                        </RoleProtectedComponent>
                    }
                />
                <Route
                    path="/addbank"
                    element={
                        <RoleProtectedComponent allowedRoles={['ADMIN']}>
                            <AppLayout><AddBank /></AppLayout>
                        </RoleProtectedComponent>
                    }
                />
                <Route
                    path="/tfj"
                    element={
                        <RoleProtectedComponent allowedRoles={['ADMIN']}>
                            <AppLayout><Tfj /></AppLayout>
                        </RoleProtectedComponent>
                    }
                />
                <Route
                    path="/loancategory"
                    element={
                        <RoleProtectedComponent allowedRoles={['ADMIN', 'AVOCAT']}>
                            <AppLayout><Category /></AppLayout>
                        </RoleProtectedComponent>
                    }
                />
                <Route
                    path="/usermanagement"
                    element={
                        <RoleProtectedComponent allowedRoles={['ADMIN']}>
                            <AppLayout><UserManagement /></AppLayout>
                        </RoleProtectedComponent>
                    }
                />
                <Route
                    path="/refunds"
                    element={
                        <RoleProtectedComponent allowedRoles={['ADMIN']}>
                            <AppLayout><Refunds /></AppLayout>
                        </RoleProtectedComponent>
                    }
                />
                <Route
                    path="/sms"
                    element={
                        <RoleProtectedComponent allowedRoles={['ADMIN', 'AVOCAT']}>
                            <AppLayout><Sms /></AppLayout>
                        </RoleProtectedComponent>
                    }
                />
                <Route
                    path="/smsmanagement"
                    element={
                        <RoleProtectedComponent allowedRoles={['ADMIN']}>
                            <AppLayout><ManageSms /></AppLayout>
                        </RoleProtectedComponent>
                    }
                />
                <Route path="/profile" element={<AppLayout><Profile /></AppLayout>} />
            </Route>
        </Route>
    )
);

export default NavigationApp;
