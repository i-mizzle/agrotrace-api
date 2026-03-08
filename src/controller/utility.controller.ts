import { Request, Response } from "express";
import { get } from "lodash";
import * as response from '../responses'
import { listBanks, validateAccountNumber } from "../service/integrations/paystack.service";

export const listBanksHandler = async (req: Request, res: Response) => {
    try {
        
        const banks: any = await listBanks()

        return response.ok(res, banks.data.data)        
    } catch (error:any) {
        return response.error(res, error)
    }
}

export const validateAccountNumberHandler = async (req: Request, res: Response) => {
    try {
        const body: any = req.body;
                
        const validatedAccount: any = await validateAccountNumber({
            bankCode: body.bankCode,
            accountNumber: body.accountNumber
        })

        return response.ok(res, validatedAccount.data.data)        
    } catch (error:any) {
        return response.error(res, error)
    }
}