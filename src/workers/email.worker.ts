import log from '../logger';
import emailQueue from '../queues/email.queue';
import { sendAdminNewUserNotificationEmail, sendConfirmationNotification, sendWelcomeEmail } from '../service/mailer.service';

log.info('email worker started. waiting for jobs...')

// Process the email jobs from the queue
emailQueue.process(async (job: any) => {
  try {
    switch (job.data.action) {
        case 'email-confirmation-notification':
          console.log('received email confirmation job: ', job.data)
          await sendConfirmationNotification(job.data.data)
          break;

        case 'welcome-email':
          console.log('received welcome email job: ', job.data)
          await sendWelcomeEmail(job.data.data)
          break;

        case 'admin-new-user-notification':
          console.log('received admin new user notification job: ', job.data)
          await sendAdminNewUserNotificationEmail(job.data.data)
          break;

        default:
          break;
    }

    log.info(`${job.data.action} email sent to ${job.data.data.mailTo}`);
  } catch (error) {
    log.error(`${job.data.action} email failed to send to ${job.data.data.to}: `, error);
    throw error; // Allows Bull to handle retries and logging
  }
});
