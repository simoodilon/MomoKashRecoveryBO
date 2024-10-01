import React, { useState } from 'react'
import { BreadCrumb } from '../../components'
import { useNavigate } from 'react-router-dom';
import { MKR_Services } from '../../services';
import { toast } from 'react-toastify';
import { iUsersConnected } from '../../features/usermanagement/users';
import { useSelector } from 'react-redux';
import { Spinner } from 'react-bootstrap';


interface FormData {
    bankId: string;
    bankName: string;
}

const AddBank = () => {
    const [formData, setFormData] = useState<FormData>({
        bankId: '',
        bankName: '',
    });
    const navigate = useNavigate();
    const [pending, setPending] = useState(false);

    const connectedUsers: iUsersConnected = useSelector(
        (state: iUsersConnected) => state)

    const token = connectedUsers.token

    const handleConfirmAddBank = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setPending(true);
            const payload = {
                serviceReference: 'ADD_BANK',
                requestBody: JSON.stringify(formData)
            }
            const response = await MKR_Services('GATEWAY', 'clientRecoveryApiService/request', 'POST', payload, token);
            console.log("adddresponse", response);

            console.log("payload", payload);
            console.log("pformDataayload", formData);


            if (response && response.body.meta.statusCode === 200) {
                toast.success('Bank added successfully');
                setFormData({
                    bankId: '',
                    bankName: '',
                });
                navigate('/bank');
            } else if (response && response.body.status === 401) {
                toast.error(response.body.message);
            } else if (response && response.body.meta.statusCode === 500) {
                toast.error(response.body.message || "Bank already exists");
            } else if (response && response.body.meta.statusCode === 400) {
                toast.error('Please enter necessary details!!!' || response.body.meta.message);
            }
            else {
                toast.error('Error adding Bank');
            }
        } catch (error) {
            console.error('Error:', error);

        }
        setPending(false);
    };

    const handleChange = (e: { target: { name: any; value: any; }; }) => {
        const { name, value } = e.target

        setFormData({
            ...formData,
            [name]: value
        })
    }

    const breadCrumb = [
        {
            name: "home",
            link: "/dashboard",
            isActive: false
        },
        {
            name: "Bank Management",
            link: "/bank",
            isActive: false
        },
        {
            name: "Add Bank",
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
                            <BreadCrumb name="Add Bank" links={breadCrumb} children={<></>} />
                        </div>
                    </div>
                </div>

            </div>
            <div className="col-12 grid-margin stretch-card">
                <div className="card">
                    <div className="card-body">
                        <h4 className="card-title">Create a New Bank</h4>
                        <p className="card-description">
                            Create a new bank and add it to the list of banks.
                        </p>
                        <form className="forms-sample">
                            <div className="form-group">
                                <label htmlFor="exampleInputName1"> Bank Id</label>
                                <input type="text" className="form-control" id="exampleInputName1" placeholder="Bank ID" name='bankId' value={formData.bankId} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="exampleInputName1"> Bank Name</label>
                                <input type="text" className="form-control" id="exampleInputName1" placeholder="Name" name='bankName' value={formData.bankName} onChange={handleChange} />
                            </div>

                            <button className="btn btn-primary mr-2" style={{ backgroundColor: "#4B49AC" }} onClick={handleConfirmAddBank}>
                                {pending ? <div className='text-center'><Spinner /></div> : "Submit"}
                            </button>
                            <button className="btn btn-light" onClick={() => navigate("/bank")}>Cancel</button>
                        </form>

                    </div>
                </div>
            </div>
        </div>
    )
}

export default AddBank
