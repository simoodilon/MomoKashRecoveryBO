import React from 'react'

const TestView = () => {
    return (
        <div>
            Test View
        </div>
    )
}

export default TestView


// import React, { useEffect, useState, useMemo } from 'react';
// import { BreadCrumb } from '../../components';
// import Buttons from '../../components/Button';
// import { MKR_Services } from '../../services';
// import { useSelector } from 'react-redux';
// import ExportCSV from '../../components/ExportCSV';
// import DataTable from 'react-data-table-component';
// import { Button, Card, Col, Modal, OverlayTrigger, Row, Tooltip } from 'react-bootstrap';
// import { toast } from 'react-toastify';
// import { LoanData } from './LoansInterface';
// import { iUsersConnected } from '../../features/usermanagement/users';


// interface IconMap {
//     [key: string]: string;
// }



// const Loans = () => {
//     const [loansData, setLoansData] = useState<LoanData[]>([]);
//     const [selectedLoan, setSelectedLoan] = useState<LoanData | null>(null);
//     const [pending, setPending] = useState(true);
//     const [showModal, setShowModal] = useState(false);
//     const [searchTerm, setSearchTerm] = useState('');
//     const [page, setPage] = useState(1);
//     const [size, setSize] = useState(10);

//     const connectedUsers: iUsersConnected = useSelector(
//         (state: iUsersConnected) => state
//     );


//     const token = connectedUsers.token;
//     const role = connectedUsers.roles

//     const iconMap: IconMap = {
//         loanId: 'credit-card',
//         clientName: 'person',
//         loanAmount: 'cash',
//         loanStatus: 'graph-up',
//         amountPaidOnLoan: 'wallet2',
//         debt: 'currency-exchange',
//         recoveryFee: 'percent',
//         loanStartDate: 'calendar-date',
//         loanDuration: 'clock',
//         loanType: 'file-earmark-text',
//     };

//     const formatValue = (key: string, value: any): string => {
//         if (key.toLowerCase().includes('amount') || key === 'debt') {
//             return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
//         }
//         return String(value);
//     };

//     const fetchLoansData = async () => {
//         setPending(true);

//         try {
//             let payload = {}

//             if (role === 'ADMIN') {
//                 payload = {
//                     serviceReference: 'GET_ALL_LOANS',
//                     requestBody: JSON.stringify({
//                         page,
//                         size,
//                     }),
//                 }
//             }
//             else if (role === 'AVOCAT') {
//                 payload = {
//                     serviceReference: 'LOANS_BY_LAWYERID',
//                     requestBody: JSON.stringify({
//                         lawyerId: connectedUsers.refId,
//                         page,
//                         size,
//                     })
//                 }
//             }

//             // const payload = {
//             //     serviceReference: 'GET_ALL_LOANS',
//             //     requestBody: JSON.stringify({
//             //         page,
//             //         size,
//             //     }),
//             // };

//             console.log("payload", payload);

//             const response = await MKR_Services('GATEWAY', 'clientRecoveryApiService/request', 'POST', payload, token);

//             console.log("response", response);

//             if (response && response.body.meta.statusCode === 200) {
//                 setLoansData(response.body.data);
//                 toast.success('Loans data fetched successfully');
//             } else {
//                 console.error('Error fetching data');
//                 toast.error('Error fetching loans data');
//             }
//         } catch (error) {
//             console.error('Error:', error);
//             toast.error('Error fetching loans data');
//         }

//         setPending(false);
//     };

//     useEffect(() => {
//         fetchLoansData();
//     }, [page, size]);

//     const handleView = (loan: LoanData) => {
//         setSelectedLoan(loan);
//         setShowModal(true);
//     };

//     const handleToggleLoanModal = () => {
//         setShowModal(!showModal);
//     };

//     const hideModalLoan = () => {
//         setShowModal(false);
//     };

//     const breadCrumb = [
//         { name: "Home", link: "/dashboard", isActive: false },
//         { name: "Loan", link: "", isActive: false },
//         { name: "Loan Management", link: "", isActive: true }
//     ];

//     const filteredLoans = loansData ? loansData.filter((loan) =>
//         Object.values(loan).some((field) =>
//             typeof field === 'string' &&
//             field.toLowerCase().includes(searchTerm.toLowerCase())
//         )
//     ) : [];

//     const columns = [
//         { name: 'Loan ID', selector: (row: LoanData) => row.loanId, sortable: true },
//         { name: 'Client Name', selector: (row: LoanData) => row.clientName, sortable: true },
//         { name: 'Loan Amount', selector: (row: LoanData) => row.loanAmount, sortable: true },
//         { name: 'Loan Status', selector: (row: LoanData) => row.loanStatus, sortable: true },
//         { name: 'Amount Paid On Loan', selector: (row: LoanData) => row.amountPaidOnLoan, sortable: true },
//         { name: 'Debt', selector: (row: LoanData) => row.debt, sortable: true },
//         { name: 'Recovery Fee', selector: (row: LoanData) => row.recoveryFee, sortable: true },
//         {
//             name: 'Actions',
//             cell: (row: LoanData) => (
//                 <OverlayTrigger placement="right" overlay={<Tooltip id="tooltip-export">View More</Tooltip>}>
//                     <Button className='justify-content-center' onClick={() => handleView(row)}>
//                         <i className="ti-eye"></i>
//                     </Button>
//                 </OverlayTrigger>
//             )
//         }
//     ];

//     React.useEffect(() => {
//         const timeout = setTimeout(() => {
//             setPending(false);
//         }, 2000);
//         return () => clearTimeout(timeout);
//     }, []);

//     const actionsMemo = useMemo(() => <ExportCSV data={loansData} />, [loansData]);

//     const toSentenceCase = (str: string) => {
//         if (!str) return str;
//         return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
//     };

//     return (
//         <div>
//             <div className="pb-1 mb-0 d-lg-flex justify-content-between align-items-center">
//                 <div className="mb-1 mb-lg-0">
//                     <BreadCrumb name="Loan Management" links={breadCrumb} children={<></>} />
//                 </div>
//             </div>

//             <div className="card">
//                 <div className="card-body">
//                     <div className="pb-4 mb-0 d-lg-flex justify-content-between align-items-center">
//                         <div className="mb-1 mb-lg-0">
//                             <h4 className="card-title">Loan Table</h4>
//                         </div>

//                         <div className="dropdown dropleft mr-1">
//                             <button className="btn btn-warning dropdown-toggle" type="button" id="dropdownMenuIconButton1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
//                                 <span className='me-2'>Filter</span>
//                                 <i className="ti-filter"></i>
//                             </button>
//                             <div className="dropdown-menu" aria-labelledby="dropdownMenuIconButton1">
//                                 <h6 className="dropdown-header">Enter the Range:</h6>
//                                 <a className="dropdown-item" href="#">
//                                     <input
//                                         type="number"
//                                         placeholder="Page"
//                                         className="form-control mr-2"
//                                         value={page}
//                                         onChange={(e) => setPage(Number(e.target.value))}
//                                     /></a>
//                                 <a className="dropdown-item" href="#">
//                                     <input
//                                         type="number"
//                                         placeholder="Size"
//                                         className="form-control"
//                                         value={size}
//                                         onChange={(e) => setSize(Number(e.target.value))}
//                                     />
//                                 </a>
//                                 {/* <a className="dropdown-item" href="#">Loan Id</a>
//                                 <div className="dropdown-divider"></div>
//                                 <a className="dropdown-item" href="#">Client Status</a> */}
//                             </div>


//                         </div>

//                     </div>
//                     {/* <div className="d-flex mb-4">
//                         <input
//                             type="number"
//                             placeholder="Page"
//                             className="form-control mr-2"
//                             value={page}
//                             onChange={(e) => setPage(Number(e.target.value))}
//                         />
//                         <input
//                             type="number"
//                             placeholder="Size"
//                             className="form-control"
//                             value={size}
//                             onChange={(e) => setSize(Number(e.target.value))}
//                         />
//                     </div> */}
//                     <DataTable
//                         columns={columns}
//                         data={filteredLoans}
//                         pagination
//                         progressPending={pending}
//                         subHeader
//                         subHeaderComponent={
//                             <div className="d-flex align-items-center">
//                                 <input
//                                     type="text"
//                                     placeholder="Search"
//                                     className="form-control"
//                                     value={searchTerm}
//                                     onChange={(e) => setSearchTerm(e.target.value)}
//                                 />
//                                 <div>
//                                     <span style={{ marginLeft: '10px' }}></span>
//                                     {actionsMemo}
//                                 </div>
//                             </div>
//                         }
//                     />
//                 </div>
//             </div>
//             <Modal show={showModal} onHide={hideModalLoan} size="lg" centered>
//                 <Modal.Header closeButton>
//                     <Modal.Title>Loan Details</Modal.Title>
//                 </Modal.Header>
//                 <Modal.Body>
//                     <Row>
//                         {selectedLoan && Object.entries(selectedLoan).map(([key, value]) => {
//                             const iconName = iconMap[key] || 'file-text';
//                             return (
//                                 <Col md={6} key={key} className="mb-3">
//                                     <Card className="h-100 shadow-sm">
//                                         <Card.Body>
//                                             <div className="d-flex align-items-center">
//                                                 <div className="rounded-circle bg-light p-3 mr-3">
//                                                     <i className={`bi bi-${iconName} text-primary`} style={{ fontSize: '1.5rem' }}></i>
//                                                 </div>
//                                                 <div>
//                                                     <h6 className="text-muted mb-1">{toSentenceCase(key)}</h6>
//                                                     <p className="font-weight-bold mb-0">
//                                                         {formatValue(key, value)}
//                                                     </p>
//                                                 </div>
//                                             </div>
//                                         </Card.Body>
//                                     </Card>
//                                 </Col>
//                             );
//                         })}
//                     </Row>
//                 </Modal.Body>
//                 <Modal.Footer>
//                     <Button variant="secondary" onClick={hideModalLoan}>
//                         Close
//                     </Button>
//                 </Modal.Footer>
//             </Modal>

//         </div>
//     );
// };

// export default Loans;
