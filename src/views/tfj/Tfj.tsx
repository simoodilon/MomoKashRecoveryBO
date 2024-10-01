import React, { useEffect, useState } from 'react'
import { Button, Form, Modal, Spinner } from 'react-bootstrap'
import { BreadCrumb } from '../../components'
import { useNavigate } from 'react-router-dom';
import { iUsersConnected } from '../../features/usermanagement/users';
import { useSelector } from 'react-redux';
import { MKR_Services } from '../../services';
import { toast } from 'react-toastify';
import Buttons from '../../components/Button';

interface TFJConfigData {

    recoveryDuration: number,
    name: string,
}

interface TFJbyDateData {
    date: string,
}

interface TFJbyDateRangeData {
    startDate: string,
    endDate: string,
}

interface SMSFormData {
    date: string,
}

const Tfj = () => {
    const navigate = useNavigate();
    const [pending, setPending] = useState(false);
    const [tfjConfigData, setTfjConfigData] = useState({
        recoveryDuration: 0,

    });
    const [TFJbyDateData, setTFJbyDateData] = useState<TFJbyDateData>({
        date: "",
    });

    const [TFJbyDateRangeData, setTFJbyDateRangeData] = useState<TFJbyDateRangeData>({
        startDate: "",
        endDate: "",
    });

    const [formData, setFormData] = useState<SMSFormData>({
        date: "",
    });
    const [showModal, setShowModal] = useState(false);
    const [configdata, setConfigData] = useState<TFJConfigData[]>([]);
    const [isConfigDataAvailable, setIsConfigDataAvailable] = useState(false);


    const connectedUsers: iUsersConnected = useSelector(
        (state: iUsersConnected) => state)

    const token = connectedUsers.token

    const formatDate = (date: string) => {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const formatDateSMS = (date: string) => {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${day}/${month}/${year}`;
    };

    const handleTFJConfig = async (e: React.FormEvent) => {

        e.preventDefault(); // Prevent form submission

        setPending(true)

        try {

            const payload = {
                serviceReference: 'TFJ_CONFIG',
                requestBody: JSON.stringify(tfjConfigData),
            };
            const response = await MKR_Services('GATEWAY', 'clientRecoveryApiService/request', 'POST', payload, token);

            // const response = await MKR_Services('TFJ', `Api/Config/createConfig/${tfjConfigData.recoveryDuration}/${tfjConfigData.name}`, 'POST', tfjConfigData, token);
            console.log("response", response);
            console.log("tfjConfigData", tfjConfigData);


            if (response && response.body.status === 200) {

                toast.success(response.body.message)
            } else {
                toast.error("Config already exists Update Config")
            }
        } catch (error) {
            console.log("Error", error)
        }


        setPending(false)
    }
    const handleUpdateTFJConfig = async (e: React.FormEvent) => {

        e.preventDefault(); // Prevent form submission

        setPending(true)

        try {

            const payload = {
                serviceReference: 'UPDATE_CONFIG',
                requestBody: JSON.stringify(tfjConfigData.recoveryDuration),
            };
            const response = await MKR_Services('GATEWAY', 'clientRecoveryApiService/request', 'POST', payload, token);

            // const response = await MKR_Services('TFJ', `Api/Config/createConfig/${tfjConfigData.recoveryDuration}/${tfjConfigData.name}`, 'POST', tfjConfigData, token);
            console.log("response=====", response);
            console.log("tfjConfigData", tfjConfigData);


            if (response && response.status === 200) {

                toast.success("Update Successfull")
            } else {
                toast.error("Error")
            }
        } catch (error) {
            console.log("Error", error)
        }

        // setTfjConfigData({
        //     recoveryDuration: 0,
        //     name: "",
        // })
        setPending(false)
    }
    const handleTFJbyDateRange = async (e: React.FormEvent) => {
        e.preventDefault(); // Prevent form submission
        setPending(true)
        try {
            const formattedStartDate = formatDate(TFJbyDateRangeData.startDate);
            const formattedEndDate = formatDate(TFJbyDateRangeData.endDate);
            const formattedDate = { startDate: formattedStartDate, endDate: formattedEndDate };

            console.log("formattedDate", formattedDate);


            const payload = {
                serviceReference: 'TFJ_BY_DATE_RANGE',
                requestBody: JSON.stringify(formattedDate),
            };

            console.log("payload", payload);

            const response = await MKR_Services('GATEWAY', 'clientRecoveryApiService/request', 'POST', payload, token);

            // const response = await MKR_Services('TFJ', `Api/Tfj/Operation/getAndSaveLoanRepositoryByDateBetween/${TFJbyDateRangeData.startDate}/${TFJbyDateRangeData.endDate}`, 'POST', TFJbyDateRangeData, token);
            console.log("response", response);
            console.log("TFJbyDateRangeData", TFJbyDateRangeData);


            if (response && response.status === 200) {

                toast.success("Successfull")

            } else {
                toast.error("Error")
            }
        } catch (error) {
            console.log("Error", error)
        }


        setPending(false)
    }
    const handleTFJbyDate = async (e: React.FormEvent) => {

        e.preventDefault(); // Prevent form submission

        setPending(true)

        try {
            const formattedDate = formatDate(TFJbyDateData.date);

            const payload = {
                serviceReference: 'TFJ_BY_DATE',
                requestBody: formattedDate,
            };


            const response = await MKR_Services('GATEWAY', 'clientRecoveryApiService/request', 'POST', payload, token);

            // const response = await MKR_Services('TFJ', `Api/Tfj/Operation/getAndTransactionByDate/${TFJbyDateData.date}`, 'POST', TFJbyDateData, token);
            console.log("response", response);
            console.log("TFJbyDateData", TFJbyDateData);


            if (response && response.status === 200) {

                toast.success(response.body.meta.message || "SUCCESS")

            } else {
                toast.error("Error")
            }
        } catch (error) {
            console.log("Error", error)
        }

        setTFJbyDateData({
            date: "",
        })
        setPending(false)
    }
    const handleSendSMS = async (e: React.FormEvent) => {

        e.preventDefault(); // Prevent form submission

        setPending(true)

        try {
            const formattedDate = formatDateSMS(formData.date);

            const payload = {
                serviceReference: 'SEND_SMS',
                requestBody: JSON.stringify({ ...formData, date: formattedDate }),
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

        // setFormData({
        //     date: "",
        // })
        setPending(false)
    }



    useEffect(() => {
        const fetchConfigData = async () => {
            try {
                const payload = {
                    serviceReference: 'GET_CONFIG',
                    requestBody: ''
                };
                const response = await MKR_Services('GATEWAY', 'clientRecoveryApiService/request', 'POST', payload, token);
                // const response = await MKR_Services('GATEWAY', 'recoveryCatalogs/getAllCatalogs', 'GET', null, token);

                console.log("response==", response);

                if (response && response.status === 200) {
                    const config = response.body.data[0]; // Assuming the response contains an array
                    setTfjConfigData({
                        recoveryDuration: config.recoveryDuration,

                    });
                    setIsConfigDataAvailable(true);
                } else {
                    console.error('Error fetching data');
                }
            } catch (error) {
                console.error('Error:', error);
            }
        };
        fetchConfigData()
    }, [])



    const handleChange = (e: { target: { name: any; value: any; }; }, stateType: 'tfjConfigData' | 'TFJbyDateData' | 'TFJbyDateRangeData' | 'formData') => {
        const { name, value } = e.target;
        let formattedValue = value;

        if (stateType === 'tfjConfigData') {
            setTfjConfigData(prevState => ({
                ...prevState,
                [name]: value,
            }));
        } else if (stateType === 'TFJbyDateData') {
            setTFJbyDateData(prevState => ({
                ...prevState,
                [name]: value,
            }));
        }
        else if (stateType === 'TFJbyDateRangeData') {
            setTFJbyDateRangeData(prevState => ({
                ...prevState,
                [name]: value,
            }));
        }
        else if (stateType === 'formData') {
            setFormData(prevState => ({
                ...prevState,
                [name]: value,


            }));
        }
    };

    const handleToggleSMSModal = () => {
        setFormData({
            date: ''
        });
        setShowModal(!showModal);
    };


    const breadCrumb = [
        {
            name: "Home",
            link: "/dashboard",
            isActive: false
        },

        {
            name: "Tfj",
            link: "",
            isActive: true
        }
    ];
    return (
        <div>
            <div className=" pb-0 mb-0 d-lg-flex justify-content-between align-items-center">
                <div className="mb-1 mb-lg-0">
                    <div className="row">
                        <div className="col-lg-12 col-md-12 col-12">
                            <BreadCrumb name="TFJ" links={breadCrumb} children={<></>} />
                        </div>
                    </div>
                </div>

            </div>
            <div className="col-12 grid-margin stretch-card">
                <div className="card">
                    <div className="card-body">
                        <div className="pb-4 mb-0 d-lg-flex justify-content-between align-items-center">
                            <div className="mb-1 mb-lg-0">
                                <div className="row">
                                    <div className="col-lg-12 col-md-12 col-12">
                                        <h4 className="card-title">New Tfj</h4>
                                    </div>
                                </div>
                            </div>
                            {/* <div className="d-flex">
                                <Buttons name='Send Sms' onClick={handleToggleSMSModal} />
                            </div> */}
                        </div>

                        <ul className="nav nav-tabs" id="myTab" role="tablist">
                            <li className="nav-item" role="presentation">
                                <button className="nav-link active" id="home-tab" data-bs-toggle="tab" data-bs-target="#home" type="button" role="tab" aria-controls="home" aria-selected="true">TFJ by Date</button>
                            </li>
                            <li className="nav-item" role="presentation">
                                <button className="nav-link" id="profile-tab" data-bs-toggle="tab" data-bs-target="#profile" type="button" role="tab" aria-controls="profile" aria-selected="false">TFJ by Date Range</button>
                            </li>
                            <li className="nav-item" role="presentation">
                                <button className="nav-link" id="contact-tab" data-bs-toggle="tab" data-bs-target="#contact" type="button" role="tab" aria-controls="contact" aria-selected="false">Configurate</button>
                            </li>

                        </ul>
                        <div className="tab-content" id="myTabContent">

                            <div className="tab-pane fade show active" id="home" role="tabpanel" aria-labelledby="home-tab">
                                <p className="card-description">
                                    Create a new Tfj and add it to the list of Tfjs.
                                </p>

                                <form className="forms-sample">
                                    <div className="form-group">
                                        <label htmlFor="exampleInputName1">Date</label>
                                        <input type="date" className="form-control" id="exampleInputName1" placeholder="Date" name='date' value={TFJbyDateData.date} onChange={(e) => handleChange(e, 'TFJbyDateData')} />
                                    </div>

                                    <button className="btn btn-primary mr-2" style={{ backgroundColor: "#4B49AC" }} onClick={handleTFJbyDate} >
                                        {pending ? <div className='text-center'><Spinner /></div> : "Submit"}
                                    </button>
                                    <button className="btn btn-light" onClick={() => navigate("/Tfj")}>Cancel</button>
                                </form>

                            </div>
                            <div className="tab-pane fade" id="profile" role="tabpanel" aria-labelledby="profile-tab">
                                <form className="forms-sample">
                                    <div className="form-group">
                                        <label htmlFor="exampleInputName1">startDate </label>
                                        <input type="date" className="form-control" id="exampleInputName1" placeholder="Date" name='startDate' value={TFJbyDateRangeData.startDate} onChange={(e) => handleChange(e, 'TFJbyDateRangeData')} />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="exampleInputName1">endDate </label>
                                        <input type="date" className="form-control" id="exampleInputName1" placeholder="Date" name='endDate' value={TFJbyDateRangeData.endDate} onChange={(e) => handleChange(e, 'TFJbyDateRangeData')} />
                                    </div>

                                    <button className="btn btn-primary mr-2" style={{ backgroundColor: "#4B49AC" }} onClick={handleTFJbyDateRange} >
                                        {pending ? <div className='text-center'><Spinner /></div> : "Submit"}
                                    </button>
                                    <button className="btn btn-light" onClick={() => navigate("/Tfj")}>Cancel</button>
                                </form>

                            </div>
                            <div className="tab-pane fade" id="contact" role="tabpanel" aria-labelledby="contact-tab">

                                <form className="forms-sample">
                                    <div className="form-group">
                                        <label htmlFor="exampleInputName1">Recovery Duration</label>
                                        <input type="text" className="form-control" id="exampleInputName1" placeholder="Recovery Duration" name='recoveryDuration' value={tfjConfigData.recoveryDuration} onChange={(e) => handleChange(e, 'tfjConfigData')} />
                                    </div>


                                    {tfjConfigData ? (
                                        <button className="btn btn-primary mr-2" style={{ backgroundColor: "#4B49AC" }} onClick={handleUpdateTFJConfig}>
                                            {pending ? <Spinner animation="border" /> : "Update Config"}
                                        </button>
                                    ) : (
                                        <button className="btn btn-primary mr-2" style={{ backgroundColor: "#4B49AC" }} onClick={handleTFJConfig}>
                                            {pending ? <Spinner animation="border" /> : "Add Config"}
                                        </button>
                                    )}
                                    <button className="btn btn-light" onClick={() => navigate("/Tfj")}>Cancel</button>
                                </form>
                            </div>

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
                        Please fill out the form below with the relevant information.
                    </p>
                    <Form>
                        <div>
                            <label>
                                Date
                            </label>
                            <input className='form-control' id='date' type='date' name='date' value={formData.date} onChange={(e) => handleChange(e, 'formData')} />
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

export default Tfj


