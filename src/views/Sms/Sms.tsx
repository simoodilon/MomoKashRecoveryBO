import React, { useEffect, useMemo, useState } from 'react'
import { BreadCrumb } from '../../components';
import Buttons from '../../components/Button';
import { useNavigate } from 'react-router-dom';
import { iUsersConnected } from '../../features/usermanagement/users';
import { useSelector } from 'react-redux';
import DataTable from 'react-data-table-component';
import ExportCSV from '../../components/ExportCSV';
import { MKR_Services } from '../../services';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faCalendar } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import { Button, Form, Modal, Spinner } from 'react-bootstrap';


interface SmsData {
    id: string;
    smsTag: string,
    lawyerId: string,
    stringDate: string,
    numberOfSmsSend: number,
    numberOfDays: number,
    dateTime: string
}


interface SMSFormData {
    date: string,
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

const Sms = () => {
    const [searchTerm, setSearchTerm] = React.useState('');
    const [pending, setPending] = useState(true);
    const [smsData, setSmsData] = useState<SmsData[]>([]);
    const [smsDateData, setSmsDateData] = useState<SmsData[]>([]);
    const [formData, setFormData] = useState({
        lawyerId: '',
        date: ''
    })
    const [showModal, setShowModal] = useState(false);

    const [formSendSms, setSendSms] = useState<SMSFormData>({
        date: "",
    });
    const [formFilterSms, setFormDilterSms] = useState<SMSFormData>({
        date: "",
    });
    const [clientmsisdn, setclientmsisdn] = useState('');
    const [searchAttempted, setSearchAttempted] = useState(false);
    const [ClientSmsReportData, setClientSmsReportData] = useState<ClientSmsReportData[]>([]);


    const connectedUsers: iUsersConnected = useSelector(
        (state: iUsersConnected) => state)

    const token = connectedUsers.token
    const role = connectedUsers.roles;

    const formatDateSMS = (date: string) => {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${day}/${month}/${year}`;
    };

    const breadCrumb = [
        {
            name: "Home",
            link: "/dashboard",
            isActive: false
        },

        {
            name: "SMS Reports",
            link: "",
            isActive: true
        }
    ];

    const fetchSmsData = async () => {
        try {
            setPending(true)

            let payload = {}

            if (role === "ADMIN") {
                payload = {
                    serviceReference: 'GET_SMS_DATA',
                    requestBody: ''
                }
            } else if (role === "AVOCAT") {
                const formattedDate = formatDateSMS(formData.date);

                payload = {
                    serviceReference: 'GET_SMS_DATA_BY_LAWYER',
                    requestBody: JSON.stringify({
                        ...formData, date: formattedDate, lawyerId: connectedUsers.refId
                    }),
                }
            }
            else {
                payload = {
                    serviceReference: 'GET_SMS_DATA',
                    requestBody: ''
                }
            }

            const response = await MKR_Services('GATEWAY', 'clientRecoveryApiService/request', 'POST', payload, token);
            console.log("payload", payload);
            console.log("response", response);

            if (response && response.body.meta.statusCode === 200) {
                setSmsData(response.body.data);
                toast.success("SMS Reports fetched successfully");

            } else {
                console.error('Error fetching data');
            }
        } catch (error) {
            console.error('Error:', error);
        }
        setPending(false);

    };

    // useEffect(() => { fetchSmsData() }, []);

    const handleSendSMS = async (e: React.FormEvent) => {

        e.preventDefault(); // Prevent form submission

        setPending(true)

        try {
            const formattedDate = formatDateSMS(formSendSms.date);

            const payload = {
                serviceReference: 'SEND_SMS',
                requestBody: JSON.stringify({ ...formSendSms, date: formattedDate }),
            };

            const response = await MKR_Services('GATEWAY', 'clientRecoveryApiService/request', 'POST', payload, token);

            console.log("response222222", response);
            if (response && response.body.meta.statusCode === 200) {

                toast.success(response.body.meta.message || "All SMS Sent Successfully")
                handleToggleSMSModal()
            } else {
                toast.error("Error")
            }
        } catch (error) {
            console.log("Error", error)
        }


        setPending(false)
    }
    const FetchSentSMSDate = async (e: React.FormEvent) => {
        e.preventDefault(); // Prevent form submission
        setPending(true)

        try {
            const formattedDate = formatDateSMS(formFilterSms.date);

            const payload = {
                serviceReference: 'SENT_SMS_BY_DATE',
                requestBody: JSON.stringify({ ...formFilterSms, date: formattedDate }),
            };

            console.log("payload", payload);

            const response = await MKR_Services('GATEWAY', 'clientRecoveryApiService/request', 'POST', payload, token);

            console.log("response222222", response);
            if (response && response.body.meta.statusCode === 200) {
                setSmsDateData(response.body.data)
                toast.success(response.body.meta.message || "All SMS Sent Successfully")
            } else {
                toast.error("Error")
            }
        } catch (error) {
            console.log("Error", error)
        }


        setPending(false)
    }

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

    const handleToggleSMSModal = () => {
        setSendSms({
            date: ''
        });
        setShowModal(!showModal);
    };

    const handleChange = (e: { target: { name: any; value: any; }; }) => {
        const { name, value } = e.target

        setSendSms({
            ...formSendSms,
            [name]: value,
        });
    }
    const handleChangeSmsDate = (e: { target: { name: any; value: any; }; }) => {
        const { name, value } = e.target

        setFormDilterSms({
            ...formFilterSms,
            [name]: value,
        });
    }

    const formatSmsTag = (status: string) => {
        switch (status) {
            case 'sms68j':
                return 'SMS 68 JOURS';
            case 'sms77j':
                return 'SMS 77 JOURS';

            case 'sms85j':
                return 'SMS 85 JOURS';
            default:
                return status;
        }
    };

    const columns = [
        { name: 'Date', selector: (row: SmsData) => row.stringDate, sortable: true },
        { name: 'Lawyer Id', selector: (row: SmsData) => row.lawyerId, sortable: true },
        // { name: 'Number of Days', selector: (row: SmsData) => row.numberOfDays, sortable: true },
        { name: 'Sms Tag', selector: (row: SmsData) => formatSmsTag(row.smsTag), sortable: true },
        {
            name: 'Number of Sms Sent',
            selector: (row: SmsData) => row.numberOfSmsSend,
            sortable: true,
            cell: (row: SmsData) => (
                <div style={{ textAlign: 'center', marginLeft: "50px" }}>
                    {row.numberOfSmsSend}
                </div>
            )
        },
        // { name: 'Date Time', selector: (row: SmsData) => row.dateTime, sortable: true },
    ];

    const columnstwo = [
        { name: 'Date', selector: (row: SmsData) => row.stringDate, sortable: true },
        { name: 'Lawyer Id', selector: (row: SmsData) => row.lawyerId, sortable: true },
        { name: 'Number of Days', selector: (row: SmsData) => row.numberOfDays, sortable: true },
        { name: 'Sms Tag', selector: (row: SmsData) => formatSmsTag(row.smsTag), sortable: true },
        {
            name: 'Number of Sms Sent',
            selector: (row: SmsData) => row.numberOfSmsSend,
            sortable: true,
            cell: (row: SmsData) => (
                <div style={{ textAlign: 'center', marginLeft: "50px" }}>
                    {row.numberOfSmsSend}
                </div>
            )
        },             // { name: 'Date Time', selector: (row: SmsData) => row.dateTime, sortable: true },
    ];

    React.useEffect(() => {
        const timeout = setTimeout(() => {
            // setRows(columns);
            setPending(false);
        }, 2000);
        return () => clearTimeout(timeout);
    }, []);

    const filteredSms = smsData ? smsData.filter((sms) =>
        Object.values(sms).some((field) =>
            typeof field === 'string' &&
            field.toLowerCase().includes(searchTerm.toLowerCase())
        )
    ) : [];


    const actionsMemo = useMemo(() => <ExportCSV data={smsData} />, [smsData]);

    const toSentenceCase = (str: string) => {
        if (!str) return str;
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    };

    const resetCLoanMsisdn = (e: any) => {
        e.preventDefault(); // Prevent form submission
        setclientmsisdn('')
        setClientSmsReportData([]);
        setSearchAttempted(false);
    };
    return (
        <div className="sms-management-container">
            <div className="header-section mb-4">
                <BreadCrumb name="SMS Reports" links={breadCrumb} children={<></>} />
            </div>

            <div className="card">
                <div className="card-body">
                    <div className="pb-4 mb-0 d-lg-flex justify-content-between align-items-center">
                        <div className="mb-1 mb-lg-0">
                            <div className="row">
                                <div className="col-lg-12 col-md-12 col-12">
                                    <h4 className="card-title mb-4">SMS Report List</h4>
                                </div>
                            </div>
                        </div>
                        {role === "ADMIN" &&
                            <div className="d-flex">
                                <Buttons name='Send Sms' onClick={handleToggleSMSModal} />
                            </div>
                        }
                    </div>

                    <ul className="nav nav-tabs" id="myTab" role="tablist">
                        <li className="nav-item" role="presentation">
                            <button className="nav-link active" id="home-tab" data-bs-toggle="tab" data-bs-target="#home" type="button" role="tab" aria-controls="home" aria-selected="true">ALL Sent Sms</button>
                        </li>
                        {role === "ADMIN" &&

                            <li className="nav-item" role="presentation">
                                <button className="nav-link" id="profile-tab" data-bs-toggle="tab" data-bs-target="#profile" type="button" role="tab" aria-controls="profile" aria-selected="false">Filter by Date</button>
                            </li>}

                        <li className="nav-item" role="presentation">
                            <button className="nav-link " id="client-tab" data-bs-toggle="tab" data-bs-target="#client" type="button" role="tab" aria-controls="client" aria-selected="false">Filter Sms By Client</button>
                        </li>

                    </ul>
                    <div className="tab-content" id="myTabContent">

                        <div className="tab-pane fade show active" id="home" role="tabpanel" aria-labelledby="home-tab">

                            {role === "AVOCAT" && (

                                <div >

                                    <div className="pb-4 mt-2 d-lg-flex justify-content-between align-items-center">
                                        <div className=" mb-lg-0">
                                            <div className="row">
                                                <div className="col-lg-12 col-md-12 col-12">
                                                    <h4 className="card-title">SMS Report Filter</h4>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="d-flex">
                                            {pending ? <div className='text-center ' ><Spinner variant='primary' size='sm' /> </div> :
                                                <Buttons
                                                    name="Search"
                                                    onClick={fetchSmsData}
                                                    className="btn btn-primary btn-lg"
                                                    icon={faSearch}
                                                />
                                            }

                                        </div>
                                    </div>



                                    <div className="row align-items-end">
                                        <div className="col-md-12 mb-3">
                                            <label className="form-label">
                                                <FontAwesomeIcon icon={faCalendar} className="me-2" />
                                                <span className='text-info'> *First choose a date then search to view all Sms reports sent</span>
                                            </label>
                                            <input
                                                type="date"
                                                className="form-control"
                                                value={formData.date}
                                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                            />
                                        </div>

                                    </div>


                                </div>
                            )}

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



                        <div className="tab-pane fade" id="profile" role="tabpanel" aria-labelledby="profile-tab">
                            <Form>
                                <div>
                                    <label>
                                        Date
                                    </label>
                                    <input className='form-control' id='date' type='date' name='date' value={formFilterSms.date} onChange={handleChangeSmsDate} />
                                </div>
                            </Form>
                            <div className="d-flex justify-content-end mt-3">

                            </div>
                            <Button variant="primary" onClick={FetchSentSMSDate}>
                                <FontAwesomeIcon icon={faSearch} />
                                {pending ? 'Loading...' : "Find"}
                            </Button>
                            <DataTable
                                columns={columnstwo}
                                data={smsDateData}
                                pagination
                                progressPending={pending}

                            />
                        </div>

                        <div className="tab-pane fade show" id="client" role="tabpanel" aria-labelledby="client-tab">
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

            <Modal show={showModal} onHide={handleToggleSMSModal} size='lg' >
                <Modal.Header closeButton>
                    <Modal.Title>Send SMS</Modal.Title>
                </Modal.Header>


                <div className="card-body">
                    {/* <h4 className="card-title">Lawyer Information Form</h4> */}
                    <p className="card-description text-info">
                        Please enter the Date which you want to send the SMS
                    </p>
                    <Form>
                        <div>
                            <label>
                                Date
                            </label>
                            <input className='form-control' id='date' type='date' name='date' value={formSendSms.date} onChange={handleChange} />
                        </div>
                    </Form>
                </div>

                <Modal.Footer>
                    <Button variant="secondary" onClick={handleToggleSMSModal}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={handleSendSMS}>
                        {pending ? 'Loading...' : "Send SMS"}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    )
}

export default Sms
