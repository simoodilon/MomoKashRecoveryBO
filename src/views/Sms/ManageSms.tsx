import React, { useEffect, useMemo, useState } from 'react'
import DataTable from 'react-data-table-component'
import { BreadCrumb } from '../../components'
import Buttons from '../../components/Button';
import { Button, Modal, OverlayTrigger, Spinner, Tooltip } from 'react-bootstrap';
import { MKR_Services } from '../../services';
import { iUsersConnected } from '../../features/usermanagement/users';
import { useSelector } from 'react-redux';
import ExportCSV from '../../components/ExportCSV';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';

interface ManageSmsData {

    id: string;
    messageFr: string;
    messageEn: string;
}
interface ClientSmsReportData {
    id: string;
    loanId: string;
    msisdn: string,
    smsTag: string,
    status: string,
    lawyerId: string,
    numberOfDays: string,
    dateTime: string

}

interface FormData {
    id: string;
    messageFr: string;
    messageEn: string;
}

const ManageSms = () => {
    const [formData, setFormData] = useState<FormData>({
        id: "",
        messageFr: "",
        messageEn: ""

    });
    const [clientmsisdn, setclientmsisdn] = useState('');
    const [pending, setPending] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [smsData, setSmsData] = useState<ManageSmsData[]>([]);
    const [ClientSmsReportData, setClientSmsReportData] = useState<ClientSmsReportData[]>([]);
    const [selectedSms, setSelectedSms] = useState<ManageSmsData | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [searchAttempted, setSearchAttempted] = useState(false);


    const handleToggleSmsModal = () => {
        setFormData({
            id: "",
            messageFr: "",
            messageEn: ""
        });
        setShowModal(!showModal);
    };

    const hideModalSms = () => {
        setShowModal(false);

    };

    const filteredSms = smsData ? smsData.filter((sms) =>
        Object.values(sms).some((field) =>
            typeof field === 'string' &&
            field.toLowerCase().includes(searchTerm.toLowerCase())
        )
    ) : [];

    const connectedUsers: iUsersConnected = useSelector(
        (state: iUsersConnected) => state
    );

    const token = connectedUsers.token;
    const role = connectedUsers.roles;

    const handleEdit = (sms: ManageSmsData) => {
        setSelectedSms(sms);
        setFormData({
            id: sms.id,
            messageFr: sms.messageFr,
            messageEn: sms.messageEn

        });
        setShowModal(true);
    };

    const handleDelete = (lawyer: ManageSmsData) => {
        setSelectedSms(lawyer);
        setShowDeleteModal(true);
    };

    const fetchSmsData = async () => {
        try {

            const payload = {
                serviceReference: 'GET_ALL_SMS_LIST',
                requestBody: ''
            }
            const response = await MKR_Services('GATEWAY', 'clientRecoveryApiService/request', 'POST', payload, token);
            console.log("response===", response);

            if (response && response.body.meta.statusCode === 200) {
                setSmsData(response.body.data);
                // toast.success('Lawyers data fetched successfully');
            } else {
                console.error('Error fetching data');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };
    const fetchClientSmsReportData = async () => {
        setPending(true);
        try {

            const payload = {
                serviceReference: 'GET_CLIENT_SMS_REPORT',
                requestBody: clientmsisdn
            }

            console.log("payload===", payload);

            const response = await MKR_Services('GATEWAY', 'clientRecoveryApiService/request', 'POST', payload, token);
            console.log("response===", response);

            if (response && response.body.meta.statusCode === 200) {
                setClientSmsReportData(response.body.data[0]);
                setSearchAttempted(true);

                toast.success('Client Report data fetched successfully');
            } else {
                console.error('Error fetching data');
            }
        } catch (error) {
            console.error('Error:', error);
        }
        setPending(false);
    };

    useEffect(() => {
        fetchSmsData();

        if (!showModal) {
            setSelectedSms(null);
        }

    }, [showModal]);

    const toSentenceCase = (str: string) => {
        if (!str) return str;
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    };


    const handleConfirmAddEditSMS = async () => {
        try {
            setPending(true);
            const payload = {
                serviceReference: 'ADD_EDIT_SMS',
                requestBody: JSON.stringify(formData)
            }
            const response = await MKR_Services('GATEWAY', 'clientRecoveryApiService/request', 'POST', payload, token);
            console.log("adddresponse", response);
            console.log("payload", payload);
            console.log("pformDataayload", formData);

            if (response && response.body.meta.statusCode === 200) {
                hideModalSms();
                await fetchSmsData();
                toast.success(response.body.meta.message || 'Successfull');
            } else if (response && response.body.meta.statusCode === 400) {
                toast.error(response.body.meta.message || 'Check your inputs');
            }
            else {
                toast.error(response.body.meta.message || 'Error');
            }
        } catch (error) {
            console.error('Error:', error);

            toast.error('Error adding Sms');

        }
        setPending(false);
    };

    const handleConfirmDeleteSms = async () => {
        if (!selectedSms) return;
        setPending(true);
        try {
            const payload = {
                serviceReference: 'DELETE_SMS',
                requestBody: selectedSms?.id
            };

            console.log("payload", payload);
            const response = await MKR_Services('GATEWAY', 'clientRecoveryApiService/request', 'POST', payload, token);
            console.log("response====", response);

            if (response && response.body.meta.statusCode === 200) {
                setShowDeleteModal(false);
                await fetchSmsData();
                toast.success('Sms deleted successfully');
            } else if (response && response.body.meta.statusCode === 1002) {
                toast.error(response.body.meta.message || "Error");
            }

            else {
                toast.error('Error deleting Sms');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Error deleting Sms');
        }
        setPending(false);
    };



    const handleChange = (e: { target: { name: string; value: any } }) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const resetCLoanMsisdn = (e: any) => {
        e.preventDefault(); // Prevent form submission
        setclientmsisdn('')
        setClientSmsReportData([]);
        setSearchAttempted(false);
    };


    const breadCrumb = [
        {
            name: "Home",
            link: "/dashboard",
            isActive: false
        },

        {
            name: "SMS Management",
            link: "",
            isActive: true
        }
    ];

    const columns = [
        // { name: 'ID', selector: (row: ManageSms) => row.id, sortable: true },
        { name: 'Message FR', selector: (row: ManageSmsData) => row.messageFr, sortable: true },
        { name: 'Message EN', selector: (row: ManageSmsData) => row.messageEn, sortable: true },
        {
            name: 'Actions',
            cell: (row: ManageSmsData) => (
                <>
                    <OverlayTrigger placement="right" overlay={<Tooltip id="tooltip-export">Edit</Tooltip>}>
                        <Button className='justify-content-center me-1' onClick={() => handleEdit(row)}>
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

    useEffect(() => {
        const timeout = setTimeout(() => {
            setPending(false);
        }, 2000);
        return () => clearTimeout(timeout);
    }, []);

    const actionsMemo = useMemo(() => <ExportCSV data={smsData} />, [smsData]);


    return (
        <div>
            <div className="pb-1 mb-0 d-lg-flex justify-content-between align-items-center">
                <div className="mb-1 mb-lg-0">
                    <div className="row">
                        <div className="col-lg-12 col-md-12 col-12">
                            <BreadCrumb name="Sms Management" links={breadCrumb} children={<></>} />
                        </div>
                    </div>

                </div>
            </div>

            <div className="card">
                <div className="card-body">
                    <ul className="nav nav-tabs" id="myTab" role="tablist">

                        <li className="nav-item" role="presentation">
                            <button className="nav-link active" id="profile-tab" data-bs-toggle="tab" data-bs-target="#profile" type="button" role="tab" aria-controls="profile" aria-selected="true">SMS</button>
                        </li>


                        {/* <li className="nav-item" role="presentation">
                            <button className="nav-link " id="home-tab" data-bs-toggle="tab" data-bs-target="#home" type="button" role="tab" aria-controls="home" aria-selected="false">Filter Sms By Client</button>
                        </li> */}
                    </ul>

                    <div className="tab-content" id="myTabContent">

                        <div className="tab-pane fade show active" id="profile" role="tabpanel" aria-labelledby="profile-tab">

                            <div className="pb-4 mb-0 d-lg-flex justify-content-between align-items-center">
                                <div className="mb-1 mb-lg-0">
                                    <div className="row">
                                        <div className="col-lg-12 col-md-12 col-12">
                                            <h4 className="card-title">Sms Table</h4>
                                        </div>
                                    </div>
                                </div>
                                <div className="d-flex">
                                    <Buttons name='New Sms' onClick={handleToggleSmsModal} />
                                </div>
                            </div>
                            <DataTable
                                columns={columns}
                                data={filteredSms}
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

                        <div className="tab-pane fade show" id="home" role="tabpanel" aria-labelledby="home-tab">
                            <p className="card-description">
                                Filter SMS
                            </p>
                            <form className="forms-sample">
                                <div className="form-group ">
                                    <label htmlFor="formLawyerName">Client Msisdn</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="formMsisdn"
                                        name="msisdn"
                                        value={clientmsisdn}
                                        onChange={(e) => setclientmsisdn(e.target.value)}
                                        placeholder="Enter Client Msisdn"
                                    />
                                </div>
                                <Button variant="primary" onClick={fetchClientSmsReportData}>
                                    <FontAwesomeIcon icon={faSearch} />
                                    {pending ? 'Loading...' : "Find"}
                                </Button>
                                <button className="btn btn-light ml-2" onClick={resetCLoanMsisdn}>Reset</button>

                                {searchAttempted && (
                                    ClientSmsReportData ? (
                                        <div className='row  mt-3'>
                                            <div className="col-md-6">
                                                {Object.entries(ClientSmsReportData).slice(0, Math.ceil(Object.entries(ClientSmsReportData).length / 2)).map(([key, value]) => (
                                                    <div key={key} className="mb-3">
                                                        <h6 className="text-muted mb-1">{toSentenceCase(key)}:</h6>
                                                        <p className="font-weight-bold">{value !== null && value !== undefined ? value.toString() : 'N/A'}</p>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="col-md-6">
                                                {Object.entries(ClientSmsReportData).slice(Math.ceil(Object.entries(ClientSmsReportData).length / 2)).map(([key, value]) => (
                                                    <div key={key} className="mb-3">
                                                        <h6 className="text-muted mb-1">{toSentenceCase(key)}:</h6>
                                                        <p className="font-weight-bold">{value !== null && value !== undefined ? value.toString() : 'N/A'}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="alert alert-info mt-3" role="alert">
                                            No data available for this client
                                        </div>
                                    )
                                )}



                            </form>

                        </div>

                    </div>





                </div>
            </div>

            <Modal show={showModal} onHide={hideModalSms} size='lg' >
                <Modal.Header closeButton>
                    <Modal.Title>{selectedSms ? 'Edit Sms' : 'Create Sms'}</Modal.Title>
                </Modal.Header>


                <div className="card-body">
                    {/* <h4 className="card-title">Lawyer Information Form</h4> */}
                    <p className="card-description text-info">
                        Please fill out the form below with the relevant information.
                    </p>
                    <form className="forms-sample row">
                        {!selectedSms &&
                            <div className="form-group col-12">
                                <label htmlFor="id">Id</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="id"
                                    name="id"
                                    value={formData.id}
                                    onChange={handleChange}
                                    placeholder="Enter Id"
                                />
                            </div>
                        }


                        <div className="form-group col-12">
                            <label htmlFor="messageFr">Message in French</label>

                            <textarea
                                className="form-control"
                                id="messageFr"
                                name="messageFr"
                                value={formData.messageFr}
                                onChange={handleChange}
                                placeholder="Enter Message in French"
                            />
                        </div>
                        <div className="form-group col-12">
                            <label htmlFor="messageEn">Message in English</label>

                            <textarea
                                className="form-control"
                                id="messageEn"
                                name="messageEn"
                                value={formData.messageEn}
                                onChange={handleChange}
                                placeholder="Enter Message in English"
                            />
                        </div>
                    </form>
                </div>

                <Modal.Footer>

                    <Button variant="primary" onClick={selectedSms ? handleConfirmAddEditSMS : handleConfirmAddEditSMS}>
                        {pending ? 'Loading...' : selectedSms ? 'Save Changes' : 'Add Sms'}
                    </Button>
                    <Button variant="secondary" onClick={hideModalSms}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Delete</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to delete {selectedSms?.id}?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={handleConfirmDeleteSms}>{pending ? <Spinner animation="border" size="sm" /> : 'Delete'}</Button>
                </Modal.Footer>
            </Modal>
        </div>
    )
}

export default ManageSms
