import React, { useEffect, useMemo, useState } from 'react';
import { Spinner } from 'react-bootstrap';
import { BreadCrumb } from '../../components';
import { useNavigate } from 'react-router-dom';
import { iUsersConnected } from '../../features/usermanagement/users';
import { useSelector } from 'react-redux';
import { MKR_Services } from '../../services';
import { toast } from 'react-toastify';

import { LawyerData } from '../lawyers/Lawyers';
import { LoanRefundDetails } from './LoansInterface';
import DataTable from 'react-data-table-component';
import ExportCSV from '../../components/ExportCSV';

const Refunds = () => {
    const navigate = useNavigate();
    const [pending, setPending] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const [LoanRefundbyMsisdn, setLoanRefundbyMsisdn] = useState({
        msisdn: '',
    });
    const [LoanRefundbyLoanID, setLoanRefundbyLoanID] = useState({
        loanId: '',
    });

    const [LoanRefundbyMsisdnData, setLoanRefundbyMsisdnData] = useState<LoanRefundDetails[]>([]);
    const [LoanRefundbyLoanIDData, setLoanRefundbyLoanIDData] = useState<LoanRefundDetails[]>([]);
    const [searchAttempted, setSearchAttempted] = useState(false);


    const [lawyersData, setLawyersData] = useState<LawyerData[]>([]);

    const connectedUsers: iUsersConnected = useSelector(
        (state: iUsersConnected) => state
    );

    const token = connectedUsers.token;
    const role = connectedUsers.roles;

    const filteredLoanRefundbyMsisdnData = LoanRefundbyMsisdnData ? LoanRefundbyMsisdnData.filter((refund) =>
        Object.values(refund).some((field) =>
            typeof field === 'string' &&
            field.toLowerCase().includes(searchTerm.toLowerCase())
        )
    ) : [];

    const filteredLoanRefundbyLoanIDData = LoanRefundbyLoanIDData ? LoanRefundbyLoanIDData.filter((refund) =>
        Object.values(refund).some((field) =>
            typeof field === 'string' &&
            field.toLowerCase().includes(searchTerm.toLowerCase())
        )
    ) : [];


    const handleLoanRefundbyMsisdn = async (e: React.FormEvent) => {
        e.preventDefault(); // Prevent form submission
        setPending(true);

        try {
            const payload = {
                serviceReference: 'LOAN_REFUND_BY_MSISDN',
                requestBody: LoanRefundbyMsisdn.msisdn,
            };
            const response = await MKR_Services('GATEWAY', 'clientRecoveryApiService/request', 'POST', payload, token);
            setSearchAttempted(true);

            console.log("response", response);
            console.log("LoanRefundbyMsisdn", LoanRefundbyMsisdn);

            if (response && response.body.meta.statusCode === 200) {
                setLoanRefundbyMsisdnData(response.body.data);
                toast.success("Success");
            } else {

                toast.error(response.body.meta.message || "Error");

            }
        } catch (error) {
            console.log("Error", error);
            toast.error("Error");

        }


        setPending(false);
    };
    const handleLoanRefundbyLoanID = async (e: React.FormEvent) => {
        e.preventDefault(); // Prevent form submission
        setPending(true);

        try {
            const payload = {
                serviceReference: 'LOAN_REFUND_BY_LOANID',
                requestBody: LoanRefundbyLoanID.loanId,
            };
            const response = await MKR_Services('GATEWAY', 'clientRecoveryApiService/request', 'POST', payload, token);
            setSearchAttempted(true);

            console.log("responseLoanRefundbyLoanID", response);
            console.log("LoanRefundbyLoanID", LoanRefundbyLoanID);

            if (response && response.body.meta.statusCode === 200) {
                toast.success(response.body.meta.message);
                setLoanRefundbyLoanIDData(response.body.data);

            } else if (response && response.body.meta.statusCode === 1001) {
                toast.error("You are not not allowed to view details for this client");
            }

            else {
                toast.error(response.body.meta.message || "Error");
            }
        } catch (error) {
            console.log("Error", error);
            toast.error("Error");

        }


        setPending(false);
    };



    const handleChange = (e: { target: { name: any; value: any; }; }, stateType: 'LoanRefundbyMsisdn' | 'LoanRefundbyLoanID') => {
        const { name, value } = e.target;
        if (stateType === 'LoanRefundbyMsisdn') {
            setLoanRefundbyMsisdn(prevState => ({
                ...prevState,
                [name]: value,
            }));
        } else if (stateType === 'LoanRefundbyLoanID') {
            setLoanRefundbyLoanID(prevState => ({
                ...prevState,
                [name]: value,
            }));
        }
    };

    const resetCLoanRefundbyMsisdn = (e: any) => {
        e.preventDefault(); // Prevent form submission
        setLoanRefundbyMsisdn({
            msisdn: '',

        });
        setLoanRefundbyMsisdnData([]);
        setSearchAttempted(false);
    };
    const resetLoanRefundbyLoanID = (e: any) => {
        e.preventDefault(); // Prevent form submission
        setLoanRefundbyLoanID({
            loanId: '',

        });
        setLoanRefundbyLoanIDData([]);
        setSearchAttempted(false);

    };


    const formatDate = (dateTime: string | number | Date): string => {
        const d = new Date(dateTime);

        console.log("trydate", dateTime);
        let month = '' + (d.getMonth() + 1);
        let day = '' + d.getDate();
        let year = d.getFullYear();
        let hour = d.getHours();
        let minutes = d.getMinutes();
        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;

        console.log("d", d);
        let hours = [hour, minutes].join(':');
        let days = [year, month, day].join('-');

        return [days].join(' ');
    }

    const formatRefundStatus = (status: string) => {
        switch (status) {
            case 'isCarryOver':
                return 'Auto Debit';
            case 'Normal':
                return 'Normal Period';
            default:
                return status;
        }
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
            name: "Refunds",
            link: "",
            isActive: true
        }
    ];

    const columns = [

        { name: 'Client Name', selector: (row: LoanRefundDetails) => row.clientName, sortable: true },
        { name: 'Date Time', selector: (row: LoanRefundDetails) => formatDate(row.dateTime), sortable: true },
        // { name: 'Loan ID', selector: (row: LoanRefundDetails) => row.loanId, sortable: true },
        { name: 'Total Refund Amount', selector: (row: LoanRefundDetails) => row.totalRefundAmount, sortable: true },
        { name: 'Refund Capital', selector: (row: LoanRefundDetails) => row.refundCapital, sortable: true },
        { name: 'Refund Interest', selector: (row: LoanRefundDetails) => row.refundInterest, sortable: true },
        { name: 'Refund Date', selector: (row: LoanRefundDetails) => row.refundDate, sortable: true },
        { name: 'Refund Time', selector: (row: LoanRefundDetails) => row.refundTime, sortable: true },
        { name: 'Refund Status', selector: (row: LoanRefundDetails) => row.refundStatus, sortable: true },
        { name: 'Refund Period', selector: (row: LoanRefundDetails) => formatRefundStatus(row.refundPeriod), sortable: true },
        { name: 'Normal Amount', selector: (row: LoanRefundDetails) => row.normalAmount, sortable: true },
        { name: 'Penalty Amount', selector: (row: LoanRefundDetails) => row.penaltyAmount, sortable: true },
        { name: 'Recovery Fee Amount', selector: (row: LoanRefundDetails) => row.recoveryFeeAmount, sortable: true },
        { name: 'Excess', selector: (row: LoanRefundDetails) => row.excess, sortable: true },
        { name: 'Balance', selector: (row: LoanRefundDetails) => row.balance, sortable: true },
        { name: 'Bank Name', selector: (row: LoanRefundDetails) => row.bankName, sortable: true },

    ];
    const columnsbyId = [

        { name: 'Client Name', selector: (row: LoanRefundDetails) => row.clientName, sortable: true },
        { name: 'Date Time', selector: (row: LoanRefundDetails) => formatDate(row.dateTime), sortable: true },
        // { name: 'Loan ID', selector: (row: LoanRefundDetails) => row.loanId, sortable: true },
        { name: 'Total Refund Amount', selector: (row: LoanRefundDetails) => row.totalRefundAmount, sortable: true },
        { name: 'Normal Amount', selector: (row: LoanRefundDetails) => row.normalAmount, sortable: true },
        { name: 'Penalty Amount', selector: (row: LoanRefundDetails) => row.penaltyAmount, sortable: true },
        { name: 'Refund Capital', selector: (row: LoanRefundDetails) => row.refundCapital, sortable: true },
        { name: 'Refund Interest', selector: (row: LoanRefundDetails) => row.refundInterest, sortable: true },
        { name: 'Refund Date', selector: (row: LoanRefundDetails) => row.refundDate, sortable: true },
        { name: 'Refund Time', selector: (row: LoanRefundDetails) => row.refundTime, sortable: true },
        { name: 'Refund Status', selector: (row: LoanRefundDetails) => row.refundStatus, sortable: true },
        { name: 'Refund Period', selector: (row: LoanRefundDetails) => row.refundPeriod, sortable: true },
        { name: 'Recovery Fee Amount', selector: (row: LoanRefundDetails) => row.recoveryFeeAmount, sortable: true },
        { name: 'Excess', selector: (row: LoanRefundDetails) => row.excess, sortable: true },
        { name: 'Balance', selector: (row: LoanRefundDetails) => row.balance, sortable: true },
        { name: 'Bank Name', selector: (row: LoanRefundDetails) => row.bankName, sortable: true },

    ];

    React.useEffect(() => {
        const timeout = setTimeout(() => {
            // setRows(columns);
            setPending(false);
        }, 2000);
        return () => clearTimeout(timeout);
    }, []);

    const actionsMemo = useMemo(() => <ExportCSV data={LoanRefundbyMsisdnData} />, [LoanRefundbyMsisdnData]);
    const actionsMemobyId = useMemo(() => <ExportCSV data={LoanRefundbyLoanIDData} />, [LoanRefundbyLoanIDData]);


    return (
        <div>
            <div className="pb-0 mb-0 d-lg-flex justify-content-between align-items-center">
                <div className="mb-1 mb-lg-0">
                    <div className="row">
                        <div className="col-lg-12 col-md-12 col-12">
                            <BreadCrumb name=" Refunds" links={breadCrumb} children={<></>} />
                        </div>
                    </div>
                </div>
            </div>
            <div className="col-12 grid-margin stretch-card">
                <div className="card">
                    <div className="card-body">
                        <h4 className="card-title">Refund Details</h4>

                        <ul className="nav nav-tabs" id="myTab" role="tablist">
                            <li className="nav-item" role="presentation">
                                <button className="nav-link active" id="home-tab" data-bs-toggle="tab" data-bs-target="#home" type="button" role="tab" aria-controls="home" aria-selected="true">Loan Refund by Msisdn</button>
                            </li>
                            <li className="nav-item" role="presentation">
                                <button className="nav-link" id="profile-tab" data-bs-toggle="tab" data-bs-target="#profile" type="button" role="tab" aria-controls="profile" aria-selected="false">Loan Refund by LoanID</button>
                            </li>
                            {/* <li className="nav-item" role="presentation">
                                <button className="nav-link" id="contact-tab" data-bs-toggle="tab" data-bs-target="#contact" type="button" role="tab" aria-controls="contact" aria-selected="false">Client Status by Lawyer</button>
                            </li> */}
                        </ul>
                        <div className="tab-content" id="myTabContent">
                            <div className="tab-pane fade show active" id="home" role="tabpanel" aria-labelledby="home-tab">
                                <p className="card-description">
                                    Filter Loans
                                </p>
                                <form className="forms-sample">
                                    <div className="form-group">
                                        <label htmlFor="exampleInputName1">Msisdn</label>
                                        <input type="text" className="form-control" id="exampleInputName1" placeholder="Msisdn" name='msisdn' value={LoanRefundbyMsisdn.msisdn} onChange={(e) => handleChange(e, 'LoanRefundbyMsisdn')} />
                                    </div>


                                    <button className="btn btn-primary mr-2" style={{ backgroundColor: "#4B49AC" }} onClick={handleLoanRefundbyMsisdn}>
                                        {pending ? <div className='text-center'><Spinner /></div> : "Search"}
                                    </button>
                                    <button className="btn btn-light" onClick={resetCLoanRefundbyMsisdn}>Reset</button>
                                </form>


                                {searchAttempted && (
                                    LoanRefundbyMsisdnData.length > 0 ? (
                                        <DataTable
                                            columns={columns}
                                            data={filteredLoanRefundbyMsisdnData}
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
                                    ) : (
                                        <div className="alert alert-info mt-3" role="alert">
                                            No data available for this client
                                        </div>
                                    )
                                )}

                            </div>
                            <div className="tab-pane fade " id="profile" role="tabpanel" aria-labelledby="profile-tab">
                                <form className="forms-sample">
                                    <div className="form-group">
                                        <label htmlFor="exampleInputName1">Load ID</label>
                                        <input type="text" className="form-control" id="exampleInputName1" placeholder="loanId" name='loanId' value={LoanRefundbyLoanID.loanId} onChange={(e) => handleChange(e, 'LoanRefundbyLoanID')} />
                                    </div>

                                    <button className="btn btn-primary mr-2" style={{ backgroundColor: "#4B49AC" }} onClick={handleLoanRefundbyLoanID} >
                                        {pending ? <div className='text-center'><Spinner /></div> : "Search"}
                                    </button>
                                    <button className="btn btn-light" onClick={resetLoanRefundbyLoanID} >Reset</button>


                                </form>
                                {/* Display the InactiveAndActiveloansResponse data */}
                                {searchAttempted && (
                                    LoanRefundbyLoanIDData.length > 0 ? (
                                        <DataTable
                                            columns={columnsbyId}
                                            data={filteredLoanRefundbyLoanIDData}
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
                                                        {actionsMemobyId}
                                                    </div>
                                                </div>
                                            }
                                        />
                                    ) : (
                                        <div className="mt-3">No data available for this client</div>
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

export default Refunds;
