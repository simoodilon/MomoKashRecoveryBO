import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, ProgressBar } from 'react-bootstrap';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FaUserTie, FaUniversity, FaMoneyBillWave, FaChartLine, FaCalendarAlt } from 'react-icons/fa';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { MKR_Services } from '../../services';
import { useSelector } from 'react-redux';
import { iUsersConnected } from '../../features/usermanagement/users';
import { LoanData } from '../loans/LoansInterface';
import { useNavigate } from 'react-router-dom';

type BankData = {
    id: string;
    bankId: string;
    bankName: string;
    active: boolean;
};

type LawyerData = {
    cni: string;
    barNumber: string;
    lawyerName: string;
    // Add other lawyer fields as needed
};

type PerformanceData = {
    name: string;
    Lawyers: number;
    Banks: number;
};

type Activity = {
    id: number;
    action: string;
    timestamp: string;
};

const Dashboard: React.FC = () => {
    const [value, onChange] = useState<Date>(new Date());
    const [lawyersCount, setLawyersCount] = useState<number>(0);
    const [banksCount, setBanksCount] = useState<number>(0);
    const [totalLoans, setTotalLoans] = useState<number>(0);
    const [totalDebt, setTotalDebt] = useState<number>(0);
    const [recentLoans, setRecentLoans] = useState<LoanData[]>([]);
    const [loanStatusData, setLoanStatusData] = useState<{ name: string; value: number }[]>([]);
    const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
    const [projectedRecoveryFee, setProjectedRecoveryFee] = useState<number>(0);
    const [pendingRecovery, setPendingRecovery] = useState<number>(0);

    const navigate = useNavigate();
    const connectedUsers: iUsersConnected = useSelector((state: iUsersConnected) => state);
    const token = connectedUsers.token;
    const role = connectedUsers.roles;

    const fetchDashboardData = async () => {
        try {
            // Fetch Lawyers Data
            const lawyersPayload = {
                serviceReference: 'GET_ALL_LAWYERS',
                requestBody: ''
            };
            const lawyersResponse = await MKR_Services('GATEWAY', 'clientRecoveryApiService/request', 'POST', lawyersPayload, token);
            if (lawyersResponse && lawyersResponse.body.meta.statusCode === 200) {
                setLawyersCount(lawyersResponse.body.data.length);
            }

            // Fetch Banks Data
            const banksPayload = {
                serviceReference: 'GET_ALL_BANK',
                requestBody: ''
            };
            const banksResponse = await MKR_Services('GATEWAY', 'clientRecoveryApiService/request', 'POST', banksPayload, token);
            if (banksResponse && banksResponse.body.meta.statusCode === 200) {
                setBanksCount(banksResponse.body.data.length);
            }

            // Fetch Loans Data
            const loansPayload = {
                serviceReference: role === 'ADMIN' && 'GET_ALL_LOANS',
                requestBody: JSON.stringify({
                    page: 1,
                    size: 10000,
                    ...(role === 'AVOCAT' && { lawyerId: connectedUsers.refId })
                }),
            };
            const loansResponse = await MKR_Services('GATEWAY', 'clientRecoveryApiService/request', 'POST', loansPayload, token);

            console.log("loansResponse", loansResponse);

            if (loansResponse && loansResponse.body.meta.statusCode === 200) {
                const loans: LoanData[] = loansResponse.body.data;
                setTotalLoans(loans.length);
                setTotalDebt(loans.reduce((acc, loan) => acc + loan.debt, 0));
                setRecentLoans(loans.slice(0, 5));

                // Calculate Projected Recovery Fee and Pending Recovery for AVOCAT
                if (role === 'AVOCAT') {
                    const projectedRecovery = loans.reduce((acc, loan) => acc + loan.recoveryFee, 0);
                    const pendingRecovery = loans.reduce((acc, loan) => acc + (loan.debt - loan.amountPaidOnLoan), 0);
                    setProjectedRecoveryFee(projectedRecovery);
                    setPendingRecovery(pendingRecovery);
                }

                // Calculate loan status data for pie chart
                const statusCount = loans.reduce((acc, loan) => {
                    acc[loan.loanStatus] = (acc[loan.loanStatus] || 0) + 1;
                    return acc;
                }, {} as Record<string, number>);
                setLoanStatusData(Object.entries(statusCount).map(([name, value]) => ({ name, value: value as number })));
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        }
    };

    useEffect(() => {
        const fetchloadDataLawyers = async () => {
            try {
                const loansPayload = {
                    serviceReference: role === 'AVOCAT' && 'LOANS_BY_LAWYERID',
                    requestBody: JSON.stringify({
                        page: 1,
                        size: 10000,
                        ...(role === 'AVOCAT' && { lawyerId: connectedUsers.refId })
                    }),
                };
                const loansResponse = await MKR_Services('GATEWAY', 'clientRecoveryApiService/request', 'POST', loansPayload, token);

                console.log("loansResponse", loansResponse);

                if (loansResponse && loansResponse.body.meta.statusCode === 200) {
                    const loans: LoanData[] = loansResponse.body.data;
                    setTotalLoans(loans.length);
                    setTotalDebt(loans.reduce((acc, loan) => acc + loan.debt, 0));
                    setRecentLoans(loans.slice(0, 5));

                    // Calculate loan status data for pie chart
                    const statusCount = loans.reduce((acc, loan) => {
                        acc[loan.loanStatus] = (acc[loan.loanStatus] || 0) + 1;
                        return acc;
                    }, {} as Record<string, number>);
                    setLoanStatusData(Object.entries(statusCount).map(([name, value]) => ({ name, value: value as number })));
                }

            } catch (error) {
                console.error('Error fetching dashboard data:', error);

            }
        }
        fetchloadDataLawyers()

    }, []

    )

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    const performanceData: PerformanceData[] = [
        { name: 'Jan', Lawyers: 4000, Banks: 2400 },
        { name: 'Feb', Lawyers: 3000, Banks: 1398 },
        { name: 'Mar', Lawyers: 2000, Banks: 9800 },
        { name: 'Apr', Lawyers: 2780, Banks: 3908 },
        { name: 'May', Lawyers: 1890, Banks: 4800 },
        { name: 'Jun', Lawyers: 2390, Banks: 3800 },
    ];

    useEffect(() => {
        // Fetch data from your API here
        // For now, we'll use mock data
        setLawyersCount(47);
        setBanksCount(15);
        setRecentActivity([
            { id: 1, action: 'New lawyer added', timestamp: '2 hours ago' },
            { id: 2, action: 'Bank status updated', timestamp: '4 hours ago' },
            { id: 3, action: 'New case assigned', timestamp: '1 day ago' },
        ]);
    }, []);

    return (
        <div className="dashboard">
            <h2 className="mb-4">Welcome to Your Dashboard</h2>

            {/* <Row>
                {role === 'ADMIN' ? (
                    <>
                        <Col md={3}>
                            <Card className="mb-4 dashboard-card">
                                <Card.Body>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <h6 className="card-subtitle mb-2 text-muted">Total Lawyers</h6>
                                            <h2 className="card-title mb-0">{lawyersCount}</h2>
                                        </div>
                                        <FaUserTie size={30} color="#4B49AC" />
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={3}>
                            <Card className="mb-4 dashboard-card">
                                <Card.Body>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <h6 className="card-subtitle mb-2 text-muted">Total Banks</h6>
                                            <h2 className="card-title mb-0">{banksCount}</h2>
                                        </div>
                                        <FaUniversity size={30} color="#4B49AC" />
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>


                    </>
                ) : (
                    <>
                        <Col md={3}>
                            <Card className="mb-4 dashboard-card">
                                <Card.Body>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <h6 className="card-subtitle mb-2 text-muted">Projected Recovery Fee</h6>
                                            <h2 className="card-title mb-0">FCFA{projectedRecoveryFee.toFixed(2)}</h2>
                                        </div>
                                        <FaMoneyBillWave size={30} color="#4B49AC" />
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={3}>
                            <Card className="mb-4 dashboard-card">
                                <Card.Body>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <h6 className="card-subtitle mb-2 text-muted">Pending Recovery</h6>
                                            <h2 className="card-title mb-0">FCFA{pendingRecovery.toFixed(2)}</h2>
                                        </div>
                                        <FaChartLine size={30} color="#4B49AC" />
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>

                    </>
                )}


                <Col md={3}>
                    <Card className="mb-4 dashboard-card">
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="card-subtitle mb-2 text-muted">Total Loans</h6>
                                    <h2 className="card-title mb-0">{totalLoans}</h2>
                                </div>
                                <FaMoneyBillWave size={30} color="#4B49AC" />
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="mb-4 dashboard-card">
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="card-subtitle mb-2 text-muted">Total Debt</h6>
                                    <h2 className="card-title mb-0">FCFA{totalDebt.toFixed(2)}</h2>
                                </div>
                                <FaChartLine size={30} color="#4B49AC" />
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            <Row>
                <Col md={8}>
                    <Card className="mb-4 dashboard-card">
                        <Card.Body>
                            <h5 className="card-title mb-3">Loan Status Overview</h5>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={loanStatusData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {loanStatusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="mb-4 dashboard-card">
                        <Card.Body>
                            <h5 className="card-title mb-3">Calendar</h5>
                            <Calendar onChange={(value) => onChange(value as Date)} value={value} />
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row>
                <Col md={8}>
                    <Card className="mb-4 dashboard-card">
                        <Card.Body>
                            <h5 className="card-title mb-3">Performance Overview</h5>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={performanceData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="Lawyers" fill="#4B49AC" />
                                    <Bar dataKey="Banks" fill="#FFC100" />
                                </BarChart>
                            </ResponsiveContainer>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="mb-4 dashboard-card">
                        <Card.Body>
                            <h5 className="card-title mb-3">Recent Activity</h5>
                            {recentActivity.map((activity) => (
                                <div key={activity.id} className="d-flex justify-content-between align-items-center mb-2">
                                    <span>{activity.action}</span>
                                    <small className="text-muted">{activity.timestamp}</small>
                                </div>
                            ))}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row>
                <Col md={12}>
                    <Card className="dashboard-card mb-4">
                        <Card.Body>
                            <h5 className="card-title mb-3">Quick Actions</h5>
                            <div className="d-flex justify-content-between">
                                <Button variant="primary" className="mr-2" onClick={() => navigate('/lawyers')}>
                                    <FaUserTie className="mr-2" /> Add New Lawyer
                                </Button>
                                <Button variant="info" className="mr-2" onClick={() => navigate('/bank')}>
                                    <FaUniversity className="mr-2" /> Manage Banks
                                </Button>
                                <Button variant="success" className="mr-2" onClick={() => navigate('/tfj')}>
                                    <FaCalendarAlt className="mr-2" /> TFJ
                                </Button>
                                <Button variant="warning">
                                    <FaChartLine className="mr-2" /> Generate Report
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row>
                <Col md={12}>
                    <Card className="dashboard-card">
                        <Card.Body>
                            <h5 className="card-title mb-3">Recent Loans</h5>
                            <div className="table-responsive">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Loan ID</th>
                                            <th>Client Name</th>
                                            <th>Loan Amount</th>
                                            <th>Status</th>
                                            <th>Debt</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentLoans.map((loan) => (
                                            <tr key={loan.loanId}>
                                                <td>{loan.loanId}</td>
                                                <td>{loan.clientName}</td>
                                                <td>{loan.loanAmount}</td>
                                                <td>{loan.loanStatus}</td>
                                                <td>{loan.debt}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row> */}


        </div>
    );
};

export default Dashboard;