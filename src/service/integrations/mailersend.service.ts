import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";

const mailerSend = new MailerSend({
    apiKey: process.env.MAILERSEND_API_KEY as string,
});

const sentFrom = new Sender("no-reply@scanserve.cloud", "");

interface EmailInput {
    mailTo: string
    firstName: string
    subject: string
    html: string
}

export const sendEmail = async (input: EmailInput) => {
    const recipients = [
        new Recipient(input.mailTo, input.firstName)
    ];
    
    const emailParams = new EmailParams()
        .setFrom(sentFrom)
        .setTo(recipients)
        .setReplyTo(sentFrom)
        .setSubject(input.subject)
        .setHtml(input.html)
        .setText("Greetings from the team, you got this message through MailerSend.");
    
    await mailerSend.email.send(emailParams);
}