import React, { useEffect, useMemo, useState } from 'react'
import { BreadCrumb } from '../../components';
import Buttons from '../../components/Button';
import { MKR_Services } from '../../services';
import { iUsersConnected } from '../../features/usermanagement/users';
import { useSelector } from 'react-redux';
import ExportCSV from '../../components/ExportCSV';
import DataTable from 'react-data-table-component';
import { Button, Col, Modal, OverlayTrigger, Spinner, Tooltip } from 'react-bootstrap';
import { Form } from 'react-router-dom';
import { toast } from 'react-toastify';


interface CatalogData {
    id: string;
    serviceProvider: string;
    endPoint: string;
    description: string;
    internalId: string; // Add more properties as needed
    requestType: string;
}

interface FormData {
    id: string;
    serviceProvider: string;
    endPoint: string;
    description: string;
    internalId: string;
    requestType: string;

}

interface RefIdFormData {
    userName: string;
    refId: string;
}

const Catalog = () => {
    const [formData, setFormData] = useState<FormData>({
        id: '',
        serviceProvider: '',
        endPoint: '',
        description: '',
        internalId: '',
        requestType: '',
    });
    const [refIdFormData, setRefIdFormData] = useState<RefIdFormData>({ userName: '', refId: '' });

    const [CatalogData, setCatalogData] = useState<CatalogData[]>([]);
    const [selectedCatalog, setSelectedCatalog] = useState<CatalogData | null>(null);

    const [pending, setPending] = React.useState(true);
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // State for success and error messages
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showRefIdModal, setShowRefIdModal] = useState(false);

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

    // const handleRefIdChange = (e: { target: { name: any; value: any; }; }) => {
    //     const { name, value } = e.target;
    //     setRefIdFormData({
    //         ...refIdFormData,
    //         [name]: value,
    //     });
    // };

    // Filter Catalog data based on search term
    const filteredCatalogs = CatalogData.filter((Catalog) =>
        Object.values(Catalog).some((field) =>
            typeof field === 'string' &&
            field.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    const fetchCatalogData = async () => {
        try {

            // const response = await MKR_Services('GATEWAY', 'gavClientApiService/request', 'POST', payload, token);
            const response = await MKR_Services('GATEWAY', 'recoveryCatalogs/getAllCatalogs', 'GET', null, token);

            console.log("response", response);

            if (response && response.status === 200) {
                setCatalogData(response.body.data);
            } else {
                console.error('Error fetching data');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };


    // Function to confirm adding a Catalog
    const handleConfirmAddCatalog = async () => {

        setPending(true);

        try {
            const response = await MKR_Services('GATEWAY', 'recoveryCatalogs/createCatalogs', 'POST', formData, token);

            console.log("response", response);
            console.log("formData", formData);

            if (response && response.status === 200) {
                hideModalCatalog();
                await fetchCatalogData();

                toast.success('Catalog Created Successfully');
            } else {
                toast.error(response.body.errors || 'Unauthorized to perform action');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Error adding Catalog');
        }
        setPending(false);
    };

    const handleConfirmEditCatalog = async () => {
        setPending(true);
        try {
            const response = await MKR_Services('GATEWAY', 'recoveryCatalogs/updateCatalog', 'PUT', formData, token);

            if (response && response.status === 200) {
                hideModalCatalog();
                await fetchCatalogData();
                toast.success('Catalog Edited Successfully');
            } else {
                setSuccessMessage('');
                setErrorMessage(response.body.errors || 'Unauthorized to perform action');
                toast.error(response.body.errors || 'Error Editing Catalog');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Error Editing Catalog');
        }
        setPending(false);
    };

    const handleConfirmDeleteCatalog = async () => {
        if (!selectedCatalog) return;
        setPending(true);
        try {
            const payload = {
                serviceReference: 'DELETE_CATALOG',
                requestBody: JSON.stringify({ id: selectedCatalog.id })
            };

            console.log("payload", payload);

            const response = await MKR_Services('GATEWAY', 'clientRecoveryApiService/request', 'POST', payload, token);
            console.log("response====", response);

            if (response && response.body.meta.statusCode === 200) {
                setShowDeleteModal(false);
                await fetchCatalogData();
                toast.success('Catalog deleted successfully');
            } else if (response && response.body.meta.statusCode === 401) {
                toast.error(response.body.errors || 'Error deleting Bank');
            }
            else {
                toast.error('Error deleting Bank');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Error deleting lawyer');
        }
        setPending(false);
    };


    // const handleConfirmAddRefId = async () => {
    //     setPending(true);

    //     try {
    //         const response = await MKR_Services('GATEWAY', 'recoveryAuthentification/addRefIdToUser', 'POST', refIdFormData, token);

    //         console.log("response", response);
    //         console.log("refIdFormData", refIdFormData);

    //         if (response && response.status === 200) {
    //             hideModalRefId();
    //             toast.success('RefID Added Successfully');
    //         } else {
    //             toast.error(response.body.errors || 'Unauthorized to perform action');
    //         }
    //     } catch (error) {
    //         console.error('Error:', error);
    //         toast.error('Error adding RefID');
    //     }
    //     setPending(false);
    // };
    // Fetch Catalog data on component mount
    useEffect(() => {
        fetchCatalogData();

        if (!showModal) {
            setSelectedCatalog(null);
        }
    }, [showModal]);

    const handleEdit = (catalog: CatalogData) => {
        setSelectedCatalog(catalog);
        setFormData({
            id: catalog.id,
            serviceProvider: catalog.serviceProvider,
            endPoint: catalog.endPoint,
            description: catalog.description,
            internalId: catalog.internalId,
            requestType: catalog.requestType,
        });
        setShowModal(true);
    };

    const handleDelete = (catalog: CatalogData) => {
        setSelectedCatalog(catalog);
        setShowDeleteModal(true);
    };

    const handleToggleCatalogModal = () => {
        setFormData({
            id: '',
            serviceProvider: '',
            endPoint: '',
            description: '',
            internalId: '',
            requestType: '',
        });
        setShowModal(!showModal);
    };

    const hideModalCatalog = () => {
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
            name: "Menu Management",
            link: "",
            isActive: true
        }
    ];

    const columns = [
        {
            name: 'Menu Name',
            selector: (row: CatalogData) => row.id,
            sortable: true,
            left: true,
            reorder: true,
        },
        {
            name: 'Service Provider',
            selector: (row: CatalogData) => row.serviceProvider,
            sortable: true,
            reorder: true,
        },
        {
            name: 'Description',
            selector: (row: CatalogData) => row.description,
            sortable: true,
            reorder: true,
        },
        {
            name: 'Endpoint',
            selector: (row: CatalogData) => row.endPoint,
            sortable: true,
            reorder: true,

        },
        {
            name: 'Request Type',
            selector: (row: CatalogData) => row.requestType,
            sortable: true,
            reorder: true,

        },

        {
            name: 'Actions',
            cell: (row: CatalogData) => (
                <>
                    <OverlayTrigger placement="right" overlay={<Tooltip id="tooltip-export">Edit</Tooltip>}>
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

    const actionsMemo = useMemo(() => <ExportCSV data={CatalogData} />, [CatalogData]);

    return (
        <div>

            <div className=" pb-4 mb-0 d-lg-flex justify-content-between align-items-center">
                <div className="mb-1 mb-lg-0">
                    <div className="row">
                        <div className="col-lg-12 col-md-12 col-12">
                            <BreadCrumb name="Menu Management" links={breadCrumb} children={<></>} />
                        </div>
                    </div>
                </div>

            </div>

            <div className="card">
                <div className="card-body">
                    <div className=" pb-4 mb-0 d-lg-flex justify-content-between align-items-center">
                        <div className="mb-1 mb-lg-0">
                            <div className="row">
                                <h4 className="card-title">Menu Table</h4>
                            </div>
                        </div>
                        <div className="d-flex">
                            {/* button */}
                            <Buttons name='Add Catalog' onClick={handleToggleCatalogModal} />
                            {/* <Buttons name='Add refID' onClick={handleToggleRefIdModal} /> */}

                        </div>
                    </div>

                    <DataTable
                        // title="Catalog"
                        columns={columns}
                        data={filteredCatalogs}
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

            <Modal show={showModal} onHide={handleToggleCatalogModal} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>{selectedCatalog ? 'Edit Menu' : "Add Menu"}</Modal.Title>
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
                        {/* Add form fields for Catalog details */}
                        <Col xl="6">
                            <div className="mb-3">
                                <label htmlFor="id" className="form-label">
                                    Catalog Name
                                </label>
                                <input type="text" className="form-control" id="id" placeholder="Enter Menu name" name="id" value={formData.id} onChange={handleChange} required />
                            </div>
                        </Col>
                        <Col xl="6">
                            <div className="mb-3">
                                <label htmlFor="serviceProvider" className="form-label">
                                    Service Provider
                                </label>
                                <input type="text" className="form-control" id="serviceProvider" placeholder="Enter Menu serviceProvider" name="serviceProvider" value={formData.serviceProvider} onChange={handleChange} required />
                            </div>
                        </Col>
                        <Col xl="12">
                            <div className="mb-3">
                                <label htmlFor="description" className="form-label">
                                    Description
                                </label>
                                <input type="text" className="form-control" id="description" placeholder="Enter Menu description" name="description" value={formData.description} onChange={handleChange} required />
                            </div>
                        </Col>
                        <Col xl="12">
                            <div className="mb-3">
                                <label htmlFor="endPoint" className="form-label">
                                    EndPoint
                                </label>
                                <input type="text" className="form-control" id="endPoint" placeholder="Enter Menu endPoint" name="endPoint" value={formData.endPoint} onChange={handleChange} required />
                            </div>
                        </Col>
                        <Col xl="12">
                            <div className="mb-3">
                                <label htmlFor="requestType" className="form-label">
                                    Request Type
                                </label>
                                <input type="text" className="form-control" id="requestType" placeholder="Enter Request Type" name="requestType" value={formData.requestType} onChange={handleChange} required />
                            </div>
                        </Col>
                        {selectedCatalog ? null :
                            <Col xl="12">
                                <div className="mb-3">
                                    <label htmlFor="internalId" className="form-label">
                                        Internal Id
                                    </label>
                                    <input type="text" className="form-control" id="internalId" name="internalId" placeholder="Enter Internal Id" value={formData.internalId} onChange={handleChange} required />
                                </div>
                            </Col>
                        }
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <div>
                        <Button className="button" onClick={selectedCatalog ? handleConfirmEditCatalog : handleConfirmAddCatalog}>
                            {pending ? <Spinner animation="border" size="sm" /> : selectedCatalog ? "Update" : " Add"}
                        </Button>
                        <span style={{ marginRight: '10px' }}></span>
                        <Button className="button-secondary" onClick={hideModalCatalog}>
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
                    Are you sure you want to delete {selectedCatalog?.id}?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={handleConfirmDeleteCatalog}>{pending ? <Spinner animation="border" size="sm" /> : 'Delete'}</Button>
                </Modal.Footer>
            </Modal>


            {/* <Modal show={showRefIdModal} onHide={handleToggleRefIdModal} size="lg" centered>
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
                                <input type="text" className="form-control" id="userName" placeholder="Enter User Name" name="userName" value={refIdFormData.userName} onChange={handleRefIdChange} required />
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
                        <Button className="button-secondary" onClick={hideModalRefId}>
                            Cancel
                        </Button>
                    </div>
                </Modal.Footer>
            </Modal> */}

        </div>
    )
}

export default Catalog
