export interface iUsersAllowedIp {
    userId: string
    ipAddress: string
}

export interface iUsersRole {
    userId: string
    roleId: string
    userName: string
    firstName: string
    lastName: string
}

export interface iUsersClaim {
    userId: string
    claimType: string
    claimValue: string
    actionId: string
    pageId: string
}

export interface iUsers {
    id: string | undefined;
    userName: string
    email: string
    firstName: string
    lastName: string
    phoneNumber: string
    address: string
    profilePhoto: string
    provider: string
    isActive: boolean
    userAllowedIPs: iUsersAllowedIp[]
    userRoles: iUsersRole[]
    userClaims: iUsersClaim[]
}

export interface iUsersConnected {
    id: string
    userName: string
    firstName: string
    lastName: string
    roles: string
    email: string
    expirationTime: Number
    expirationDate: string
    phoneNumber: string
    refId: string
    token: string
    bearerToken: string
    refreshToken: string
    isAuthenticated: boolean
    profilePhoto: string
    refresh: number
    claims: Array<any>
}

export interface iUsersAction {
    type: string
    users: iUsersConnected | any
}

export interface WalletData {
    id: number;
    name: string;
    gimacMemberCode: string;
    walletType: string;
    countryId: string;
    internalId: string;
    countryName: string;
    serviceDescription: string;
    serviceRef: string;
    queryRef: string;
    queryName: string
}

export interface CountryData {
    countryCode: string;
    country: string;
    serviceProvider: string;
    internalId: string;
    countryId: number;
}

export default class Users {
    id: string | undefined;
    userName: string = '';
    email: string = '';
    firstName: string = '';
    lastName: string = '';
    phoneNumber: string = '';
    address: string = '';
    profilePhoto: string = '';
    provider: string = '';
    isActive: boolean = false;
    userAllowedIPs: iUsersAllowedIp[] = [];
    userRoles: iUsersRole[] = [];
    userClaims: iUsersClaim[] = [];

    constructor(initializer?: any) {
        if (!initializer)
            return;
        if (initializer.id)
            this.id = initializer.id;
        if (initializer.userName)
            this.userName = initializer.userName;
        if (initializer.email)
            this.email = initializer.email;
        if (initializer.firstName)
            this.firstName = initializer.firstName;
        if (initializer.lastName)
            this.lastName = initializer.lastName;
        if (initializer.phoneNumber)
            this.phoneNumber = initializer.phoneNumber;
        if (initializer.address)
            this.address = initializer.address;
        if (initializer.profilePhoto)
            this.profilePhoto = initializer.profilePhoto;
        if (initializer.isActive)
            this.lastName = initializer.isActive;
        if (initializer.userAllowedIPs)
            this.userAllowedIPs = initializer.userAllowedIPs;
        if (initializer.userRoles)
            this.userRoles = initializer.userRoles;
        if (initializer.userClaims)
            this.userClaims = initializer.userClaims;
    }
}