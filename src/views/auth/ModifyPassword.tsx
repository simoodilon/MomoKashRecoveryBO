import React, { useEffect, useState } from 'react'
import { Images } from '../../constants'
import { MKR_Services } from '../../services';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { iUsersConnected } from '../../features/usermanagement/users';
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';

const ModifyPassword = () => {


    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const connectedUsers: iUsersConnected = useSelector(
        (state: iUsersConnected) => state)

    const token = connectedUsers.token;
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        usernameOrEmail: connectedUsers.userName,
        oldPassword: '',
        newPassword: ''
    });

    useEffect(() => {
        if (successMessage) {
            // Redirect to login page after a delay (e.g., 2 seconds)
            const redirectTimer = setTimeout(() => {
                navigate('/');
            }, 1000);

            // Clear the success message and timer on component unmount
            return () => {
                setSuccessMessage('');
                clearTimeout(redirectTimer);
            };
        }
    }, [successMessage, navigate]);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    const handleConfirmPasswordChange = (e: { target: { value: React.SetStateAction<string>; }; }) => {
        setConfirmPassword(e.target.value);
        setErrorMessage('');
    };

    const handleUpdatePassword = async () => {
        if (formData.newPassword !== confirmPassword) {
            setErrorMessage('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            // Make API request to update password
            const response = await MKR_Services("GATEWAY", 'recoveryAuthentification/changePassword', 'POST', formData, token);
            console.log("response", response);

            if (response && response.status === 200) {
                setErrorMessage('');
                // setSuccessMessage('Password updated successfully');
                toast.success('Password updated successfully');
                await navigate('/');

            } else {
                setErrorMessage(response.body.error || 'Error updating password');
            }
        } catch (error) {
            console.error('Error:', error);
            // setErrorMessage('Error updating password');
            toast.error('Error updating password');
        }

        setLoading(false);
    };

    return (
        <div>
            <div className="container-scroller">
                <div className="container-fluid page-body-wrapper full-page-wrapper">
                    <div className="content-wrapper d-flex align-items-center auth px-0">
                        <div className="row w-100 mx-0">
                            <div className="col-lg-4 mx-auto">
                                <div className="auth-form-light text-left py-5 px-4 px-sm-5">
                                    <div className="brand-logo">
                                        <img src={Images.logo} alt="logo" />
                                    </div>
                                    <h4>New here?</h4>
                                    <h6 className="font-weight-light">Please update your password !!!</h6>
                                    <form className="pt-3">
                                        {/* <div className="form-group">
                                            <input
                                                type="text"
                                                className="form-control form-control-lg"
                                                id="exampleInputUsername1"
                                                placeholder="Username"
                                                name='usernameOrEmail'
                                                value={formData.usernameOrEmail}
                                                onChange={(e) => setFormData({ ...formData, usernameOrEmail: e.target.value })}
                                            />
                                        </div> */}


                                        <div className="mb-3">
                                            <label htmlFor="password" className="form-label">Old Password</label>
                                            <div style={{ position: 'relative', display: 'flex' }}>
                                                <input
                                                    type={showPassword ? 'text' : 'password'}
                                                    className="form-control form-control-lg"
                                                    id="oldPassword"
                                                    name='oldPassword'
                                                    placeholder="Old Password"
                                                    value={formData.oldPassword}
                                                    onChange={(e) => setFormData({ ...formData, oldPassword: e.target.value })}
                                                />
                                                <button
                                                    onClick={togglePasswordVisibility}
                                                    style={{
                                                        position: 'absolute',
                                                        top: '50%',
                                                        transform: 'translateY(-50%)',
                                                        right: '5px',
                                                        background: 'none',
                                                        border: 'none',
                                                        cursor: 'pointer'
                                                    }}>
                                                    <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} />
                                                </button>
                                            </div>
                                        </div>


                                        <div className="mb-3">
                                            <label htmlFor="password" className="form-label">New Password</label>
                                            <div style={{ position: 'relative', display: 'flex' }}>
                                                <input
                                                    type={showPassword ? 'text' : 'password'}
                                                    className="form-control form-control-lg"
                                                    id="newPassword"
                                                    name='newPassword'
                                                    placeholder="New Password"
                                                    value={formData.newPassword}
                                                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                                />
                                                <button
                                                    onClick={togglePasswordVisibility}
                                                    style={{
                                                        position: 'absolute',
                                                        top: '50%',
                                                        transform: 'translateY(-50%)',
                                                        right: '5px',
                                                        background: 'none',
                                                        border: 'none',
                                                        cursor: 'pointer'
                                                    }}>
                                                    <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} />
                                                </button>
                                            </div>
                                        </div>


                                        <div className="mb-3">
                                            <label htmlFor="password" className="form-label">Confirm New Password</label>
                                            <div style={{ position: 'relative', display: 'flex' }}>
                                                <input
                                                    type={showPassword ? 'text' : 'password'}
                                                    className="form-control form-control-lg"
                                                    autoComplete="new-password"
                                                    placeholder="Confirm New Password"
                                                    value={confirmPassword}
                                                    onChange={handleConfirmPasswordChange}

                                                />
                                                <button
                                                    onClick={toggleConfirmPasswordVisibility}
                                                    style={{
                                                        position: 'absolute',
                                                        top: '50%',
                                                        transform: 'translateY(-50%)',
                                                        right: '5px',
                                                        background: 'none',
                                                        border: 'none',
                                                        cursor: 'pointer'
                                                    }}>
                                                    <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} />
                                                </button>
                                            </div>
                                        </div>
                                        {errorMessage && <div className="text-danger mt-2">{errorMessage}</div>}
                                        {successMessage && <div className="text-success mt-2">{successMessage}</div>}
                                        <div className="mb-4">
                                            <div className="form-check">
                                                <label className="form-check-label text-muted">
                                                    <input type="checkbox" className="form-check-input" />
                                                    I agree to all Terms & Conditions
                                                </label>
                                            </div>
                                        </div>
                                        <div className="mt-3">
                                            <Button className="btn btn-block btn-primary btn-lg font-weight-medium auth-form-btn" onClick={handleUpdatePassword} disabled={loading}>
                                                {loading ? 'Updating Password...' : 'Update Password'}

                                            </Button>
                                        </div>


                                        <div className="text-center mt-4 font-weight-light">
                                            <a href="/" className="text-primary">Click here to Login</a>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    )
}

export default ModifyPassword
