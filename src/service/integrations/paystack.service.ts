import axios from 'axios';

const headers = {
    Authorization: `Bearer ${process.env.PAYSTACK_SECRET}`,
    "Content-Type": "application/json"
}

interface PaystackResponse {
    status: boolean
    message: string
    data: any
}

export interface NewTransactionInput {
    email: string
    firstName: string
    lastName: string
    phone: string
    amount: number
    reference: string
    callbackUrl: string
    subAccount?: string
    mainAccountFunds?: number
    chargeBearer?: "subaccount" 
}

export const initiateTransaction = async (input: NewTransactionInput) => {
    try {
        console.log('paystack input ---> ', input)
        const payload = {
            email: input.email,
            amount: input.amount * 100,
            channels: ["card", "bank"],
            // channels: ["card", "bank", "apple_pay", "ussd", "qr", "bank_transfer"],
            phone: input.phone || '',
            callback_url: input.callbackUrl,
            subaccount: input.subAccount, 
            transaction_charge: input.mainAccountFunds,
            bearer: "subaccount",
            metadata: JSON.stringify({
                first_name: input.firstName || '',
                last_name: input.lastName || '',
                customer_phone: input.phone,
                scanServeRef: input.reference
            })
        }
    
        const response = await axios.post(`${process.env.PAYSTACK_BASE_URL}/transaction/initialize`, payload, { headers })
        // console.log('paystack transaction init response: ', response)
        return {
            error: false,
            errorType: '',
            data: response.data
        }
    } catch (error: any) {
        console.log(error)
        return {
            error: true,
            errorType: 'error',
            data: error.message || error
        }
    }
}

interface VerifyTransactionInput {
    reference: string
}

export const verifyTransaction = async (input: VerifyTransactionInput): Promise<{
    error: boolean,
    errorType: string,
    data: any
}> => {
    try {
        console.log(input)
        const response = await axios.get(`${process.env.PAYSTACK_BASE_URL}/transaction/verify/${input.reference}`, { headers })
        console.log('paystack transaction verification response: ', response.data)
        return {
            error: false,
            errorType: '',
            data: response.data
        }
    } catch (error: any) {
        console.log(error.response)
        return {
            error: true,
            errorType: 'error',
            data: error.message || error
        }
    }
} 

interface TransferRecipientInput {
    name: string
    accountNumber: string
    bankCode: string
}

export const createTransferRecipient = async (input: TransferRecipientInput): Promise<{
    error: boolean,
    errorType: string,
    data: any
}> => {
    try {
        const payload = {
            type: "nuban",
            name: input.name,
            account_number: input.accountNumber,
            bank_code: input.bankCode,
            currency: "NGN"
        }

        console.log(input)
        const data = await axios.post(`${process.env.PAYSTACK_BASE_URL}/transferrecipient`, payload, { headers })
        console.log('paystack transfer recipient response: ', data.data)
        const response = data.data as PaystackResponse
        if(response.status === true) {
            return {
                error: false,
                errorType: '',
                data: response.data
            }
        } else {
            return {
                error: true,
                errorType: 'error',
                data: response.data
            }
        }
    } catch (error: any) {
        console.log(error.response)
        return {
            error: true,
            errorType: 'error',
            data: error.message || error
        }
    }
} 

interface SubAccountInput {
    businessName: string
    accountNumber: string
    bankCode: string
}

export const createSubAccount = async (input: SubAccountInput): Promise<{
    error: boolean,
    errorType: string,
    data: any
}> => {
    try {
        const payload = {
            business_name: input.businessName, 
            bank_code: input.bankCode, 
            account_number: input.accountNumber, 
            percentage_charge: 0.1 
        }

        console.log('subaccount payload ---> ', payload)
        const data = await axios.post(`${process.env.PAYSTACK_BASE_URL}/subaccount`, payload, { headers })
        console.log('paystack subaccount response: ', data.data)
        const response = data.data as PaystackResponse
        if(response.status === true) {
            return {
                error: false,
                errorType: '',
                data: response.data
            }
        } else {
            return {
                error: true,
                errorType: 'error',
                data: response.data
            }
        }
    } catch (error: any) {
        console.log(error.response)
        return {
            error: true,
            errorType: 'error',
            data: error.message || error
        }
    }
} 

export interface FundsTransferInput {
//   "source": "balance",
    amount: number // kobo amount
    recipient: string // paystack account recipent code
    reference: string // String, min: 16, max: 50
    reason: string
}

export const transferFunds = async (input: FundsTransferInput): Promise<{
    error: boolean,
    errorType: string,
    data: any
}> => {
    try {
        const payload = { 
            source: "balance",
            amount: input.amount,
            recipient: input.recipient,
            reference: input.reference, 
            reason: input.reason
        }
        console.log(input)

        const data = await axios.post(`${process.env.PAYSTACK_BASE_URL}/transfer`, payload, { headers })
        console.log('paystack transfer response: ', data.data)
        const response = data.data as PaystackResponse

        // Sample data
        // {
        //     "status": true,
        //     "message": "Transfer has been queued",
        //     "data": {
        //         "transfersessionid": [],
        //         "transfertrials": [],
        //         "domain": "test",
        //         "amount": 100000,
        //         "currency": "NGN",
        //         "reference": "acv_9ee55786-2323-4760-98e2-6380c9cb3f68",
        //         "source": "balance",
        //         "source_details": null,
        //         "reason": "Bonus for the week",
        //         "status": "success",
        //         "failures": null,
        //         "transfer_code": "TRF_v5tip3zx8nna9o78",
        //         "titan_code": null,
        //         "transferred_at": null,
        //         "id": 860703114,
        //         "integration": 463433,
        //         "request": 1068439313,
        //         "recipient": 56824902,
        //         "createdAt": "2025-08-04T10:32:40.000Z",
        //         "updatedAt": "2025-08-04T10:32:40.000Z"
        //     }
        // }

        if(response.status === true) {
            return {
                error: false,
                errorType: '',
                data: response.data
            }
        } else {
            return {
                error: true,
                errorType: 'error',
                data: response.data
            }
        }
    } catch (error: any) {
        console.log(error.response)
        return {
            error: true,
            errorType: 'error',
            data: error.message || error
        }
    }
} 

interface ChargeAuthorizationInput {
    authorizationCode: string;
    email: string;
    amount: number;
}

export const chargeAuthorization = async (input: ChargeAuthorizationInput) => {
    try {
        const payload = {
            authorization_code: input.authorizationCode, 
            email: input.email, 
            amount: input.amount
        }
    
        const response = await axios.post(`${process.env.PAYSTACK_BASE_URL}/transaction/charge_authorization`, payload, { headers })
        return response
    } catch (error: any) {
        console.log(error)
        throw new Error(error);
    }
}


interface validateAccountNumberInput {
    accountNumber: string;
    bankCode: string;
    // amount: number;
}

export const validateAccountNumber = async (input: validateAccountNumberInput) => {
    try {
        const response = await axios.get(`${process.env.PAYSTACK_BASE_URL}/bank/resolve?account_number=${input.accountNumber}&bank_code=${input.bankCode}`, { headers })
        return response
    } catch (error: any) {
        console.log(error)
        throw new Error(error);
    }
}

export const listBanks = async () => {
    try {   
        const response = await axios.get(`${process.env.PAYSTACK_BASE_URL}/bank`, { headers })
        return response
    } catch (error: any) {
        console.log('---> ', error.response.data)
        throw new Error(error);
    }
}