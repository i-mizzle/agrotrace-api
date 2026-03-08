/**
 * WebSocket Usage Examples
 * 
 * This file demonstrates how to use the WebSocket service
 * from controllers, services, and workers.
 */

import { websocketService } from '../service/websocket.service';

// ============================================
// Example 1: Send message to entire business
// ============================================
export function notifyBusinessOrderUpdate(businessId: string, order: any) {
    websocketService.sendToBusiness(businessId, 'order:updated', {
        orderId: order._id,
        status: order.status,
        timestamp: new Date()
    });
}

// ============================================
// Example 2: Send message to specific user
// ============================================
export function notifyUserOrderReady(userId: string, order: any) {
    websocketService.sendToUser(userId, 'order:ready', {
        orderId: order._id,
        orderNumber: order.orderNumber,
        message: 'Your order is ready for pickup!'
    });
}

// ============================================
// Example 3: Send to specific user in business context
// ============================================
export function notifyBusinessUserAssignment(businessId: string, userId: string, task: any) {
    websocketService.sendToBusinessUser(businessId, userId, 'task:assigned', {
        taskId: task._id,
        taskName: task.name,
        priority: task.priority
    });
}

// ============================================
// Example 4: Use in controller
// ============================================
export async function orderControllerExample(req: any, res: any) {
    // Create order logic...
    const order = { _id: '123', status: 'pending' };
    
    // Notify business about new order
    websocketService.sendToBusiness(
        req.currentBusiness._id.toString(),
        'order:new',
        {
            orderId: order._id,
            status: order.status,
            createdAt: new Date()
        }
    );
    
    // Return response
    return res.status(201).json({ success: true, data: order });
}

// ============================================
// Example 5: Use in worker (Bull queue)
// ============================================
export async function processPaymentWorkerExample(job: any) {
    const { businessId, userId, transaction } = job.data;
    
    // Process payment...
    const paymentResult = { success: true, transactionId: transaction._id };
    
    // Notify user about payment completion
    websocketService.sendToUser(userId, 'payment:completed', {
        transactionId: transaction._id,
        amount: transaction.amount,
        status: 'success'
    });
    
    // Also notify business
    websocketService.sendToBusiness(businessId, 'payment:received', {
        transactionId: transaction._id,
        userId,
        amount: transaction.amount
    });
}

// ============================================
// Example 6: Use the generic send method
// ============================================
export function sendGenericNotification(businessId: string, userId?: string, data?: any) {
    websocketService.send({
        business: businessId,
        user: userId, // Optional - if provided, targets specific user
        event: 'notification',
        data: data || { message: 'You have a new notification' }
    });
}

// ============================================
// Example 7: Real-time inventory update
// ============================================
export function notifyInventoryChange(businessId: string, itemId: string, newQuantity: number) {
    websocketService.sendToBusiness(businessId, 'inventory:updated', {
        itemId,
        quantity: newQuantity,
        timestamp: new Date()
    });
}

// ============================================
// Example 8: Table status update (restaurant)
// ============================================
export function notifyTableStatusChange(businessId: string, tableId: string, status: string) {
    websocketService.sendToBusiness(businessId, 'table:status', {
        tableId,
        status, // 'available', 'occupied', 'reserved'
        updatedAt: new Date()
    });
}

// ============================================
// Example 9: Broadcast system maintenance
// ============================================
export function notifySystemMaintenance(message: string) {
    websocketService.broadcast('system:maintenance', {
        message,
        scheduledAt: new Date()
    });
}
