import React, { useEffect, useState, useMemo } from 'react';
import { BreadCrumb } from '../../components';
import Buttons from '../../components/Button';
import { MKR_Services } from '../../services';
import { useSelector } from 'react-redux';
import ExportCSV from '../../components/ExportCSV';
import DataTable from 'react-data-table-component';
import { Button, Modal, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { LoanData } from './LoansInterface';
import { iUsersConnected } from '../../features/usermanagement/users';
import { useNavigate } from 'react-router-dom';



const Loans = () => {
    const [loansData, setLoansData] = useState<LoanData[]>([]);
    const [selectedLoan, setSelectedLoan] = useState<LoanData | null>(null);
    const [pending, setPending] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [size, setSize] = useState(10);
    const navigate = useNavigate();

    const connectedUsers: iUsersConnected = useSelector(
        (state: iUsersConnected) => state
    );

    const token = connectedUsers.token;
    const role = connectedUsers.roles

    const fetchLoansData = async () => {
        setPending(true);

        try {
            let payload = {}

            if (role === 'ADMIN') {
                payload = {
                    serviceReference: 'GET_ALL_LOANS',
                    requestBody: JSON.stringify({
                        page,
                        size,
                    }),
                }
            }
            else if (role === 'AVOCAT') {
                payload = {
                    serviceReference: 'LOANS_BY_LAWYERID',
                    requestBody: JSON.stringify({
                        lawyerId: connectedUsers.refId,
                        page,
                        size,
                    })
                }
            }

            console.log("payload", payload);

            const response = await MKR_Services('GATEWAY', 'clientRecoveryApiService/request', 'POST', payload, token);

            console.log("response", response);

            if (response && response.body.meta.statusCode === 200) {
                setLoansData(response.body.data);
                toast.success('Loans data fetched successfully');
            } else if (response && response.body.meta.statusCode === 401) {
                toast.error('Unauthorized access');
            }
            else if (response && response.body.meta.statusCode === 404) {
                toast.error(response.body.meta.message || 'Lawyer Not Found');


            }

            else {
                console.error('Error fetching data');
                toast.error('Error fetching loans data');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Error fetching loans data');
        }

        setPending(false);
    };

    useEffect(() => {
        fetchLoansData();
    }, [page, size]);

    const handleView = (loan: LoanData) => {
        setSelectedLoan(loan);
        setShowModal(true);
    };

    const handleToggleLoanModal = () => {
        setShowModal(!showModal);
    };

    const hideModalLoan = () => {
        setShowModal(false);
    };

    const breadCrumb = [
        { name: "Home", link: "/dashboard", isActive: false },
        { name: "Loan", link: "", isActive: false },
        { name: "Loan Management", link: "", isActive: true }
    ];

    const filteredLoans = loansData ? loansData.filter((loan) =>
        Object.values(loan).some((field) =>
            typeof field === 'string' &&
            field.toLowerCase().includes(searchTerm.toLowerCase())
        )
    ) : [];

    const handleClientHistory = (msisdn: string) => {
        navigate(`/loancategory?msisdn=${msisdn}`);
    };

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

    const columns = [
        { name: 'Loan ID', selector: (row: LoanData) => row.loanId, sortable: true },
        { name: 'Client Name', selector: (row: LoanData) => row.clientName, sortable: true },
        { name: 'Loan Date', selector: (row: LoanData) => formatLoanStatus(row.loanDate), sortable: true },
        { name: 'Loan Amount', selector: (row: LoanData) => row.loanAmount, sortable: true },
        { name: 'Amount Paid On Loan', selector: (row: LoanData) => row.amountPaidOnLoan, sortable: true },
        { name: 'Debt', selector: (row: LoanData) => row.debt, sortable: true },
        { name: 'Initial Debt', selector: (row: LoanData) => row.initialDebt, sortable: true },
        { name: 'Penalty Debt', selector: (row: LoanData) => row.penaltyDebt, sortable: true },
        { name: 'Recovery Fee', selector: (row: LoanData) => row.recoveryFee, sortable: true },
        {
            name: 'Actions',
            cell: (row: LoanData) => (
                <>
                    <OverlayTrigger placement="left" overlay={<Tooltip id="tooltip-export">View More</Tooltip>}>
                        <Button className='justify-content-center me-2' onClick={() => handleView(row)}>
                            <i className="ti-eye"></i>
                        </Button>
                    </OverlayTrigger>
                    <OverlayTrigger placement="right" overlay={<Tooltip id="tooltip-export">Client History</Tooltip>}>
                        <Button className='justify-content-center' onClick={() => handleClientHistory(row.msisdn)}>
                            <i className="ti-user"></i>
                        </Button>
                    </OverlayTrigger>
                </>
            )
        }
    ];

    React.useEffect(() => {
        const timeout = setTimeout(() => {
            setPending(false);
        }, 2000);
        return () => clearTimeout(timeout);
    }, []);

    const actionsMemo = useMemo(() => <ExportCSV data={loansData} />, [loansData]);

    const toSentenceCase = (str: string) => {
        if (!str) return str;
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    };

    return (
        <div>
            <div className="pb-1 mb-0 d-lg-flex justify-content-between align-items-center">
                <div className="mb-1 mb-lg-0">
                    <BreadCrumb name="Loan Management" links={breadCrumb} children={<></>} />
                </div>
            </div>

            <div className="card">
                <div className="card-body">
                    <div className="pb-4 mb-0 d-lg-flex justify-content-between align-items-center">
                        <div className="mb-1 mb-lg-0">
                            <h4 className="card-title">Loan Table</h4>
                        </div>

                        <div className="dropdown dropleft mr-1">
                            <button className="btn btn-warning dropdown-toggle" type="button" id="dropdownMenuIconButton1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                <span className='me-2'>Filter</span>
                                <i className="ti-filter"></i>
                            </button>
                            <div className="dropdown-menu" aria-labelledby="dropdownMenuIconButton1">
                                <h6 className="dropdown-header">Enter the Range:</h6>
                                <a className="dropdown-item" href="#">
                                    <label htmlFor="pageInput">Page:</label>

                                    <OverlayTrigger
                                        placement="left"
                                        overlay={<Tooltip id="tooltip-page">Enter the page number you want to view.</Tooltip>}
                                    >
                                        <input
                                            id="pageInput"
                                            type="number"
                                            placeholder="Page number"
                                            className="form-control"
                                            value={page}
                                            onChange={(e) => setPage(Number(e.target.value))}
                                        />
                                    </OverlayTrigger>
                                </a>
                                <a className="dropdown-item" href="#">
                                    <label htmlFor="sizeInput">Size:</label>
                                    <OverlayTrigger
                                        placement="left"
                                        overlay={<Tooltip id="tooltip-size">Enter the number of items you want to view.</Tooltip>}
                                    >
                                        <input
                                            id="sizeInput"
                                            type="number"
                                            placeholder="Items per page"
                                            className="form-control"
                                            value={size}
                                            onChange={(e) => setSize(Number(e.target.value))}
                                        />
                                    </OverlayTrigger>
                                </a>

                            </div>


                        </div>

                    </div>

                    <DataTable
                        columns={columns}
                        data={filteredLoans}
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
            <Modal show={showModal} onHide={hideModalLoan} size='lg'>
                <Modal.Header closeButton>
                    <Modal.Title>{selectedLoan ? 'Loan Details' : 'Loan Information'}</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    {selectedLoan && (
                        <div className="row">
                            <div className="col-md-6">
                                {Object.entries(selectedLoan).slice(0, Math.ceil(Object.entries(selectedLoan).length / 2)).map(([key, value]) => (
                                    <div key={key} className="mb-3">
                                        <h6 className="text-muted mb-1">{toSentenceCase(key)}</h6>
                                        <p className="font-weight-bold">{value !== null && value !== undefined ? value.toString() : 'N/A'}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="col-md-6">
                                {Object.entries(selectedLoan).slice(Math.ceil(Object.entries(selectedLoan).length / 2)).map(([key, value]) => (
                                    <div key={key} className="mb-3">
                                        <h6 className="text-muted mb-1">{toSentenceCase(key)}</h6>
                                        <p className="font-weight-bold">{value !== null && value !== undefined ? value.toString() : 'N/A'}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={hideModalLoan}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>

        </div>
    );
};

export default Loans;




