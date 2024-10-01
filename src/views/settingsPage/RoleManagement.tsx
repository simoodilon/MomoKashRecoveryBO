import React, { useEffect, useMemo, useState } from 'react'
import DataTable from 'react-data-table-component';
import ExportCSV from '../../components/ExportCSV';
import { Button, Col, Form, Modal, OverlayTrigger, Spinner, Tooltip } from 'react-bootstrap';
import { BreadCrumb } from '../../components';
import { useSelector } from 'react-redux';
import { iUsersConnected } from '../../features/usermanagement/users';
import { MKR_Services } from '../../services';
import Buttons from '../../components/Button';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

interface RoleManagement {
    id: string,
    roleName: string,
    creationDate: string,
}

interface AssignRoleData {
    id: string,
    tagName: string,
    roleName: string,
    creationDate: string,
    serviceTags: string
}

interface CatalogData {
    id: string;
    serviceProvider: string;
    endPoint: string;
    description: string;
    internalId: string; // Add more properties as needed
    requestType: string;
}

const RoleManagement = () => {

    const [formData, setFormData] = React.useState<RoleManagement>(
        {
            id: '',
            roleName: '',
            creationDate: '',
        }
    )

    const [assignRoleData, setAssignRoleData] = React.useState<AssignRoleData>(
        {
            id: '',
            tagName: '',
            roleName: '',
            creationDate: '',
            serviceTags: ''
        }
    )
    const [roleData, setRoleData] = React.useState<RoleManagement[]>([])
    const [AssignedroleData, setAssignedRoleData] = React.useState<AssignRoleData[]>([])
    const [successMessage, setSuccessMessage] = React.useState('');
    const [errorMessage, setErrorMessage] = React.useState('');
    const [showModal, setShowModal] = React.useState(false)
    const [showAssignRoleModal, setAssignRoleShowModal] = React.useState(false)
    const [pending, setPending] = React.useState(true);
    const [searchTerm, setSearchTerm] = React.useState('');
    const [searchAssignedRoleTerm, setSearchAssignedRoleTerm] = React.useState('');
    const [CatalogData, setCatalogData] = React.useState<CatalogData[]>([]);
    const [selectedRole, setSelectedRole] = React.useState<RoleManagement | null>(null);
    const [selectedAssignRole, setSelectedAssignRole] = React.useState<AssignRoleData | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showDeleteAssignRoleModal, setShowDeleteAssignRoleModal] = useState(false);
    const navigate = useNavigate();
    const connectedUsers: iUsersConnected = useSelector(
        (state: iUsersConnected) => state)

    const token = connectedUsers.token

    const filteredRoles = roleData ? roleData.filter((role) =>
        Object.values(role).some((field) =>
            typeof field === 'string' &&
            field.toLowerCase().includes(searchTerm.toLowerCase())
        )
    ) : [];

    const filteredAssignRoles = AssignedroleData ? AssignedroleData.filter((assignrole: any) =>
        Object.values(assignrole).some((field) =>
            typeof field === 'string' &&
            field.toLowerCase().includes(searchAssignedRoleTerm.toLowerCase())
        )
    ) : [];

    // console.log("assignRoleData", assignRoleData);


    const handleToggleRoleModal = () => {
        setFormData({
            id: '',
            roleName: '',
            creationDate: '',
        });
        setShowModal(!showModal);
        console.log("selectedRole", selectedRole);
        console.log("FORM", formData);
        setSelectedRole(null);

    };

    const handleToggleAsignRoleModal = () => {
        setAssignRoleData({
            id: '',
            tagName: '',
            roleName: '',
            creationDate: '',
            serviceTags: ''
        });
        setAssignRoleShowModal(!showAssignRoleModal);
        setSelectedAssignRole(null);
    };

    const handleEdit = (role: RoleManagement) => {
        setSelectedRole(role);
        setFormData({
            id: role.id,
            roleName: role.roleName,
            creationDate: role.creationDate,
        });
        setShowModal(true);
        console.log("selectedRole", selectedRole);
        console.log("FORM", formData);
    };

    const handleDeleteRole = (role: RoleManagement) => {
        setSelectedRole(role);
        setShowDeleteModal(true);
    };

    const hideModalRole = () => {
        setShowModal(false);
        console.log("selectedRole", selectedRole);
        console.log("FORM", formData);
    };

    const handleAssignRoleEdit = (role: AssignRoleData) => {
        setSelectedAssignRole(role);
        setAssignRoleData({
            id: role.id,
            roleName: role.roleName,
            creationDate: role.creationDate,
            serviceTags: role.serviceTags,
            tagName: role.tagName
        });
        setAssignRoleShowModal(true);
    };

    const handleDeleteAssignedRole = (role: AssignRoleData) => {
        setSelectedAssignRole(role);
        setShowDeleteAssignRoleModal(true);
    };



    const fetchRoleData = async () => {

        try {
            const response = await MKR_Services('GATEWAY', 'recoveryRole/getAllRole', 'GET', null, token);
            if (response && response.status === 200) {
                setRoleData(response.body.data);
                setSuccessMessage('');
                setErrorMessage('');

            } else {

                setSuccessMessage('');
                setErrorMessage(response.body.errors || 'Unauthorized to perform action');
            }

        } catch (error) {
            console.log('Error:', error);
        }

    }

    const fetchAssignedRoleData = async () => {

        try {
            const response = await MKR_Services('GATEWAY', 'recoveryRole/getAllServiceToRole', 'GET', null, token);

            // console.log("fetchAssignedRoleData", response);

            if (response && response.status === 200) {
                setAssignedRoleData(response.body.data);
            } else {

                setSuccessMessage('');
                setErrorMessage(response.body.errors || 'Unauthorized to perform action');
            }

        } catch (error) {
            console.log('Error:', error);
        }

    }


    const handleConfirmAddRole = async () => {
        const roleName = formData.roleName;
        setPending(true);
        try {
            const response = await MKR_Services('GATEWAY', `recoveryRole/createRole/${roleName}`, 'POST', formData, token);

            if (response && response.status === 200) {
                handleToggleRoleModal();
                await fetchRoleData();

                toast.success('Role Created Successfully');
            } else {
                setSuccessMessage('');
                setErrorMessage(response.body.errors || 'Unauthorized to perform action');
            }
        } catch (error) {
            console.error('Error:', error);
            setSuccessMessage('Role Created Successfully');
            setErrorMessage('Error adding Role');
        }

        setPending(false);
    };

    const handleConfirmEditRole = async () => {
        setPending(true);

        try {
            const payload = {
                serviceReference: 'EDIT_ROLE',
                requestBody: JSON.stringify(formData)
            }
            const response = await MKR_Services('GATEWAY', 'clientRecoveryApiService/request', 'POST', payload, token);
            if (response && response.body.meta.statusCode === 200) {
                hideModalRole();
                await fetchRoleData();

                toast.success('Lawyer updated successfully');
            } else {
                setSuccessMessage('');
                setErrorMessage(response.body.errors || 'Unauthorized to perform action');
                toast.error('Error updating lawyer');
            }
        } catch (error) {
            console.error('Error:', error);
            setSuccessMessage('');
            setErrorMessage('Error updating lawyer');
        }
        setPending(false);
    };

    const handleConfirmAssignRole = async () => {

        setPending(true);
        try {
            const response = await MKR_Services('GATEWAY', `recoveryRole/addRoleToService`, 'POST', assignRoleData, token);
            console.log(response);

            if (response && response.status === 200) {
                handleToggleAsignRoleModal();
                await fetchRoleData();

                toast.success('Role Assigned successfully.');
            } else if (response && response.body.meta.statusCode === 400) {
                setErrorMessage('This Role has already been assigned to this Service');
                toast.info('This Role has already been assigned to this Service');
            }
            else {
                setSuccessMessage('');
                setErrorMessage(response.body.errors || 'Unauthorized to perform action');
            }
        } catch (error) {
            console.error('Error:', error);
            setSuccessMessage('Role Created Successfully');
            setErrorMessage('Error adding Role');
        }

        setPending(false);
    };
    const handleConfirmEditAssignedRole = async () => {

        setPending(true);
        try {
            const response = await MKR_Services('GATEWAY', `recoveryRole/addRoleToService`, 'POST', assignRoleData, token);

            if (response && response.status === 200) {
                handleToggleAsignRoleModal();
                await fetchRoleData();

                toast.success('Role Assigned successfully.');
            } else {
                setSuccessMessage('');
                setErrorMessage(response.body.errors || 'Unauthorized to perform action');
            }
        } catch (error) {
            console.error('Error:', error);
            setSuccessMessage('Role Created Successfully');
            setErrorMessage('Error adding Role');
        }

        setPending(false);
    };


    // Function to fetch Catalog data
    const fetchCatalogData = async () => {
        try {
            const response = await MKR_Services('GATEWAY', 'recoveryCatalogs/getAllCatalogs', 'GET', null, token);

            // console.log("response", response);

            if (response && response.status === 200) {
                setCatalogData(response.body.data);
            } else {
                console.error('Error fetching data');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };




    const handleConfirmDeleteRole = async () => {
        if (!selectedRole) return;
        setPending(true);
        try {

            const response = await MKR_Services('GATEWAY', `recoveryRole/deleteRole/${selectedRole.roleName}`, 'DELETE', null, token);
            console.log("response====", response);

            if (response && response.body.metaDataDto.statusCode === 200) {
                setShowDeleteModal(false);
                await fetchRoleData();
                toast.success('Role deleted successfully');
                setFormData({
                    id: '',
                    roleName: '',
                    creationDate: '',
                });
            } else if (response && response.body.metaDataDto.statusCode === 401) {
                toast.error(response.body.errors || 'Error deleting Role');
            }
            else {
                toast.error('Error deleting Role');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Error deleting Role');
        }
        setPending(false);
    };

    useEffect(() => {
        fetchRoleData();
        fetchCatalogData();
        fetchAssignedRoleData();
    }, [token])


    const handleChange = (e: { target: { name: any; value: any; }; }, stateType: 'formData' | 'assignRoleData') => {
        const { name, value } = e.target;
        if (stateType === 'formData') {
            setFormData(prevState => ({
                ...prevState,
                [name]: value,
            }));
        } else if (stateType === 'assignRoleData') {
            setAssignRoleData(prevState => ({
                ...prevState,
                [name]: value,
            }));
        }
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
            name: "Role Management",
            link: "",
            isActive: true
        }
    ];


    const columns = [
        // {
        //     name: 'ID',
        //     selector: (row: RoleManagement) => row.id,
        //     sortable: true,
        //     left: true,
        //     reorder: true,
        // },
        {
            name: 'Role Name',
            selector: (row: RoleManagement) => row.roleName,
            sortable: true,
            reorder: true,
        },
        {
            name: 'Creation Date',
            selector: (row: RoleManagement) => row.creationDate,
            sortable: true,
            reorder: true,
        },

        {
            name: 'Actions',
            cell: (row: RoleManagement) => (
                <div className='mt-2'>
                    <OverlayTrigger
                        placement="left"
                        overlay={<Tooltip id="tooltip-export">Edit</Tooltip>}
                    >
                        <Button className='justify-content-center me-1' onClick={() => handleEdit(row)} style={{ backgroundColor: "#4B49AC" }}>  <i className="ti-pencil"></i>
                        </Button>
                    </OverlayTrigger>

                    <OverlayTrigger
                        placement="right"
                        overlay={<Tooltip id="tooltip-export">Delete</Tooltip>}
                    >
                        <Button className='justify-content-center btn-danger' onClick={() => handleDeleteRole(row)} >  <i className="ti-trash"></i>
                        </Button>
                    </OverlayTrigger>
                </div>
            )
        }
    ];

    const columns2 = [

        {
            name: 'Role Name',
            selector: (row: AssignRoleData) => row.roleName,
            sortable: true,
            reorder: true,
        },
        {
            name: 'Catalog',
            selector: (row: AssignRoleData) => row.serviceTags,
            sortable: true,
            reorder: true,
        },

        {
            name: 'Actions',
            cell: (row: AssignRoleData) => (
                <div className='mt-2'>
                    <OverlayTrigger
                        placement="left"
                        overlay={<Tooltip id="tooltip-export">Edit</Tooltip>}
                    >
                        <Button className='justify-content-center me-1' onClick={() => handleAssignRoleEdit(row)} style={{ backgroundColor: "#4B49AC" }}>  <i className="ti-pencil"></i>
                        </Button>
                    </OverlayTrigger>

                    <OverlayTrigger
                        placement="right"
                        overlay={<Tooltip id="tooltip-export">Delete</Tooltip>}
                    >
                        <Button className='justify-content-center btn-danger' onClick={() => handleDeleteAssignedRole(row)} >  <i className="ti-trash"></i>
                        </Button>
                    </OverlayTrigger>
                </div>
            )
        }
    ];

    React.useEffect(() => {
        const timeout = setTimeout(() => {
            // setRows(columns);
            setPending(false);
        }, 2000);
        return () => clearTimeout(timeout);
    }, []);

    const actionsMemo = useMemo(() => <ExportCSV data={roleData} />, [roleData]);
    const actionsMemo2 = useMemo(() => <ExportCSV data={AssignedroleData} />, [AssignedroleData]);


    return (
        <div>


            <div>
                {/* page header */}
                <div className=" pb-1 mb-1 d-lg-flex justify-content-between align-items-center">
                    <div className="mb-3 mb-lg-0">
                        <div className="row">
                            <div className="col-lg-12 col-md-12 col-12">
                                <BreadCrumb name="Role" links={breadCrumb} children={<></>} />
                            </div>
                        </div>
                    </div>
                    <div className="d-flex">
                        {/* button */}
                        {/* <Buttons name='Add New User' onClick={() => navigate('/register')} /> */}
                    </div>
                </div>
                {/* Card */}
                <div className="card">
                    <div >
                        <div className="card-header border-bottom-0 p-2">

                            <div className=" d-lg-flex justify-content-between align-items-center">
                                <div className="mb-lg-0">
                                    <div className="row ml-3">
                                        <ul className="nav nav-lb-tab" id="tab" role="tablist">
                                            <li className="nav-item">
                                                <a className="nav-link active" id="all-post-tab" data-bs-toggle="pill" href="#all-post" role="tab" aria-controls="all-post" aria-selected="true">Roles</a>
                                            </li>
                                            <li className="nav-item">
                                                <a className="nav-link" id="published-tab" data-bs-toggle="pill" href="#published" role="tab" aria-controls="published" aria-selected="false">Roles Assigned to Users</a>
                                            </li>

                                        </ul>
                                    </div>
                                </div>
                                <div className="d-flex">
                                    {/* button */}
                                    <Buttons name='Add role' onClick={handleToggleRoleModal} />
                                    <Buttons name="Assign Role" onClick={handleToggleAsignRoleModal} />
                                </div>
                            </div>

                        </div>

                        <div className="tab-content" id="tabContent">

                            {/* Role */}
                            <div className="tab-pane fade show active" id="all-post" role="tabpanel" aria-labelledby="all-post-tab">
                                <div className="table-responsive border-0">
                                    {/* Table */}

                                    <DataTable
                                        title="Role"
                                        columns={columns}
                                        data={filteredRoles}
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
                                            </div>} />
                                </div>
                            </div>

                            {/* Roles Assigned to Users */}

                            <div className="tab-pane fade" id="published" role="tabpanel" aria-labelledby="published-tab">
                                <DataTable
                                    title="Roles Assigned to Users"
                                    columns={columns2}
                                    data={filteredAssignRoles}
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
                                                value={searchAssignedRoleTerm}
                                                onChange={(e) => setSearchAssignedRoleTerm(e.target.value)}
                                            />
                                            <div>
                                                <span style={{ marginLeft: '10px' }}></span>
                                                {actionsMemo2}
                                            </div>
                                        </div>
                                    }
                                />
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            <Modal show={showModal} onHide={handleToggleRoleModal} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>{selectedRole ? 'Edit Role' : 'Add New Role'}</Modal.Title>
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
                                <label htmlFor="id" className="form-label">
                                    Name
                                </label>
                                <input type="text" className="form-control" id="roleName" placeholder="Enter New Role" name="roleName" value={formData.roleName} onChange={(e) => handleChange(e, 'formData')} required />
                            </div>
                        </Col>

                    </Form>
                </Modal.Body>

                <Modal.Footer>
                    <div>

                        <Button variant="primary" onClick={selectedRole ? handleConfirmEditRole : handleConfirmAddRole}>
                            {pending ? <div className="spinner-border spinner-grow-sm text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div> : selectedRole ? 'Save Changes' : 'Add Role'}
                        </Button>
                        <span style={{ marginRight: '10px' }}></span>
                        <Button className="button-secondary" onClick={handleToggleRoleModal}>
                            Cancel
                        </Button>
                    </div>
                </Modal.Footer>
            </Modal>
            <Modal show={showAssignRoleModal} onHide={handleToggleAsignRoleModal} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>{selectedAssignRole ? 'Edit Assigned Role' : 'Assign New Role'}</Modal.Title>
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
                                <label htmlFor="id" className="form-label">
                                    Name
                                </label>
                                <select id="roleName" name="tagName" value={assignRoleData.tagName} onChange={(e) => handleChange(e, 'assignRoleData')} className="form-select">
                                    <option value="" disabled>Select Role</option>
                                    {Array.isArray(CatalogData) && CatalogData.length > 0 ? (
                                        CatalogData.map((option) => (
                                            <option key={option.id} value={option.id}>
                                                {option.id}
                                            </option>
                                        ))
                                    ) : (
                                        <option value="">No Catalog available</option>
                                    )}
                                </select>
                            </div>
                        </Col>
                        <Col xl="12">
                            <div className="mb-3">
                                <label htmlFor="id" className="form-label">
                                    Assign to
                                </label>
                                <select id="roleName" name="roleName" value={assignRoleData.roleName} onChange={(e) => handleChange(e, 'assignRoleData')} className="form-select">
                                    <option value="" disabled>Select Role</option>
                                    {Array.isArray(roleData) && roleData.length > 0 ? (
                                        roleData.map((option, index) => (
                                            <option key={index} value={option.roleName}>
                                                {option.roleName}
                                            </option>
                                        ))
                                    ) : (
                                        <option value="">No Role available</option>
                                    )}
                                </select>
                            </div>
                        </Col>

                    </Form>
                </Modal.Body>

                <Modal.Footer>
                    <div>
                        {/* <Button className="button" onClick={handleConfirmAssignRole}>
                            {pending ? <div className="spinner-border spinner-grow-sm text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                                : 'Add'}
                        </Button> */}

                        <Button variant="primary" onClick={selectedAssignRole ? handleConfirmEditAssignedRole : handleConfirmAssignRole}>
                            {pending ? <div className="spinner-border spinner-grow-sm text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div> : selectedAssignRole ? 'Save Changes' : 'Assign Role'}
                        </Button>
                        <span style={{ marginRight: '10px' }}></span>
                        <Button className="button-secondary" onClick={handleToggleAsignRoleModal}>
                            Cancel
                        </Button>
                    </div>
                </Modal.Footer>
            </Modal>



            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Delete</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to delete {selectedRole?.roleName}?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={handleConfirmDeleteRole}>{pending ? <Spinner animation="border" size="sm" /> : 'Delete'}</Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showDeleteAssignRoleModal} onHide={() => setShowDeleteAssignRoleModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Delete</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to delete {selectedAssignRole?.serviceTags}?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={handleConfirmDeleteRole}>{pending ? <Spinner animation="border" size="sm" /> : 'Delete'}</Button>
                </Modal.Footer>
            </Modal>
        </div>
    )
}

export default RoleManagement
