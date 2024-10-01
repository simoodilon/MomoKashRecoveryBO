import React, { useEffect, useMemo, useState } from 'react'
import { BreadCrumb } from '../../components';
import Buttons from '../../components/Button';
import { MKR_Services } from '../../services';
import { iUsersConnected } from '../../features/usermanagement/users';
import { useSelector } from 'react-redux';
import ExportCSV from '../../components/ExportCSV';
import DataTable from 'react-data-table-component';
import { Button, Col, FormControl, FormGroup, Modal, OverlayTrigger, Spinner, Tooltip } from 'react-bootstrap';
import { Form, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';


export interface UserData {
    id: string;
    password: string;
    email: string;
    loginCount: string;
    userName: string;
    creationDate: string;
    actif: boolean;
    role: string;
    refId: string | null;
}

interface FormData {
    id: string;
    password: string;
    email: string;
    loginCount: string;
    userName: string;
    creationDate: string;
    actif: boolean;
    role: string;
    refId: string | null;
}

interface RefIdFormData {
    userName: string;
    refId: string;
}

const UserManagement = () => {
    const [formData, setFormData] = useState<FormData>({
        id: '',
        password: '',
        email: '',
        loginCount: '',
        userName: '',
        creationDate: '',
        actif: false,
        role: '',
        refId: null,
    });
    const [refIdFormData, setRefIdFormData] = useState<RefIdFormData>({ userName: '', refId: '' });

    const [userData, setUserData] = useState<UserData[]>([]);
    const [selectedUser, setSelectedUser] = useState<UserData | null>(null);

    const [pending, setPending] = React.useState(true);
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    // State for success and error messages
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showRefIdModal, setShowRefIdModal] = useState(false);

    const [showResetModal, setShowResetModal] = useState(false);
    const [resetUsernameOrEmail, setResetUsernameOrEmail] = useState('');
    const [resetToken, setResetToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [resetStep, setResetStep] = useState(1);

    const connectedUsers: iUsersConnected = useSelector(
        (state: iUsersConnected) => state)

    const token = connectedUsers.token

    // Function to handle form field changes
    const handleChange = (e: { target: { name: any; value: any; }; }) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleRefIdChange = (e: { target: { name: any; value: any; }; }) => {
        const { name, value } = e.target;
        setRefIdFormData({
            ...refIdFormData,
            [name]: value,
        });
    };

    // Filter user data based on search term
    const filteredUsers = userData.filter((user) =>
        Object.values(user).some((field) =>
            typeof field === 'string' &&
            field.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    const fetchUserData = async () => {
        setPending(true);
        try {
            const response = await MKR_Services('GATEWAY', 'recoveryAuthentification/getAllUser', 'GET', null, token);

            console.log("response", response);

            if (response && response.status === 200) {
                setUserData(response.body.data);
            } else {
                console.error('Error fetching data');
            }
        } catch (error) {
            console.error('Error:', error);
        }

        setPending(false)
    };



    const handleConfirmEditUser = async () => {
        setPending(true);
        try {
            const response = await MKR_Services('GATEWAY', 'userManagement/updateUser', 'PUT', formData, token);

            if (response && response.status === 200) {
                hideModalUser();
                await fetchUserData();
                toast.success('User Edited Successfully');
            } else {
                setSuccessMessage('');
                setErrorMessage(response.body.errors || 'Unauthorized to perform action');
                toast.error(response.body.errors || 'Error Editing User');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Error Editing User');
        }
        setPending(false);
    };

    const handleConfirmDeleteUser = async () => {
        if (!selectedUser) return;
        setPending(true);
        try {
            const payload = {
                serviceReference: 'DELETE_USER',
                requestBody: JSON.stringify({ id: selectedUser.id })
            };
            const formdata = { userName: selectedUser.userName }

            console.log("payload", payload);

            const response = await MKR_Services('GATEWAY', `recoveryAuthentification/deleteUser/${selectedUser.userName}`, 'DELETE', formdata, token);
            console.log("response====", response);

            if (response && response.body.metaDataDto.statusCode === 200) {
                setShowDeleteModal(false);
                await fetchUserData();
                toast.success('User deleted successfully');
            } else if (response && response.body.meta.statusCode === 401) {
                toast.error(response.body.errors || 'Error deleting user');
            }
            else {
                toast.error('Error deleting user');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Error deleting user');
        }
        setPending(false);
    };

    const handleConfirmAddRefId = async () => {
        setPending(true);

        try {
            const response = await MKR_Services('GATEWAY', 'recoveryAuthentification/addRefIdToUser', 'POST', refIdFormData, token);

            console.log("response", response);
            console.log("refIdFormData", refIdFormData);

            if (response && response.status === 200) {
                hideModalRefId();
                toast.success('RefID Added Successfully');
            } else {
                toast.error(response.body.errors || 'Unauthorized to perform action');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Error adding RefID');
        }
        setPending(false);
    };

    const handleInitiateReset = async () => {
        setPending(true);

        try {
            const response = await MKR_Services('GATEWAY', `recoveryAuthentification/initialisationResetPassword/${resetUsernameOrEmail}`, 'POST', null, token);

            console.log("resetresponse", response);

            if (response && response.status === 200) {
                setResetStep(2);
                toast.success('Reset initiated. Please check your SMS for the token.');
            } else {
                toast.error('Failed to initiate reset. Please try again.');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Error initiating reset');
        }
        setPending(false);
    };


    const handleFinishReset = async () => {
        setPending(true);
        try {
            const payload = {
                token: resetToken,
                userNameOrEmail: resetUsernameOrEmail,
                newPassword: newPassword
            };

            console.log("payload", payload);

            const response = await MKR_Services('GATEWAY', 'recoveryAuthentification/finishResetPassword', 'POST', payload, token);
            console.log("resetresponse", response);

            if (response && response.status === 200) {
                toast.success('Password reset successfully');
                setShowResetModal(false);
                setResetStep(1);
                setResetUsernameOrEmail('');
                setResetToken('');
                setNewPassword('');
            } else {
                toast.error('Failed to reset password. Please try again.');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Error resetting password');
        }
        setPending(false);

    };


    useEffect(() => {
        fetchUserData();

        if (!showModal) {
            setSelectedUser(null);
        }
    }, []);



    const handleEdit = (user: UserData) => {
        setSelectedUser(user);
        setFormData({
            id: user.id,
            password: user.password,
            email: user.email,
            loginCount: user.loginCount,
            userName: user.userName,
            creationDate: user.creationDate,
            actif: user.actif,
            role: user.role,
            refId: user.refId,
        });
        setShowModal(true);
    };

    const handleDelete = (user: UserData) => {
        setSelectedUser(user);
        setShowDeleteModal(true);
    };



    const hideModalUser = () => {
        setShowModal(false);
        setSuccessMessage('');
        setErrorMessage('');
    };

    const handleToggleRefIdModal = () => {
        setRefIdFormData({ userName: '', refId: '' });
        setShowRefIdModal(!showRefIdModal);
    };

    const hideModalRefId = () => {
        setShowRefIdModal(false);
        setSuccessMessage('');
        setErrorMessage('');
    };

    const breadCrumb = [
        {
            name: "Home",
            link: "/dashboard",
            isActive: false
        },
        {
            name: "Settings",
            link: "",
            isActive: false
        },
        {
            name: "User Management",
            link: "",
            isActive: true
        }
    ];

    const columns = [
        {
            name: 'User Name',
            selector: (row: UserData) => row.userName,
            sortable: true,
            left: true,
            reorder: true,
        },
        {
            name: 'Email',
            selector: (row: UserData) => row.email,
            sortable: true,
            reorder: true,
        },
        {
            name: 'Login Count',
            selector: (row: UserData) => row.loginCount,
            sortable: true,
            reorder: true,
        },
        {
            name: 'Role',
            selector: (row: UserData) => row.role,
            sortable: true,
            reorder: true,
        },
        {
            name: 'Status',
            cell: (row: UserData) => (
                <>
                    {row.actif ? <div className='badge bg-success'>Active</div>
                        : <div className='badge bg-danger'>Inactive</div>}
                </>
            ),
            sortable: true,
            reorder: true,
        },
        {
            name: 'Creation Date',
            selector: (row: UserData) => row.creationDate,
            sortable: true,
            reorder: true,
        },
        {
            name: 'Actions',
            cell: (row: UserData) => (
                <>
                    <OverlayTrigger placement="left" overlay={<Tooltip id="tooltip-export">Edit</Tooltip>}>
                        <Button className='justify-content-center me-1' onClick={() => handleEdit(row)} style={{ backgroundColor: "#4B49AC" }}>
                            <i className="ti-pencil"></i>
                        </Button>
                    </OverlayTrigger>
                    <OverlayTrigger
                        placement="right"
                        overlay={<Tooltip id="tooltip-export">Delete</Tooltip>}
                    >
                        <Button className='justify-content-center btn-danger' onClick={() => handleDelete(row)} >  <i className="ti-trash"></i>
                        </Button>
                    </OverlayTrigger>
                </>
            ),
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
        },
    ];


    React.useEffect(() => {
        const timeout = setTimeout(() => {
            // setRows(columns);
            setPending(false);
        }, 2000);
        return () => clearTimeout(timeout);
    }, []);

    const actionsMemo = useMemo(() => <ExportCSV data={userData} />, [userData]);


    // console.log("refIdFormData", refIdFormData);

    return (
        <div>

            <div className=" pb-4 mb-0 d-lg-flex justify-content-between align-items-center">
                <div className="mb-1 mb-lg-0">
                    <div className="row">
                        <div className="col-lg-12 col-md-12 col-12">
                            <BreadCrumb name="User Management" links={breadCrumb} children={<></>} />
                        </div>
                    </div>

                </div>
                <div className="d-flex">
                    {/* button */}
                    <Buttons name='Reset User' onClick={() => setShowResetModal(true)} />
                </div>
            </div>

            <div className="card">
                <div className="card-body">
                    <div className=" pb-4 mb-0 d-lg-flex justify-content-between align-items-center">
                        <div className="mb-1 mb-lg-0">
                            <div className="row">
                                <h4 className="card-title">User Table</h4>
                            </div>
                        </div>
                        <div className="d-flex">
                            {/* button */}
                            <Buttons name='Add RefID' onClick={handleToggleRefIdModal} />
                            <Buttons name='Add New User' onClick={() => navigate('/register')} />

                        </div>
                    </div>

                    <DataTable
                        // title="Catalog"
                        columns={columns}
                        data={filteredUsers}
                        pagination
                        paginationPerPage={10}
                        paginationRowsPerPageOptions={[10, 20, 30]}
                        // selectableRows
                        highlightOnHover
                        pointerOnHover
                        responsive
                        subHeader
                        progressPending={pending}
                        // actions={actionsMemo}
                        subHeaderComponent={
                            <div className="d-flex align-items-center">
                                <input
                                    type="text"
                                    placeholder="Search"
                                    className="form-control"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <div>
                                    <span style={{ marginLeft: '10px' }}></span>
                                    {actionsMemo}
                                </div>
                            </div>


                        }
                    />


                </div>
            </div>

            <Modal show={showModal} onHide={hideModalUser} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>Edit User </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {successMessage && <div className="alert alert-success alert-dismissible fade show" role="alert">
                        {successMessage}
                        <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                    </div>}
                    {errorMessage && <div className="alert alert-danger alert-dismissible fade show" role="alert">
                        {errorMessage}
                        <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                    </div>}
                    <Form className="row g-3">
                        <Col xl="6">
                            <div className="mb-3">
                                <label htmlFor="userName" className="form-label">
                                    User Name
                                </label>
                                <input type="text" className="form-control" id="userName" name="userName" value={formData.userName} onChange={handleChange} required />
                            </div>
                        </Col>
                        <Col xl="6">
                            <div className="mb-3">
                                <label htmlFor="role" className="form-label">
                                    Role
                                </label>
                                <input type="text" className="form-control" id="role" name="role" value={formData.role} onChange={handleChange} required />
                            </div>
                        </Col>
                        <Col xl="12">
                            <div className="mb-3">
                                <label htmlFor="email" className="form-label">
                                    Email
                                </label>
                                <input type="email" className="form-control" id="email" name="email" value={formData.email} onChange={handleChange} required />
                            </div>
                        </Col>


                        <Col xl="12">
                            <div className="mb-3">
                                <label htmlFor="actif" className="form-label me-4">
                                    Active
                                </label>
                                <input type="checkbox" className="form-check-input" id="actif" name="actif" checked={formData.actif} onChange={(e) => setFormData({ ...formData, actif: e.target.checked })} />
                            </div>
                        </Col>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={hideModalUser}>
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleConfirmEditUser}
                    >
                        {pending ? (
                            <Spinner
                                animation="border"
                                size="sm"
                                role="status"
                                aria-hidden="true"
                            />
                        ) : 'Save Changes'
                        }
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Deletion</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to delete user {selectedUser?.userName}?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={handleConfirmDeleteUser}>
                        {pending ? (
                            <Spinner
                                animation="border"
                                size="sm"
                                role="status"
                                aria-hidden="true"
                            />
                        ) : "Delete"}

                    </Button>
                </Modal.Footer>
            </Modal>


            <Modal show={showRefIdModal} onHide={handleToggleRefIdModal} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>Add refID</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {successMessage && <div className="alert alert-success alert-dismissible fade show" role="alert">
                        {successMessage}
                        <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                    </div>}
                    {errorMessage && <div className="alert alert-danger alert-dismissible fade show" role="alert">
                        {errorMessage}
                        <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                    </div>}
                    <Form className="row g-3">
                        <Col xl="12">
                            <div className="mb-3">
                                <label htmlFor="userName" className="form-label">
                                    User Name
                                </label>
                                {/* <input type="text" className="form-control" id="userName" placeholder="Enter User Name" name="userName" value={refIdFormData.userName} onChange={handleRefIdChange} required /> */}

                                <select id="userName" name="userName" value={refIdFormData.userName} onChange={handleRefIdChange} className="form-select">
                                    <option value="">Select User</option>
                                    {Array.isArray(userData) && userData.length > 0 ? (
                                        userData.map((option) => (
                                            <option key={option.userName} value={option.userName}>
                                                {option.userName}
                                            </option>
                                        ))
                                    ) : (
                                        <option value="">No Users available</option>
                                    )}
                                </select>
                            </div>
                        </Col>
                        <Col xl="12">
                            <div className="mb-3">
                                <label htmlFor="refId" className="form-label">
                                    Ref ID
                                </label>
                                <input type="text" className="form-control" id="refId" placeholder="Enter Ref ID" name="refId" value={refIdFormData.refId} onChange={handleRefIdChange} required />
                            </div>
                        </Col>

                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <div>
                        <Button className="button" onClick={handleConfirmAddRefId}>
                            {pending ? <Spinner animation="border" size="sm" /> : 'Add'}
                        </Button>
                        <span style={{ marginRight: '10px' }}></span>
                        <Button className="btn btn-secondary" onClick={hideModalRefId}>
                            Cancel
                        </Button>
                    </div>
                </Modal.Footer>
            </Modal>


            <Modal show={showResetModal} onHide={() => {
                setShowResetModal(false);
                setResetStep(1);
                setResetUsernameOrEmail('');
                setResetToken('');
                setNewPassword('');
            }} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>Reset User Password</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {resetStep === 1 ? (
                        <Form>
                            <FormGroup className="mb-3">
                                <label>Username or Email</label>
                                <FormControl
                                    type="text"
                                    placeholder="Enter username or email"
                                    value={resetUsernameOrEmail}
                                    onChange={(e) => setResetUsernameOrEmail(e.target.value)}
                                />
                            </FormGroup>
                            <div className='d-flex justify-content-end align-items-center' >
                                <Button variant="primary" onClick={handleInitiateReset}>
                                    {pending ? <Spinner animation="border" size="sm" /> : "Send Reset Token"}
                                </Button>
                            </div>

                        </Form>
                    ) : (
                        <Form>
                            <FormGroup className="mb-3">
                                <label>Reset Token</label>
                                <FormControl
                                    type="text"
                                    placeholder="Enter reset token from SMS"
                                    value={resetToken}
                                    onChange={(e) => setResetToken(e.target.value)}
                                />
                            </FormGroup>
                            <FormGroup className="mb-3">
                                <label>New Password</label>
                                <FormControl
                                    type="password"
                                    placeholder="Enter new password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                            </FormGroup>
                            <Button variant="primary" onClick={handleFinishReset}>
                                {pending ? <Spinner animation="border" size="sm" /> : "Reset Password  "}
                            </Button>
                        </Form>
                    )}
                </Modal.Body>
            </Modal>

        </div>
    )
}

export default UserManagement
