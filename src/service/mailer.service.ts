'use strict';
const mailgun = require("mailgun-js");
const inlineCSS = require('inline-css');
// const config = require("config");
import fs from 'fs';
import path from 'path';

import config from 'config';

import { OrderNotificationTemplate } from '../static/email-templates/order-notification-template';
import { OrderStatusNotificationTemplate } from '../static/email-templates/order-status-notification-template';
import { UserOrderNotificationTemplate } from '../static/email-templates/user-order-notification-template';
import { NewEnquiryNotificationTemplate } from '../static/email-templates/new-enquiry-notification-template';
import { UserEmailConfirmationTemplate } from '../static/email-templates/emal-confirmation-notification-template';
import { WelcomeTemplate } from '../static/email-templates/welcome-template';
import { NoPublicMenuNotificationTemplate } from '../static/email-templates/no-public-menu-notification-template';
import { PasswordResetEmailTemplate } from '../static/email-templates/password-reset-email-template';

const mailgunConfig: any = config.get('mailgun');

const mg = mailgun({
    apiKey: mailgunConfig.API_KEY, 
    domain: mailgunConfig.DOMAIN,
    // host: 'api.eu.mailgun.net'
});

interface MailParams {
    mailTo: string,
}

export interface OrderNotificationMailParams extends MailParams {
    orderBy: {
        name: string
        email: string
        phone: string
    }
    storeName: string
    items: any[]
    total: string
    deliveryType: string
    paymentMethod: string
    deliveryAddress?: string
    // activationCode?: string
}

export interface OrderStatusNotificationMailParams extends MailParams {
    orderBy: {
        name: string
        email: string
        phone: string
    }
    items: any[]
    storeName: string
    total: string
    deliveryType: string
    paymentMethod: string
    deliveryAddress?: string
    newStatus: string
    // activationCode?: string
}

export interface EnquiryEmailParams extends MailParams {
    name: string
    email: string
    phone: string
    enquiry: string
}

export interface ConfirmationMailParams extends MailParams {
    firstName: string
    activationCode: string
    subdomain: string
}

export async function sendConfirmationNotification (mailParams: ConfirmationMailParams) {
    try {
        const template = UserEmailConfirmationTemplate(mailParams);
        const html = await inlineCSS(template, { url: 'fake' });
        const data = {
            from: 'Scanserve <no-reply@scanserve.cloud>',
            to: mailParams.mailTo,
            subject: 'Confirm your Email',
            // template: 'email_confirmation',
            text: `Confirm your email on Scanserve`,
            html: html,
            // "",
            // "h:X-Mailgun-Variables": JSON.stringify({
            //     firstName: mailParams.firstName,
            //     confirmationUrl: mailParams.confirmationUrl
            // })
        };

        await mg.messages().send(data);
        console.log('Sent!');
        return {
            error: false,
            errorType: '',
            data: {message: `mail sent to ${mailParams.mailTo}`}
        }
    } catch (error) {
        console.log('error in mailer function ', error)
        return {
            error: true,
            errorType: 'error',
            data: error
        }
    }
}

export interface WelcomeMailParams extends MailParams {
    firstName: string
    subdomain: string
}

export async function sendWelcomeEmail (mailParams: WelcomeMailParams) {
    try {
        const template = WelcomeTemplate(mailParams);
        const html = await inlineCSS(template, { url: 'fake' });
        const data = {
            from: 'Scanserve <no-reply@scanserve.cloud>',
            to: mailParams.mailTo,
            subject: 'Welcome to Scanserve',
            // template: 'email_confirmation',
            text: `Glad to have you onboard`,
            html: html,
            // "",
            // "h:X-Mailgun-Variables": JSON.stringify({
            //     firstName: mailParams.firstName,
            //     confirmationUrl: mailParams.confirmationUrl
            // })
        };

        await mg.messages().send(data);
        console.log('Sent!');
        return {
            error: false,
            errorType: '',
            data: {message: `mail sent to ${mailParams.mailTo}`}
        }
    } catch (error) {
        console.log('error in mailer function ', error)
        return {
            error: true,
            errorType: 'error',
            data: error
        }
    }
}

export async function sendOrderNotification (mailParams: OrderNotificationMailParams) {
    try {
        const template = OrderNotificationTemplate(mailParams);
        const html = await inlineCSS(template, { url: 'fake' });
        const data = {
            from: 'Scanserve <no-reply@scanserve.cloud>',
            to: mailParams.mailTo,
            subject: 'New Order on Scanserve',
            // template: 'email_confirmation',
            text: `There's a new order on scanserve`,
            html: html,
            // "",
            // "h:X-Mailgun-Variables": JSON.stringify({
            //     firstName: mailParams.firstName,
            //     confirmationUrl: mailParams.confirmationUrl
            // })
        };

        await mg.messages().send(data);
        console.log('Sent!');
        return {
            error: false,
            errorType: '',
            data: {message: `mail sent to ${mailParams.mailTo}`}
        }
    } catch (error) {
        console.log('error in mailer function ', error)
        return {
            error: true,
            errorType: 'error',
            data: error
        }
    }
}

export async function sendOrderNotificationToUser (mailParams: OrderNotificationMailParams) {
    try {
        const template = UserOrderNotificationTemplate(mailParams);
        const html = await inlineCSS(template, { url: 'fake' });
        const data = {
            from: 'Scanserve <no-reply@scanserve.cloud>',
            to: mailParams.mailTo,
            subject: 'Your new Order on Scanserve ecommerce',
            // template: 'email_confirmation',
            text: `There's a new order on scanserve`,
            html: html,
            // "",
            // "h:X-Mailgun-Variables": JSON.stringify({
            //     firstName: mailParams.firstName,
            //     confirmationUrl: mailParams.confirmationUrl
            // })
        };

        await mg.messages().send(data);
        console.log('Sent!');
        return {
            error: false,
            errorType: '',
            data: {message: `mail sent to ${mailParams.mailTo}`}
        }
    } catch (error) {
        console.log('error in mailer function ', error)
        return {
            error: true,
            errorType: 'error',
            data: error
        }
    }
}

export async function sendOrderStatusUpdateNotification (mailParams: OrderStatusNotificationMailParams) {
    try {
        const template = OrderStatusNotificationTemplate(mailParams);
        const html = await inlineCSS(template, { url: 'fake' });
        const data = {
            from: 'Scanserve <no-reply@scanserve.cloud>',
            to: mailParams.mailTo,
            subject: 'Your order has been updated',
            // template: 'email_confirmation',
            text: `There's a new order on scanserve`,
            html: html,
            // "",
            // "h:X-Mailgun-Variables": JSON.stringify({
            //     firstName: mailParams.firstName,
            //     confirmationUrl: mailParams.confirmationUrl
            // })
        };

        await mg.messages().send(data);
        console.log('Sent!');
        return {
            error: false,
            errorType: '',
            data: {message: `mail sent to ${mailParams.mailTo}`}
        }
    } catch (error) {
        console.log('error in mailer function ', error)
        return {
            error: true,
            errorType: 'error',
            data: error
        }
    }
}

export async function sendEnquiryNotification (mailParams: EnquiryEmailParams) {
    try {
        const template = NewEnquiryNotificationTemplate(mailParams);
        const html = await inlineCSS(template, { url: 'fake' });
        const data = {
            from: 'Scanserve <no-reply@scanserve.cloud>',
            to: mailParams.mailTo,
            subject: 'New Enquiry from Scanserve Website',
            // template: 'email_confirmation',
            text: `There's a new enquiry on scanserve website`,
            html: html,
            // "",
            // "h:X-Mailgun-Variables": JSON.stringify({
            //     firstName: mailParams.firstName,
            //     confirmationUrl: mailParams.confirmationUrl
            // })
        };

        await mg.messages().send(data);
        console.log('Sent!');
        return {
            error: false,
            errorType: '',
            data: {message: `mail sent to ${mailParams.mailTo}`}
        }
    } catch (error) {
        console.log('error in mailer function ', error)
        return {
            error: true,
            errorType: 'error',
            data: error
        }
    }
}

export interface NoPublicMenuMailParams extends MailParams {
    firstName: string
    subdomain: string
    storeName: string
    storefrontUrl: string
    pricesUrl: string
}

export async function sendNoPublicMenuEmail (mailParams: NoPublicMenuMailParams) {
    try {
        const template = NoPublicMenuNotificationTemplate(mailParams);
        const html = await inlineCSS(template, { url: 'fake' });
        const data = {
            from: 'Scanserve <no-reply@scanserve.cloud>',
            to: mailParams.mailTo,
            subject: `${mailParams.storeName} needs a public price card, ${mailParams.firstName}`,
            // template: 'email_confirmation',
            text: ``,
            html: html,
            // "",
            // "h:X-Mailgun-Variables": JSON.stringify({
            //     firstName: mailParams.firstName,
            //     confirmationUrl: mailParams.confirmationUrl
            // })
        };

        await mg.messages().send(data);
        console.log('Sent!');
        return {
            error: false,
            errorType: '',
            data: {message: `mail sent to ${mailParams.mailTo}`}
        }
    } catch (error) {
        console.log('error in mailer function ', error)
        return {
            error: true,
            errorType: 'error',
            data: error
        }
    }
}

interface BackupMailParams extends MailParams {
    firstName: string
    exportDir: string
}

export const sendBackupsEmail = async (mailParams: BackupMailParams) => {
    const files = fs.readdirSync(mailParams.exportDir).map(file => ({
        filename: file,
        path: path.join(mailParams.exportDir, file)
    }));
    const date = new Date().toISOString().slice(0, 10);

    const data = {
        from: 'Scanserve <no-reply@excellers.cloud.ng>',
        to: mailParams.mailTo,
        subject: `Scanserve database dumps for ${config.get('environment')} - ${date}`,
        text: `Please find the exported MongoDB collections attached for ${config.get('environment')} environment.`,
        attachment: files.map(file => fs.createReadStream(file.path))  // Attach file streams
    };

    mg.messages().send(data, (error: any, body: any) => {
        if (error) {
            console.error('Error sending email:', error);
        } else {
            console.log('Email sent:', body);
        }
    });
};

export interface PasswordResetMailParams extends MailParams {
    firstName: string
    resetCode: string
    subdomain: string
}

export async function sendPasswordResetEmail (mailParams: PasswordResetMailParams) {
    try {
        const template = PasswordResetEmailTemplate(mailParams);
        const html = await inlineCSS(template, { url: 'fake' });
        const data = {
            from: 'Scanserve <no-reply@scanserve.cloud>',
            to: mailParams.mailTo,
            subject: `Reset your Scanserve password`,
            text: `Follow this link to reset your password`,
            html: html,
        };
        await mg.messages().send(data);
        console.log('Sent!');
        return {
            error: false,
            errorType: '',
            data: {message: `mail sent to ${mailParams.mailTo}`}
        }
    } catch (error) {
        console.log('error in mailer function ', error)
        return {
            error: true,
            errorType: 'error',
            data: error
        }
    }
}