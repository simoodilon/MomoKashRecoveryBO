import React, { useEffect, useState } from 'react';
import { BreadCrumb } from '../../components';
import { useNavigate } from 'react-router-dom';
import { MKR_Services } from '../../services';
import { toast } from 'react-toastify';
import { iUsersConnected } from '../../features/usermanagement/users';
import { useSelector } from 'react-redux';
import { Spinner } from 'react-bootstrap';
import { UserData } from '../settingsPage/UsersManagement';
import { LawyerData } from '../lawyers/Lawyers';

interface FormData {
    password: string;
    email: string;
    userName: string;
    actif: boolean;
    refId: string;
    roles: string;
    msisdn: string;
}

const Register = () => {
    const [formData, setFormData] = useState<FormData>({
        password: '',
        email: '',
        userName: '',
        actif: true,
        refId: '',
        roles: '',
        msisdn: '',
    });
    const navigate = useNavigate();
    const [pending, setPending] = useState(false);
    const [userData, setUserData] = useState<UserData[]>([]);
    const [lawyersData, setLawyersData] = useState<LawyerData[]>([]);
    const [selectedLawyer, setSelectedLawyer] = useState<string>(''); // New state for selected lawyer


    const connectedUsers: iUsersConnected = useSelector(
        (state: iUsersConnected) => state
    );

    const token = connectedUsers.token;

    const handleConfirmRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setPending(true);

            const response = await MKR_Services('GATEWAY', 'recoveryAuthentification/register', 'POST', formData, token);
            console.log("registerResponse", response);

            if (response && response.status === 200) {
                toast.success('User registered successfully');
                setFormData({
                    password: '',
                    email: '',
                    userName: '',
                    actif: true,
                    refId: '',
                    roles: '',
                    msisdn: ''
                })
                navigate('/usermanagement');
            } else {
                toast.error('Error registering user');
            }
        } catch (error) {
            console.error('Error:', error);
        }
        setPending(false);
    };



    useEffect(() => {
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

        fetchLawyersData()

    }, [token])

    // useEffect(() => {
    //     fetchUserData();
    // }, [fetchUserData])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        if (name === 'roles') {
            setFormData({
                ...formData,
                roles: value,
                userName: '',
                refId: '',
                email: '',
            });
            setSelectedLawyer(''); // Reset selected lawyer when role changes
        } else if (name === 'selectedLawyer' && formData.roles === 'AVOCAT') {
            setSelectedLawyer(value);
            const selectedLawyerData = lawyersData.find(lawyer => lawyer.lawyerName === value);
            if (selectedLawyerData) {
                setFormData({
                    ...formData,
                    refId: selectedLawyerData.cni,
                    email: selectedLawyerData.emailAddress,
                });
            }
        } else {
            setFormData({
                ...formData,
                [name]: value,
            });
        }
    };




    console.log("formData", formData);

    const breadCrumb = [
        {
            name: "Dashboard",
            link: "/dashboard",
            isActive: false
        },
        {
            name: "Role Management",
            link: "/rolemanagement",
            isActive: false
        },
        {
            name: "Register User",
            link: "",
            isActive: true
        }
    ];

    return (
        <div>
            <div className="pb-0 mb-0 d-lg-flex justify-content-between align-items-center">
                <div className="mb-1 mb-lg-0">
                    <div className="row">
                        <div className="col-lg-12 col-md-12 col-12">
                            <BreadCrumb name="Register User" links={breadCrumb} children={<></>} />
                        </div>
                    </div>
                </div>
            </div>
            <div className="col-12 grid-margin stretch-card">
                <div className="card">
                    <div className="card-body">
                        <h4 className="card-title">Create a New User</h4>
                        <p className="card-description">
                            Create a new user and add them to the list of users.
                        </p>
                        <form className="forms-sample">

                            <div className="form-group">
                                <label htmlFor="exampleInputRoles">Roles</label>
                                <select
                                    className="form-control"
                                    id="exampleInputRoles"
                                    name='roles'
                                    value={formData.roles}
                                    onChange={handleChange}
                                >
                                    <option value="ADMIN">ADMIN</option>
                                    <option value="USER">USER</option>
                                    <option value="AVOCAT">AVOCAT</option>
                                    <option value="USSD">USSD</option>
                                </select>
                            </div>

                            {formData.roles === 'AVOCAT' ? (
                                <>
                                    <div className="form-group">
                                        <label htmlFor="lawyerId">Lawyer</label>
                                        <select
                                            id="selectedLawyer"
                                            name="selectedLawyer"
                                            value={selectedLawyer}
                                            onChange={handleChange}
                                            className="form-select"
                                        // Disable dropdown if custom username is selected
                                        >
                                            <option value="">Select Lawyer</option>
                                            {lawyersData.map((option) => (
                                                <option key={option.lawyerName} value={option.lawyerName}>
                                                    {option.lawyerName}
                                                </option>
                                            ))}
                                        </select>
                                    </div>


                                    <div className="form-group">
                                        <label htmlFor="exampleInputUserName">Username</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="exampleInputUserName"
                                            placeholder="Username"
                                            name='userName'
                                            value={formData.userName}
                                            onChange={handleChange}
                                        />
                                    </div>


                                </>

                            ) : (
                                <div className="form-group">
                                    <label htmlFor="exampleInputUserName">Username</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="exampleInputUserName"
                                        placeholder="Username"
                                        name='userName'
                                        value={formData.userName}
                                        onChange={handleChange}
                                    />
                                </div>
                            )}


                            <div className="form-group">
                                <label htmlFor="exampleInputEmail">Phone Number</label>
                                <input
                                    type="msisdn"
                                    className="form-control"
                                    id="msisdn"
                                    placeholder="msisdn"
                                    name='msisdn'
                                    value={formData.msisdn}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="exampleInputEmail">Email</label>
                                <input
                                    type="email"
                                    className="form-control"
                                    id="exampleInputEmail"
                                    placeholder="Email"
                                    name='email'
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="exampleInputPassword">Password</label>
                                <input
                                    type="password"
                                    className="form-control"
                                    id="exampleInputPassword"
                                    placeholder="Password"
                                    name='password'
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                            </div>


                            <div className="form-group">
                                <label htmlFor="exampleInputRefId">Reference ID</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="exampleInputRefId"
                                    placeholder="Reference ID"
                                    name='refId'
                                    value={formData.refId}
                                    onChange={handleChange}
                                    readOnly={formData.roles === 'AVOCAT'}
                                />
                            </div>


                            <div className="form-group">
                                <label htmlFor="exampleInputActif" className='me-4'> Active</label>
                                <input
                                    type="checkbox"
                                    className="form-check-input"
                                    id="exampleInputActif"
                                    name='actif'
                                    checked={formData.actif}
                                    onChange={() => setFormData({ ...formData, actif: !formData.actif })}
                                />


                            </div>
                            <button className="btn btn-primary mr-2" style={{ backgroundColor: "#4B49AC" }} onClick={handleConfirmRegister}>
                                {pending ? <div className='text-center'><Spinner /></div> : "Submit"}
                            </button>
                            <button className="btn btn-light" onClick={() => navigate("/usermanagement")}>Cancel</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Register;
