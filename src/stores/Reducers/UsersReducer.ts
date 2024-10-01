import { iUsersAction, iUsersConnected } from "../../features/usermanagement/users";

const initialState: iUsersConnected = {
    id: '',
    userName: '',
    firstName: '',
    lastName: '',
    email: '',
    roles: '',
    expirationTime: 0,
    expirationDate: '',
    refId: '',
    phoneNumber: '',
    token: '',
    bearerToken: '',
    refreshToken: '',
    isAuthenticated: false,
    profilePhoto: '',
    refresh: 0,
    claims: []
};



const users = (state: iUsersConnected = initialState, action: iUsersAction): iUsersConnected => {

    let nextstate = initialState;

    switch (action.type) {
        case "LOGIN":
            // Assuming action.users contains the updated user information after login
            nextstate = {
                ...state,
                ...action.users,
                isAuthenticated: true
            };


            return nextstate || state;

        case "LOGOUT":
            return initialState;

        default:
            return nextstate || state;
    }
};

export default users;
