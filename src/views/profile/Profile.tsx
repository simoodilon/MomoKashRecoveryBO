import React from 'react';
import { useSelector } from 'react-redux';
import { Card, Row, Col, Image } from 'react-bootstrap';
import { FaUser, FaEnvelope, FaPhone, FaClock, FaUserTag } from 'react-icons/fa';
import { iUsersConnected } from '../../features/usermanagement/users';
import { Images } from '../../constants';

const Profile = () => {
    const user: iUsersConnected = useSelector(
        (state: iUsersConnected) => state)
    return (
        <div className="col-12 grid-margin stretch-card">
            <Card>
                <Card.Body>
                    <h4 className="card-title">User Profile</h4>
                    <p className="card-description">
                        View and manage your profile information
                    </p>
                    <Row className="mt-4">
                        <Col md={3} className="text-center mb-4">
                            <Image
                                src={user.profilePhoto || Images.avatar}
                                roundedCircle
                                style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                            />
                        </Col>
                        <Col md={9}>
                            <Row>
                                <Col sm={6} className="mb-3">
                                    <p><FaUser className="mr-2" /> <strong>Username:</strong> {user.userName}</p>
                                </Col>
                                <Col sm={6} className="mb-3">
                                    <p><FaEnvelope className="mr-2" /> <strong>Email:</strong> {user.email}</p>
                                </Col>
                                <Col sm={6} className="mb-3">
                                    <p><FaPhone className="mr-2" /> <strong>Phone:</strong> {user.phoneNumber || 'Not provided'}</p>
                                </Col>
                                <Col sm={6} className="mb-3">
                                    <p><FaUserTag className="mr-2" /> <strong>Role:</strong> {user.roles}</p>
                                </Col>
                                <Col sm={6} className="mb-3">
                                    <p><FaUserTag className="mr-2" /> <strong>Ref Id:</strong> {user.refId || 'Not provided'}</p>
                                </Col>


                            </Row>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
        </div>
    );
};

export default Profile;