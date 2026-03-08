import { Request, Response } from "express";
import * as response from '../responses'
import { get } from "lodash";
import { findAndUpdateCart, findCart } from "../service/cart.service";
import { createOrder, orderTotal } from "../service/order.service";
import { findBusiness } from "../service/business.service";
import { findBusinessSetting } from "../service/business-setting.service";
import websocketService from "../service/websocket.service";
import { generateCode } from "../utils/utils";
import { createCustomer, findCustomer } from "../service/customer.service";
import { findTable } from "../service/table.service";

export const checkoutHandler = async (req: Request, res: Response) => {
    try {
        // const userId = get(req, 'user._id');
        const cartId = get(req, 'params.cartId');
        const body = req.body;

        const currentBusiness = await findBusiness({subdomain: req.businessSubdomain})
        if(!currentBusiness) {
            return response.notFound(res, {message: `business not found`})
        }

        const table = await findTable({_id: body.table})
        if(!table) {
            return response.notFound(res, {message: 'table not found'})
        }

        // get store 
        const business = await findBusiness({_id: body.business})
        if(!business) {
            return response.notFound(res, {message: `business not found`})
        }

        const storeSettings = await findBusinessSetting({_id: currentBusiness._id})

        // get cart 
        const cart = await findCart({_id: cartId})
        if(!cart) {
            return response.notFound(res, {message: `cart not found`})
        }
       
        const orderAmounts = orderTotal(cart.items, storeSettings)

        // create order pulling cart items and total price and set payment status to pending
        const orderPayload: any = {
            alias: `table-order-${cartId}`,
            source: 'online',
            items: cart.items,
            total: body.total,
            status: 'pending',
            paymentStatus: 'unpaid',
            sourceMenu: body.sourceMenu,
            business: body.business,
            cart: cart._id,
            table: table._id,
            paymentMethod: body.paymentMethod,
            vat: orderAmounts.vat
        }

        let customer = await findCustomer({email: body.orderBy.email})

        if(!customer) {
            customer = await createCustomer({
                ...body.orderBy,
                business: currentBusiness._id
            })
        }

        const orderRef = generateCode(12, true).toUpperCase()
        
        const order = await createOrder({...orderPayload, orderRef: orderRef, customer: customer._id})

        const cartUpdate = {
            checkoutStatus: 'checked_out'
        }

        // update cart checkout status
        await findAndUpdateCart({_id: cartId}, cartUpdate, {new: true})

        if (order.paymentMethod === 'cash_on_delivery' || order.paymentMethod === 'pos_on_delivery') {
            websocketService.sendToBusiness(
                currentBusiness._id.toString(),
                'order:new',
                {
                    orderId: order._id,
                    orderRef: order.orderRef,
                    total: order.total,
                    status: order.status,
                    customerName: customer.name,
                    table: table._id,
                    createdAt: order.createdAt
                }
            );
        }

        return response.created(res, {message: 'checked out successfully, order created', order: order});
    } catch (error) {
        return response.error(res, error);
    }
}; 