import React, { useEffect, useMemo, useState } from 'react';
import { Spinner } from 'react-bootstrap';
import { BreadCrumb } from '../../components';
import { useLocation, useNavigate } from 'react-router-dom';
import { iUsersConnected } from '../../features/usermanagement/users';
import { useSelector } from 'react-redux';
import { MKR_Services } from '../../services';
import { toast } from 'react-toastify';
import { ClientHistory, ClientHistoryData, ClientStatusbyLawyer, ClientStatusResponse, InactiveAndActiveloans, InactiveAndActiveloansResponse } from './LoansInterface';
import DataTable from 'react-data-table-component';
import ExportCSV from '../../components/ExportCSV';
import { LawyerData } from '../lawyers/Lawyers';
import ExportPDF from '../../components/ExportPDF';


const Category = () => {
    const navigate = useNavigate();
    const [pending, setPending] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('profile');

    const [ClientStatusbyLawyer, setClientStatusbyLawyer] = useState<ClientStatusbyLawyer>({
        msisdn: '',
        lawyerId: '',
    });
    const [ClientHistory, setClientHistory] = useState<ClientHistory>({
        msisdn: '',

    });

    const [InactiveAndActiveloans, setInactiveAndActiveloans] = useState<InactiveAndActiveloans>({
        active: false,
        page: 0,
        size: 0
    });

    const [lawyersData, setLawyersData] = useState<LawyerData[]>([]);
    const [searchAttempted, setSearchAttempted] = useState(false);


    const [ClientHistoryData, setClientHistoryData] = useState<ClientHistoryData[]>([]); // New state variable for response data
    const [InactiveAndActiveloansData, setInactiveAndActiveloansData] = useState<InactiveAndActiveloansResponse[]>([]); // New state variable for response data

    const connectedUsers: iUsersConnected = useSelector(
        (state: iUsersConnected) => state
    );
    const location = useLocation();



    const token = connectedUsers.token;
    const role = connectedUsers.roles;

    // const filteredClientHistoryData = ClientHistoryData ? ClientHistoryData.filter((refund) =>
    //     Object.values(refund).some((field) =>
    //         typeof field === 'string' &&
    //         field.toLowerCase().includes(searchTerm.toLowerCase())
    //     )
    // ) : [];

    const filteredInactiveAndActiveloans = InactiveAndActiveloansData ? InactiveAndActiveloansData.filter((loan) =>
        Object.values(loan).some((field) =>
            typeof field === 'string' &&
            field.toLowerCase().includes(searchTerm.toLowerCase())
        )
    ) : [];

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const msisdn = queryParams.get('msisdn');
        if (msisdn) {
            setClientHistory({ msisdn });
            handleClientHistory(null, msisdn);
            setActiveTab('home'); // Set the active tab to 'home' (Client History)

        }
    }, [location]);


    const handleActiveInactiveloans = async (e: React.FormEvent) => {
        e.preventDefault(); // Prevent form submission
        setPending(true);
        try {

            const payload = {
                serviceReference: 'GET_ACTIVE_INACTIVE_LOANS',
                requestBody: JSON.stringify(InactiveAndActiveloans),
            };

            console.log("payload", payload);

            const response = await MKR_Services('GATEWAY', 'clientRecoveryApiService/request', 'POST', payload, token);

            console.log("response", response);
            console.log("InactiveAndActiveloans", InactiveAndActiveloans);

            if (response && response.body.meta.statusCode === 200) {
                toast.success(response.body.meta.message);
                setInactiveAndActiveloansData(response.body.data as InactiveAndActiveloansResponse[]);

            } else {
                toast.error(response.body.meta.message || "Error");
            }
        } catch (error) {
            console.log("Error", error);
            toast.error("Unauthorized.Check if User has access to this service");
        }


        setPending(false);
    };

    const handleClientHistory = async (e: React.FormEvent | null, msisdn?: string) => {
        if (e) e.preventDefault();
        setPending(true);
        try {
            let payload = {}
            const msisdnToUse = msisdn || ClientHistory.msisdn;
            if (role === "ADMIN") {
                payload = {
                    serviceReference: 'GET_CLIENT_HISTORY',
                    requestBody: msisdnToUse,
                };
            } else if (role === "AVOCAT") {
                payload = {
                    serviceReference: 'GET_CLIENT_HISTORY_BY_LAWYER',
                    requestBody: JSON.stringify({
                        msisdn: msisdnToUse,
                        lawyerId: connectedUsers.refId
                    }),
                }
            }
            else {
                payload = {
                    serviceReference: 'GET_CLIENT_HISTORY',
                    requestBody: msisdnToUse,
                };
            }

            console.log("payload", payload);

            const response = await MKR_Services('GATEWAY', 'clientRecoveryApiService/request', 'POST', payload, token);

            console.log("response======", response);
            console.log("ClientHistory", ClientHistory);
            setSearchAttempted(true);
            if (response && response.body.meta.statusCode === 200) {
                toast.success(response.body.meta.message);
                setClientHistoryData(response.body.data);

            } else {
                toast.error(response.body.meta.message || "Error");
            }
        } catch (error) {
            console.log("Error", error);
            toast.error("Error Check Permissions");
        }
        setPending(false);
    };

    const handleChange = (e: { target: { name: any; value: any; }; }, stateType: 'ClientStatusbyLawyer' | 'ClientHistory' | 'InactiveAndActiveloans') => {
        const { name, value } = e.target;
        if (stateType === 'ClientStatusbyLawyer') {
            setClientStatusbyLawyer(prevState => ({
                ...prevState,
                [name]: value,
                lawyerId: connectedUsers.refId,
            }));
        } else if (stateType === 'ClientHistory') {
            setClientHistory(prevState => ({
                ...prevState,
                [name]: value,
            }));
        } else if (stateType === 'InactiveAndActiveloans') {
            setInactiveAndActiveloans(prevState => ({
                ...prevState,
                [name]: value,
            }));
        }
    };

    const fetchLawyersData = async () => {
        try {

            const payload = {
                serviceReference: 'GET_ALL_LAWYERS',
                requestBody: ''
            }
            const response = await MKR_Services('GATEWAY', 'clientRecoveryApiService/request', 'POST', payload, token);
            console.log("response", response);

            if (response && response.body.meta.statusCode === 200) {
                setLawyersData(response.body.data);
                // toast.success('Lawyers data fetched successfully');
            } else {
                console.error('Error fetching data');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    useEffect(() => { fetchLawyersData(); }, []);



    const formatDate = (dateTime: string | number | Date): string => {
        const d = new Date(dateTime);

        // console.log("trydate", dateTime);
        let month = '' + (d.getMonth() + 1);
        let day = '' + d.getDate();
        let year = d.getFullYear();
        let hour = d.getHours();
        let minutes = d.getMinutes();
        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;

        // console.log("d", d);
        let hours = [hour, minutes].join(':');
        let days = [year, month, day].join('-');

        return [days].join(' ');
    }


    const formatLoanStatus = (status: string) => {
        switch (status) {
            case 'isCarryOver':
                return 'Auto Debit';
            case 'Normal':
                return 'Normal Period';
            default:
                return status;
        }
    };

    const resetClientHistory = async (e: any) => {
        e.preventDefault(); // Prevent form submission
        setClientHistory({
            msisdn: '',

        });
        setClientHistoryData([]);
        setSearchAttempted(false)
    };

    const resetInactiveAndActiveLoans = async (e: any) => {
        e.preventDefault(); // Prevent form submission

        setInactiveAndActiveloans({
            active: false,
            page: 0,
            size: 0
        });
        setInactiveAndActiveloansData([]);
    };


    const breadCrumb = [
        {
            name: "Home",
            link: "/dashboard",
            isActive: false
        },
        {
            name: "Loans",
            link: "/loans",
            isActive: false
        },
        {
            name: "Loan Details",
            link: "",
            isActive: true
        }
    ];

    const groupByLoanId = (data: ClientHistoryData[]) => {
        return data.reduce((acc, item) => {
            const key = item.loanId;
            if (!acc[key]) {
                acc[key] = [];
            }
            acc[key].push(item);
            return acc;
        }, {} as Record<string, ClientHistoryData[]>);
    };

    const columns = [
        { name: 'Loan ID', selector: (row: InactiveAndActiveloansResponse) => row.loanId, sortable: true },
        { name: 'Client Name', selector: (row: InactiveAndActiveloansResponse) => row.clientName, sortable: true },
        { name: 'Loan Amount', selector: (row: InactiveAndActiveloansResponse) => row.loanAmount, sortable: true },
        {
            name: 'Loan Status',
            selector: (row: InactiveAndActiveloansResponse) => formatLoanStatus(row.loanStatus),
            sortable: true,
        }, { name: 'Amount Paid On Loan', selector: (row: InactiveAndActiveloansResponse) => row.amountPaidOnLoan, sortable: true },
        { name: 'Debt', selector: (row: InactiveAndActiveloansResponse) => row.debt, sortable: true },
        { name: 'Recovery Fee', selector: (row: InactiveAndActiveloansResponse) => row.recoveryFee, sortable: true },
        { name: 'Penalty Debt', selector: (row: InactiveAndActiveloansResponse) => row.penaltyDebt, sortable: true },
        // { name: 'Bank Name', selector: (row: InactiveAndActiveloansResponse) => row.bankName, sortable: true },
        // { name: 'Subscription Date', selector: (row: InactiveAndActiveloansResponse) => row.subscriptionDate, sortable: true },
        // { name: 'Unsubscription Date', selector: (row: InactiveAndActiveloansResponse) => row.unSubscriptionDate, sortable: true },
        { name: 'Resubscription Date', selector: (row: InactiveAndActiveloansResponse) => row.reSubscriptionDate, sortable: true },
        { name: 'Loan Date', selector: (row: InactiveAndActiveloansResponse) => row.loanDate, sortable: true },
        { name: 'Penalty Date', selector: (row: InactiveAndActiveloansResponse) => row.penaltyDate, sortable: true },
        // { name: 'Date of Birth', selector: (row: InactiveAndActiveloansResponse) => row.dateOfBirth, sortable: true },
        // { name: 'Email', selector: (row: InactiveAndActiveloansResponse) => row.email, sortable: true },
        { name: 'Active', selector: (row: InactiveAndActiveloansResponse) => row.active ? 'Yes' : 'No', sortable: true },
        { name: 'Date Time', selector: (row: InactiveAndActiveloansResponse) => formatDate(row.dateTime), sortable: true },
    ];

    const columnstwo = [
        { name: 'Date Time', selector: (row: ClientHistoryData) => formatDate(row.dateTime), sortable: true },
        // { name: 'MSISDN', selector: (row: ClientHistoryData) => row.msisdn, sortable: true },
        { name: 'Type', selector: (row: ClientHistoryData) => row.type, sortable: true },
        // { name: 'Momo Transaction ID', selector: (row: ClientHistoryData) => row.momoTransactionId, sortable: true },
        // { name: 'Bank ID', selector: (row: ClientHistoryData) => row.bankId, sortable: true },
        { name: 'Bank Name', selector: (row: ClientHistoryData) => row.bankName, sortable: true },
        // { name: 'Name', selector: (row: ClientHistoryData) => row.name, sortable: true },
        // { name: 'Amount', selector: (row: ClientHistoryData) => row.amount, sortable: true },
        { name: 'Credit', selector: (row: ClientHistoryData) => row.credit, sortable: true },
        { name: 'Debit', selector: (row: ClientHistoryData) => row.debit, sortable: true },
        { name: 'Balance', selector: (row: ClientHistoryData) => row.balance, sortable: true },
    ];

    React.useEffect(() => {
        const timeout = setTimeout(() => {
            // setRows(columns);
            setPending(false);
        }, 2000);
        return () => clearTimeout(timeout);
    }, []);

    const actionsMemo = useMemo(() => <ExportCSV data={InactiveAndActiveloansData} />, [InactiveAndActiveloansData]);
    const actionsMemoRefund = useMemo(() => <ExportCSV data={ClientHistoryData} className="btn btn-secondary btn-sm text-white" name="Download CSV" />, [ClientHistoryData]);

    const clientHistoryColumns = [
        { header: 'Date Time', dataKey: 'dateTime' },
        { header: 'Type', dataKey: 'type' },
        { header: 'Momo Transaction ID', dataKey: 'momoTransactionId' },
        { header: 'Bank Name', dataKey: 'bankName' },
        { header: 'Credit', dataKey: 'credit' },
        { header: 'Debit', dataKey: 'debit' },
        { header: 'Balance', dataKey: 'balance' },
    ];

    return (
        <div>
            <div className="pb-0 mb-0 d-lg-flex justify-content-between align-items-center">
                <div className="mb-1 mb-lg-0">
                    <div className="row">
                        <div className="col-lg-12 col-md-12 col-12">
                            <BreadCrumb name=" Details" links={breadCrumb} children={<></>} />
                        </div>
                    </div>
                </div>
            </div>
            <div className="col-12 grid-margin stretch-card">
                <div className="card">
                    <div className="card-body">
                        <h4 className="card-title">Details</h4>

                        <ul className="nav nav-tabs" id="myTab" role="tablist">

                            <li className="nav-item" role="presentation">
                                {/* <button className="nav-link active" id="profile-tab" data-bs-toggle="tab" data-bs-target="#profile" type="button" role="tab" aria-controls="profile" aria-selected="true">All Active/Inactive loans</button> */}

                                <button
                                    className={`nav-link ${activeTab === 'profile' ? 'active' : ''}`}
                                    id="profile-tab"
                                    data-bs-toggle="tab"
                                    data-bs-target="#profile"
                                    type="button"
                                    role="tab"
                                    aria-controls="profile"
                                    aria-selected={activeTab === 'profile'}
                                    onClick={() => setActiveTab('profile')}
                                >
                                    All Active/Inactive loans
                                </button>
                            </li>


                            <li className="nav-item" role="presentation">
                                {/* <button className="nav-link " id="home-tab" data-bs-toggle="tab" data-bs-target="#home" type="button" role="tab" aria-controls="home" aria-selected="false">Client History</button> */}

                                <button
                                    className={`nav-link ${activeTab === 'home' ? 'active' : ''}`}
                                    id="home-tab"
                                    data-bs-toggle="tab"
                                    data-bs-target="#home"
                                    type="button"
                                    role="tab"
                                    aria-controls="home"
                                    aria-selected={activeTab === 'home'}
                                    onClick={() => setActiveTab('home')}
                                >
                                    Client History
                                </button>
                            </li>
                        </ul>
                        <div className="tab-content" id="myTabContent">

                            {/* <div className="tab-pane fade show active" id="profile" role="tabpanel" aria-labelledby="profile-tab"> */}
                            <div className={`tab-pane fade ${activeTab === 'profile' ? 'show active' : ''}`} id="profile" role="tabpanel" aria-labelledby="profile-tab">

                                <form className="forms-sample">
                                    <div className="form-group">
                                        <label htmlFor="exampleInputName1">Page</label>
                                        <input type="text" className="form-control" id="exampleInputName1" placeholder="page" name='page' value={InactiveAndActiveloans.page} onChange={(e) => handleChange(e, 'InactiveAndActiveloans')} />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="exampleInputName1">Size</label>
                                        <input type="text" className="form-control" id="exampleInputName1" placeholder="size" name='size' value={InactiveAndActiveloans.size} onChange={(e) => handleChange(e, 'InactiveAndActiveloans')} />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="exampleInputName1" className='me-4'>Active</label>
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            id="active"
                                            name="active"
                                            checked={InactiveAndActiveloans.active}
                                            onChange={(e) => setInactiveAndActiveloans({ ...InactiveAndActiveloans, active: e.target.checked })}
                                        />
                                    </div>
                                    <button className="btn btn-primary mr-2" style={{ backgroundColor: "#4B49AC" }} onClick={handleActiveInactiveloans}>
                                        {pending ? <div className='text-center'><Spinner /></div> : "Search"}
                                    </button>
                                    <button className="btn btn-light" onClick={resetInactiveAndActiveLoans}>Reset</button>


                                </form>
                                {/* Display the InactiveAndActiveloansResponse data */}
                                {InactiveAndActiveloansData.length > 0 && (
                                    <DataTable
                                        columns={columns}
                                        data={filteredInactiveAndActiveloans}
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
                                )}
                            </div>

                            {/* <div className="tab-pane fade show" id="home" role="tabpanel" aria-labelledby="home-tab"> */}
                            <div className={`tab-pane fade ${activeTab === 'home' ? 'show active' : ''}`} id="home" role="tabpanel" aria-labelledby="home-tab">

                                <p className="card-description">
                                    Filter Loans
                                </p>
                                <form className="forms-sample">
                                    <div className="form-group">
                                        <label htmlFor="exampleInputName1">Msisdn</label>
                                        <input type="text" className="form-control" id="exampleInputName1" placeholder="Msisdn" name='msisdn' value={ClientHistory.msisdn} onChange={(e) => handleChange(e, 'ClientHistory')} />
                                    </div>


                                    <button className="btn btn-primary mr-2" style={{ backgroundColor: "#4B49AC" }} onClick={handleClientHistory}>
                                        {pending ? <div className='text-center'><Spinner /></div> : "Search"}
                                    </button>
                                    <button className="btn btn-light" onClick={resetClientHistory}>Reset</button>
                                </form>



                                {searchAttempted && (
                                    ClientHistoryData.length > 0 ? (
                                        <div className="client-history-container">
                                            {Object.entries(groupByLoanId(ClientHistoryData)).map(([loanId, data], index) => (
                                                <div key={loanId} className="loan-group mb-5">
                                                    {index === 0 && (
                                                        <div className="client-info-card mb-4 p-4 mt-4 bg-light rounded shadow-sm">
                                                            <div className="d-flex justify-content-between align-items-center">
                                                                <div>
                                                                    <h4 className="mt-0">{data[0].name}</h4>
                                                                    <p className="text-muted mb-0">MSISDN: {data[0].msisdn}</p>
                                                                </div>
                                                                <div className="loan-count d-flex justify-content-between align-items-center">
                                                                    <span className="badge bg-primary rounded-pill " style={{ padding: "10px 10px 10px 10px" }}>
                                                                        {Object.keys(groupByLoanId(ClientHistoryData)).length} Loan(s)
                                                                    </span>
                                                                    <div>
                                                                        <span style={{ marginLeft: '10px' }}></span>


                                                                        <ExportPDF
                                                                            data={ClientHistoryData}
                                                                            filename="client_history"
                                                                            title="Client History"
                                                                            msisdn={ClientHistoryData[0]?.msisdn}
                                                                            columns={clientHistoryColumns}
                                                                            additionalInfo={[
                                                                                { label: 'Client Name', value: data[0].name },
                                                                                { label: 'MSISDN', value: data[0].msisdn },
                                                                                { label: 'Total Loans', value: Object.keys(groupByLoanId(ClientHistoryData)).length.toString() }
                                                                            ]}
                                                                        />

                                                                        <span style={{ marginLeft: '10px' }}></span>
                                                                        {actionsMemoRefund}


                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                    <div className="loan-card bg-white rounded shadow-sm overflow-hidden">
                                                        <div className="loan-header bg-light p-3 d-flex justify-content-between align-items-center">
                                                            <h5 className="mb-0">Loan ID: {loanId}</h5>
                                                            <div>
                                                                <span className="badge bg-secondary me-2" >{data.length} Transactions</span>
                                                                {/* <ExportCSV data={data} /> */}
                                                            </div>
                                                        </div>
                                                        <div className="p-3">
                                                            <DataTable
                                                                columns={columnstwo}
                                                                data={data}
                                                                progressPending={pending}
                                                                highlightOnHover
                                                                striped
                                                                responsive
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="alert alert-info mt-3" role="alert">
                                            No data available for this client
                                        </div>
                                    )
                                )}


                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Category;
