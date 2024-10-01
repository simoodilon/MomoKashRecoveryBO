import React, { useEffect, useState, useMemo } from 'react';
import { BreadCrumb } from '../../components';
import Buttons from '../../components/Button';
import { MKR_Services } from '../../services';
import { useSelector } from 'react-redux';
import ExportCSV from '../../components/ExportCSV';
import DataTable from 'react-data-table-component';
import { Button, Col, Form, Modal, OverlayTrigger, Spinner, Tooltip } from 'react-bootstrap';
import { iUsersConnected } from '../../features/usermanagement/users';
import { toast } from 'react-toastify';
import DatePicker from 'react-date-picker';
import 'react-date-picker/dist/DatePicker.css';
import 'react-calendar/dist/Calendar.css';

// import { Form } from 'react-router-dom';

export interface LawyerData {
    cni: string;
    barNumber: string;
    lawyerName: string;
    emailAddress: string;
    phoneNumber: string;
    areaOfSpecialisation: string;
    yearsOfExperience: number;
    birthDate: string;
    officeAddress: string;
    lawFirmNameOrPractice: string;
    educationalBackground: string;
    description: string;
}

interface FormData {
    cni: string;
    barNumber: string;
    lawyerName: string;
    emailAddress: string;
    phoneNumber: string;
    areaOfSpecialisation: string;
    yearsOfExperience: number;
    birthDate: string;
    officeAddress: string;
    lawFirmNameOrPractice: string;
    educationalBackground: string;
    description: string;
}

type ValuePiece = Date | null;

type Value = ValuePiece | [ValuePiece, ValuePiece];

const Lawyers = () => {
    const [formData, setFormData] = useState<FormData>({
        cni: '',
        barNumber: '',
        lawyerName: '',
        emailAddress: '',
        phoneNumber: '',
        areaOfSpecialisation: '',
        yearsOfExperience: 0,
        birthDate: '',
        officeAddress: '',
        lawFirmNameOrPractice: '',
        educationalBackground: '',
        description: '',
    });
    const [lawyersData, setLawyersData] = useState<LawyerData[]>([]);
    const [selectedLawyer, setSelectedLawyer] = useState<LawyerData | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [lawyerToDelete, setLawyerToDelete] = useState<LawyerData | null>(null);
    const [pending, setPending] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [value, onChange] = useState<Value>(new Date());

    // State for success and error messages
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const connectedUsers: iUsersConnected = useSelector(
        (state: iUsersConnected) => state)

    const token = connectedUsers.token


    // Function to handle form field changes
    const handleChange = (e: { target: { name: string; value: any } }) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    // Filter lawyer data based on search term
    const filteredLawyers = lawyersData ? lawyersData.filter((lawyer) =>
        Object.values(lawyer).some((field) =>
            typeof field === 'string' &&
            field.toLowerCase().includes(searchTerm.toLowerCase())
        )
    ) : [];



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

    const handleConfirmAddLawyer = async () => {
        try {
            setPending(true);
            const payload = {
                serviceReference: 'ADD_LAWYER',
                requestBody: JSON.stringify(formData)
            }
            const response = await MKR_Services('GATEWAY', 'clientRecoveryApiService/request', 'POST', payload, token);
            console.log("adddresponse", response);

            console.log("payload", payload);
            console.log("pformDataayload", formData);


            if (response && response.body.meta.statusCode === 200) {
                hideModalLawyer();
                await fetchLawyersData();
                toast.success(response.body.meta.message || 'Lawyer added successfully');
            } else if (response && response.body.meta.statusCode === 400) {
                toast.error(response.body.meta.message || 'Check your inputs');
            }
            else {
                toast.error(response.body.meta.message || 'Error adding lawyer');
            }
        } catch (error) {
            console.error('Error:', error);

            toast.error('Error adding lawyer');

        }
        setPending(false);
    };

    const handleConfirmEditLawyer = async () => {
        setPending(true);

        try {
            const payload = {
                serviceReference: 'UPDATE_LAWYER',
                requestBody: JSON.stringify(formData)
            }
            const response = await MKR_Services('GATEWAY', 'clientRecoveryApiService/request', 'POST', payload, token);
            if (response && response.body.meta.statusCode === 200) {
                hideModalLawyer();
                await fetchLawyersData();

                toast.success('Lawyer updated successfully');
            } else {
                setSuccessMessage('');
                setErrorMessage(response.body.errors || 'Unauthorized to perform action');
                toast.error('Error updating lawyer');
            }
        } catch (error) {
            console.error('Error:', error);
            setSuccessMessage('');
            setErrorMessage('Error updating lawyer');
        }
        setPending(false);
    };

    const handleConfirmDeleteLawyer = async () => {
        if (!selectedLawyer) return;
        setPending(true);
        try {
            const payload = {
                serviceReference: 'DELETE_LAWYER',
                requestBody: selectedLawyer.cni
            };

            console.log("payload", payload);
            const response = await MKR_Services('GATEWAY', 'clientRecoveryApiService/request', 'POST', payload, token);
            console.log("response====", response);

            if (response && response.body.meta.statusCode === 200) {
                setShowDeleteModal(false);
                await fetchLawyersData();
                toast.success('Lawyer deleted successfully');
            } else if (response && response.body.meta.statusCode === 1002) {
                toast.error(response.body.meta.message || "Lawyer with active Cases Cannot be Deleted");
            }

            else {
                toast.error('Error deleting lawyer');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Error deleting lawyer');
        }
        setPending(false);
    };

    useEffect(() => {
        fetchLawyersData();

        if (!showModal) {
            setSelectedLawyer(null);
        }
    }, [showModal]);

    const handleEdit = (lawyer: LawyerData) => {
        setSelectedLawyer(lawyer);
        setFormData({
            cni: lawyer.cni,
            barNumber: lawyer.barNumber,
            lawyerName: lawyer.lawyerName,
            emailAddress: lawyer.emailAddress,
            phoneNumber: lawyer.phoneNumber,
            areaOfSpecialisation: lawyer.areaOfSpecialisation,
            yearsOfExperience: lawyer.yearsOfExperience,
            birthDate: lawyer.birthDate,
            officeAddress: lawyer.officeAddress,
            lawFirmNameOrPractice: lawyer.lawFirmNameOrPractice,
            educationalBackground: lawyer.educationalBackground,
            description: lawyer.description,
        });
        setShowModal(true);
    };

    const handleDelete = (lawyer: LawyerData) => {
        setSelectedLawyer(lawyer);
        setShowDeleteModal(true);
    };


    const handleToggleLawyerModal = () => {
        setFormData({
            cni: '',
            barNumber: '',
            lawyerName: '',
            emailAddress: '',
            phoneNumber: '',
            areaOfSpecialisation: '',
            yearsOfExperience: 0,
            birthDate: '',
            officeAddress: '',
            lawFirmNameOrPractice: '',
            educationalBackground: '',
            description: '',
        });
        setShowModal(!showModal);
    };

    const hideModalLawyer = () => {
        setShowModal(false);
        setSuccessMessage('');
        setErrorMessage('');
    };

    const getCurrentDate = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = (today.getMonth() + 1).toString().padStart(2, '0');
        const day = today.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const breadCrumb = [
        {
            name: "Home",
            link: "/dashboard",
            isActive: false
        },

        {
            name: "Lawyer Management",
            link: "",
            isActive: true
        }
    ];

    const columns = [
        {
            name: 'CNI',
            selector: (row: LawyerData) => row.cni,
            sortable: true,
            left: true,
            reorder: true,
        },
        {
            name: 'Bar Number',
            selector: (row: LawyerData) => row.barNumber,
            sortable: true,
            left: true,
            reorder: true,
        },
        {
            name: 'Lawyer Name',
            selector: (row: LawyerData) => row.lawyerName,
            sortable: true,
            reorder: true,
        },
        {
            name: 'Email Address',
            selector: (row: LawyerData) => row.emailAddress,
            sortable: true,
            reorder: true,
        },
        {
            name: 'Phone Number',
            selector: (row: LawyerData) => row.phoneNumber,
            sortable: true,
            reorder: true,
        },
        {
            name: 'Area of Specialisation',
            selector: (row: LawyerData) => row.areaOfSpecialisation,
            sortable: true,
            reorder: true,
        },
        {
            name: 'Years of Experience',
            selector: (row: LawyerData) => row.yearsOfExperience,
            sortable: true,
            reorder: true,
        },
        {
            name: 'Actions',
            cell: (row: LawyerData) => (
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

    useEffect(() => {
        const timeout = setTimeout(() => {
            setPending(false);
        }, 2000);
        return () => clearTimeout(timeout);
    }, []);

    const actionsMemo = useMemo(() => <ExportCSV data={lawyersData} />, [lawyersData]);

    return (
        <div>
            <div className="pb-1 mb-0 d-lg-flex justify-content-between align-items-center">
                <div className="mb-1 mb-lg-0">
                    <div className="row">
                        <div className="col-lg-12 col-md-12 col-12">
                            <BreadCrumb name="Lawyer Management" links={breadCrumb} children={<></>} />
                        </div>
                    </div>

                </div>
            </div>

            <div className="card">
                <div className="card-body">


                    <div className="pb-4 mb-0 d-lg-flex justify-content-between align-items-center">
                        <div className="mb-1 mb-lg-0">
                            <div className="row">
                                <div className="col-lg-12 col-md-12 col-12">
                                    <h4 className="card-title">Lawyer Table</h4>
                                </div>
                            </div>
                        </div>
                        <div className="d-flex">
                            <Buttons name='Add Lawyer' onClick={handleToggleLawyerModal} />
                        </div>
                    </div>
                    <DataTable
                        columns={columns}
                        data={filteredLawyers}
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

            <Modal show={showModal} onHide={hideModalLawyer} size='lg' >
                <Modal.Header closeButton>
                    <Modal.Title>{selectedLawyer ? 'Edit Lawyer' : 'Lawyer Information Form'}</Modal.Title>
                </Modal.Header>


                <div className="card-body">
                    {/* <h4 className="card-title">Lawyer Information Form</h4> */}
                    <p className="card-description text-info">
                        Please fill out the form below with the relevant information.
                    </p>
                    <form className="forms-sample row">
                        <div className="form-group col-12">
                            <label htmlFor="formLawyerName">Lawyer Name</label>
                            <input
                                type="text"
                                className="form-control"
                                id="formLawyerName"
                                name="lawyerName"
                                value={formData.lawyerName}
                                onChange={handleChange}
                                placeholder="Enter lawyer name"
                            />
                        </div>

                        <div className="form-group col-6">
                            <label htmlFor="formBarNumber">Bar Number</label>
                            <input
                                type="text"
                                className="form-control"
                                id="formBarNumber"
                                name="barNumber"
                                value={formData.barNumber}
                                onChange={handleChange}
                                placeholder="Enter bar number"
                            />
                        </div>

                        <div className="form-group col-6">
                            <label htmlFor="formEmailAddress">Email Address</label>
                            <input
                                type="email"
                                className="form-control"
                                id="formEmailAddress"
                                name="emailAddress"
                                value={formData.emailAddress}
                                onChange={handleChange}
                                placeholder="Enter email address"
                            />
                        </div>
                        <div className="form-group col-12">
                            <label htmlFor="CNI">CNI</label>
                            <input
                                type="text"
                                className="form-control"
                                id="CNI"
                                name="cni"
                                value={formData.cni}
                                onChange={handleChange}
                                placeholder="Enter CNI"
                            />
                        </div>
                        <div className="form-group col-8">
                            <label htmlFor="formPhoneNumber">Phone Number</label>
                            <input
                                type="text"
                                className="form-control"
                                id="formPhoneNumber"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                placeholder="Enter phone number"
                            />
                        </div>

                        <div className="form-group col-4">
                            <label htmlFor="formYearsOfExperience">Years of Experience</label>
                            <input
                                type="number"
                                className="form-control"
                                id="formYearsOfExperience"
                                name="yearsOfExperience"
                                value={formData.yearsOfExperience}
                                onChange={handleChange}
                                placeholder="Enter years of experience"
                            />
                        </div>

                        <div className="form-group col-6">
                            <label htmlFor="formBirthDate">Birth Date</label>
                            <input
                                type="date"
                                className="form-control"
                                id="formBirthDate"
                                name="birthDate"
                                value={formData.birthDate}
                                onChange={handleChange}
                                placeholder="Enter birth date"
                                max={getCurrentDate()} // Set the max attribute to today's date

                            />

                            {/* <DatePicker className="form-control" name="birthDate" onChange={onChange} value={formData.birthDate}  /> */}

                        </div>

                        <div className="form-group col-6">
                            <label htmlFor="formAreaOfSpecialisation">Area of Specialisation</label>
                            <input
                                type="text"
                                className="form-control"
                                id="formAreaOfSpecialisation"
                                name="areaOfSpecialisation"
                                value={formData.areaOfSpecialisation}
                                onChange={handleChange}
                                placeholder="Enter area of specialisation"
                            />
                        </div>



                        <div className="form-group col-12">
                            <label htmlFor="formOfficeAddress">Office Address</label>
                            <input
                                type="text"
                                className="form-control"
                                id="formOfficeAddress"
                                name="officeAddress"
                                value={formData.officeAddress}
                                onChange={handleChange}
                                placeholder="Enter office address"
                            />
                        </div>

                        <div className="form-group col-12">
                            <label htmlFor="formLawFirmNameOrPractice">Law Firm Name or Practice</label>
                            <input
                                type="text"
                                className="form-control"
                                id="formLawFirmNameOrPractice"
                                name="lawFirmNameOrPractice"
                                value={formData.lawFirmNameOrPractice}
                                onChange={handleChange}
                                placeholder="Enter law firm name or practice"
                            />
                        </div>

                        <div className="form-group col-12">
                            <label htmlFor="formEducationalBackground">Educational Background</label>
                            <input
                                type="text"
                                className="form-control"
                                id="formEducationalBackground"
                                name="educationalBackground"
                                value={formData.educationalBackground}
                                onChange={handleChange}
                                placeholder="Enter educational background"
                            />
                        </div>

                        <div className="form-group col-12">
                            <label htmlFor="formDescription">Description</label>
                            <textarea
                                className="form-control"
                                id="formDescription"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Enter description"
                            />
                        </div>
                    </form>
                </div>

                <Modal.Footer>
                    <Button variant="secondary" onClick={hideModalLawyer}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={selectedLawyer ? handleConfirmEditLawyer : handleConfirmAddLawyer}>
                        {pending ? 'Loading...' : selectedLawyer ? 'Save Changes' : 'Add Lawyer'}
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Delete</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to delete {selectedLawyer?.lawyerName}?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={handleConfirmDeleteLawyer}>{pending ? <Spinner animation="border" size="sm" /> : 'Delete'}</Button>
                </Modal.Footer>
            </Modal>


        </div>
    );
};

export default Lawyers;
