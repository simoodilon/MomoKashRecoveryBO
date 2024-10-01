export interface ClientStatusbyLawyer {
    msisdn: string;
    lawyerId: string;
}

export interface ClientHistory {
    msisdn: string;

}

export interface InactiveAndActiveloans {
    active: boolean,
    page: number,
    size: number
}


export interface ClientStatusResponse {
    active: boolean;
    amountPaidOnLoan: number;
    bankId: string;
    bankName: string;
    clientName: string;
    dateOfBirth: string;
    dateTime: string;
    debt: number;
    email: string;
    language: string;
    lawyerId: string;
    loanAmount: number;
    loanDate: string;
    loanId: string;
    loanMomoTransactionId: string;
    loanStatus: string;
    msisdn: string;
    penaltyDate: string;
    penaltyDebt: number;
    preApprovalId: string;
    reSubscriptionDate: string;
    recoveryFee: number;
    subscriptionDate: string;
    unSubscriptionDate: string | null;
}


export interface LoanData {
    loanId: string;
    msisdn: string;
    language: string;
    bankId: string;
    bankName: string;
    loanDate: string;
    loanStatus: string;
    debt: number;
    penaltyDebt: number;
    initialDebt: number;
    initialPenaltyDebt: number;
    loanAmount: number;
    amountPaidOnLoan: number;
    clientName: string;
    unSubscriptionDate: string;
    subscriptionDate: string;
    reSubscriptionDate: string;
    loanMomoTransactionId: string;
    preapprovalId: string;
    penaltyDate: string;
    dateOfBirth: string;
    email: string;
    active: boolean;
    dateTime: string;
    recoveryFee: number;
    lawyerId: string;
}

export interface InactiveAndActiveloansResponse {
    loanId: string;
    msisdn: string;
    language: string;
    bankId: string;
    bankName: string;
    loanDate: string;
    loanStatus: string;
    debt: number;
    penaltyDebt: number;
    loanAmount: number;
    amountPaidOnLoan: number;
    clientName: string;
    unSubscriptionDate: string | null;
    subscriptionDate: string;
    reSubscriptionDate: string;
    loanMomoTransactionId: string;
    preApprovalId: string;
    penaltyDate: string;
    dateOfBirth: string;
    email: string;
    active: boolean;
    dateTime: string;
    recoveryFee: number;
    lawyerId: string;
}

export interface ClientHistoryData {
    msisdn: string;
    id: string;
    loanId: string;
    type: string;
    momoTransactionId: string;
    bankId: string;
    bankName: string;
    name: string;
    amount: number;
    debit: number;
    credit: number;
    balance: number;
    dateTime: string;
}


export interface LoanRefundDetails {
    id: string;
    internalId: string;
    msisdn: string;
    loanId: string;
    totalRefundAmount: number;
    normalAmount: number;
    penaltyAmount: number;
    recoveryFeeAmount: number;
    excess: number;
    balance: number;
    refundCapital: number;
    refundInterest: number;
    refundDate: string;
    refundTime: string;
    refundStatus: string;
    refundPeriod: string;
    bankId: string;
    recoveryBankId: string;
    bankName: string;
    clientName: string;
    momoTransactionId: string;
    dateTime: string;
    successfulCallBack: boolean;
    lawyerId: string;
    callBackPath: string;
}