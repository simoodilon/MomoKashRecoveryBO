import React, { useEffect, useMemo, useState } from 'react'
import { BreadCrumb } from '../../components';
import DataTable from 'react-data-table-component';
import { iUsersConnected } from '../../features/usermanagement/users';
import { useSelector } from 'react-redux';
import ExportCSV from '../../components/ExportCSV';
import { MKR_Services } from '../../services';
import { toast } from 'react-toastify';
import Buttons from '../../components/Button';
import { useNavigate } from 'react-router-dom';
import { Button, Modal, OverlayTrigger, Spinner, Tooltip } from 'react-bootstrap';

interface BankData {
    id: string;
    bankId: string;
    bankName: string;
    active: boolean;
}

interface FormData {
    id: string;
    bankId: string;
    bankName: string;
    active: boolean;
}

const BankManagement = () => {
    const [formData, setFormData] = useState<FormData>({ id: '', bankId: '', bankName: '', active: false });
    const [bankData, setBankData] = useState<BankData[]>([]);
    const [pending, setPending] = useState(true);
    const [searchTerm, setSearchTerm] = React.useState('');
    const navigate = useNavigate();
    const [selectedBank, setSelectedBank] = useState<BankData | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [action, setAction] = useState<'activate' | 'deactivate'>('activate');

    const connectedUsers: iUsersConnected = useSelector(
        (state: iUsersConnected) => state)

    const token = connectedUsers.token


    const fetchBankData = async () => {
        try {
            setPending(true)

            const payload = {
                serviceReference: 'GET_ALL_BANK',
                requestBody: ''
            }
            const response = await MKR_Services('GATEWAY', 'clientRecoveryApiService/request', 'POST', payload, token);
            console.log("response", response);

            if (response && response.body.meta.statusCode === 200) {
                setBankData(response.body.data);
            } else {
                console.error('Error fetching data');
            }
        } catch (error) {
            console.error('Error:', error);
        }
        setPending(false);

    };

    useEffect(() => { fetchBankData() }, []);


    const handleActivateDeactivate = (id: string, action: 'activate' | 'deactivate') => {
        setSelectedBank(bankData.find(bank => bank.id === id) || null);
        setAction(action);
        setShowStatusModal(true);
    };

    const confirmActivateDeactivate = async () => {
        if (!selectedBank) return;
        setPending(true);

        try {
            let payload = {};

            if (action === 'activate') {
                payload = {
                    serviceReference: 'ACTIVATE_RBANK',
                    requestBody: JSON.stringify({ id: selectedBank.id })
                };
            } else if (action === 'deactivate') {
                payload = {
                    serviceReference: 'DEACTIVATE_RBANK',
                    requestBody: JSON.stringify({ id: selectedBank.id })
                };
            }

            const response = await MKR_Services('GATEWAY', 'clientRecoveryApiService/request', 'POST', payload, token);
            console.log('Response:', response);

            if (response && response.body.meta.statusCode === 200) {
                toast.success(`Account ${action}d successfully.`);
                fetchBankData();
            } else {
                toast.error(response.body.errors || `Error ${action} account`);
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('An error occurred while trying to activate the account.');
        }
        setPending(false);
        setShowStatusModal(false);
    };

    const handleConfirmEditBank = async () => {
        try {
            setPending(true);
            const payload = {
                serviceReference: 'UPDATE_BANK',
                requestBody: JSON.stringify(formData)
            }
            const response = await MKR_Services('GATEWAY', 'clientRecoveryApiService/request', 'POST', payload, token);
            console.log("response", response);

            if (response && response.body.meta.statusCode === 200) {
                hideModalBank();
                await fetchBankData();

                toast.success('Bank updated successfully');
            } else {

                toast.error(response.body.errors || 'Error updating Bank');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('An error occurred while trying to update the Bank.');
        }
        setPending(false);
    };

    const handleConfirmDeleteBank = async () => {
        if (!selectedBank) return;
        setPending(true);
        try {
            const payload = {
                serviceReference: 'DELETE_BANK',
                requestBody: selectedBank.id
            };

            console.log("payload", payload);

            const response = await MKR_Services('GATEWAY', 'clientRecoveryApiService/request', 'POST', payload, token);
            console.log("response====", response);

            if (response && response.body.meta.statusCode === 200) {
                setShowDeleteModal(false);
                await fetchBankData();
                toast.success('Bank deleted successfully');
            } else if (response && response.status === 401) {
                toast.error('Error');
            }
            else {
                toast.error('Error deleting Bank');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('You cannot delete an active bank');
        }
        setPending(false);
    };


    const handleEdit = (bank: BankData) => {
        setSelectedBank(bank);
        setFormData({
            id: bank.id,
            bankId: bank.bankId,
            bankName: bank.bankName,
            active: bank.active
        });
        setShowModal(true);
    };

    const handleDelete = (bank: BankData) => {
        setSelectedBank(bank);
        setShowDeleteModal(true);
    };

    const hideModalBank = () => {
        setShowModal(false);

    };

    const handleChange = (e: { target: { name: string; value: any } }) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };
    const breadCrumb = [
        {
            name: "Home",
            link: "/dashboard",
            isActive: false
        },

        {
            name: "Bank Management",
            link: "",
            isActive: true
        }
    ];

    const columns = [
        // { name: 'Id', selector: (row: BankData) => row.id, sortable: true },
        { name: 'Bank Id', selector: (row: BankData) => row.bankId, sortable: true },
        { name: 'Bank Name', selector: (row: BankData) => row.bankName, sortable: true },
        {
            name: 'Status', cell: (row: BankData) =>
                <div>


                    <div className="form-check form-switch d-flex align-items-center">
                        <input
                            className="form-check-input p-0"
                            type="checkbox"
                            id={`activateDeactivateSwitch-${row.id}`}
                            checked={row.active}
                            onChange={() => handleActivateDeactivate(row.id, row.active ? 'deactivate' : 'activate')}

                        />
                        <label
                            className={`form-check-label mb-0 ms-1 ${row.active ? 'text-success' : 'text-danger'}`}
                            htmlFor={`activateDeactivateSwitch-${row.id}`}
                        >
                            {pending ? 'Loading...' : row.active ? 'Active' : 'Inactive'}
                        </label>
                    </div>

                </div>,

            sortable: true
        },

        {
            name: 'Actions',
            cell: (row: BankData) => (
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
                        <Button className='justify-content-center btn-danger' onClick={() => handleDelete(row)} >  <i className="ti-trash"></i>
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

    const filteredBanks = bankData ? bankData.filter((bank) =>
        Object.values(bank).some((field) =>
            typeof field === 'string' &&
            field.toLowerCase().includes(searchTerm.toLowerCase())
        )
    ) : [];

    const actionsMemo = useMemo(() => <ExportCSV data={bankData} />, [bankData]);

    return (
        <div>
            <div className=" pb-4 mb-0 d-lg-flex justify-content-between align-items-center">
                <div className="mb-1 mb-lg-0">
                    <div className="row">
                        <div className="col-lg-12 col-md-12 col-12">
                            <BreadCrumb name="Bank Management" links={breadCrumb} children={<></>} />
                        </div>
                    </div>
                </div>

            </div>
            <div className="col-12 grbankId-margin stretch-card">
                <div className="card">
                    <div className="card-body">
                        <div className="pb-4 mb-0 d-lg-flex justify-content-between align-items-center">
                            <div className="mb-1 mb-lg-0">
                                <h4 className="card-title">Banks List</h4>
                            </div>
                            <div className="d-flex">
                                <Buttons name='Add Bank' onClick={() => navigate('/addbank')} />
                            </div>
                        </div>
                        <DataTable
                            columns={columns}
                            data={filteredBanks}
                            pagination
                            progressPending={pending}
                            subHeader
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

            </div>

            <Modal show={showModal} onHide={hideModalBank} size='lg' >
                <Modal.Header closeButton>
                    <Modal.Title>Edit Bank </Modal.Title>
                </Modal.Header>


                <div className="card-body">
                    {/* <h4 className="card-title">Bank Information Form</h4> */}
                    <p className="card-description text-info">
                        Please fill out the form below with the relevant information.
                    </p>
                    <form className="forms-sample row">
                        <div className="form-group col-12">
                            <label htmlFor="formbankId">Id</label>
                            <input
                                type="text"
                                className="form-control"
                                id="formid"
                                name="id"
                                value={formData.id}
                                onChange={handleChange}
                                placeholder="Enter Id"
                                readOnly
                            />
                        </div>

                        <div className="form-group col-12">
                            <label htmlFor="formbankId">Bank Id</label>
                            <input
                                type="text"
                                className="form-control"
                                id="formbankId"
                                name="bankId"
                                value={formData.bankId}
                                onChange={handleChange}
                                placeholder="Enter bankId"
                            />
                        </div>

                        <div className="form-group col-12">
                            <label htmlFor="formbankName">Bank Name</label>
                            <input
                                type="text"
                                className="form-control"
                                id="formbankName"
                                name="bankName"
                                value={formData.bankName}
                                onChange={handleChange}
                                placeholder="Enter Bank Name"
                            />
                        </div>



                    </form>
                </div>

                <Modal.Footer>
                    <Button variant="secondary" onClick={hideModalBank}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={handleConfirmEditBank}>
                        {pending ? 'Loading...' : 'Save Changes'}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Activate/Deactivate Modal */}
            <Modal show={showStatusModal} onHide={() => setShowStatusModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>{action === 'activate' ? 'Activate Bank' : 'Deactivate Bank'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to {action} Bank {selectedBank?.bankName}?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowStatusModal(false)}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={confirmActivateDeactivate}>
                        {pending ? <Spinner animation="border" size="sm" /> : `${action.charAt(0).toUpperCase() + action.slice(1)}`}
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Delete</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to delete {selectedBank?.bankName}?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={handleConfirmDeleteBank}>{pending ? <Spinner animation="border" size="sm" /> : 'Delete'}</Button>
                </Modal.Footer>
            </Modal>
        </div>
    )
}

export default BankManagement
