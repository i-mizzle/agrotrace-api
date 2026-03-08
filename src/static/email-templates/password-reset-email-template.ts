import { PasswordResetMailParams } from "../../service/mailer.service";
import config from 'config'
const frontendUrl = config.get('frontendUrl') as string


export const PasswordResetEmailTemplate = (input: PasswordResetMailParams) => {
    let emailTemplate =  `<!DOCTYPE html>
    <html style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;">
    <head>
    <meta name="viewport" content="width=device-width" />
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title>Actionable emails e.g. reset password</title>
    
    
    <style type="text/css">
    img {
    max-width: 100%;
    }
    body {
    -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: none; width: 100% !important; height: 100%; line-height: 1.6em;
    }
    body {
    background-color: #f6f6f6;
    }
    @media only screen and (max-width: 640px) {
      body {
        padding: 0 !important;
      }
      h1 {
        font-weight: 800 !important; margin: 20px 0 5px !important;
      }
      h2 {
        font-weight: 800 !important; margin: 20px 0 5px !important;
      }
      h3 {
        font-weight: 800 !important; margin: 20px 0 5px !important;
      }
      h4 {
        font-weight: 800 !important; margin: 20px 0 5px !important;
      }
      h1 {
        font-size: 22px !important;
      }
      h2 {
        font-size: 18px !important;
      }
      h3 {
        font-size: 16px !important;
      }
        p{
            font-size: 14px !important;
            margin-bottom: 10px;
        }
        li {
            font-size: 14px !important;
            margin-bottom: 5px;
            list-style: disc
        }
      .container {
        padding: 0 !important; width: 100% !important;
      }
      .content {
        padding: 0 !important;
      }
      .content-wrap {
        padding: 10px !important;
      }
      .invoice {
        width: 100% !important;
      }
    }
    </style>
    </head>
    
    <body itemscope itemtype="http://schema.org/EmailMessage" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: none; width: 100% !important; height: 100%; line-height: 1.6em; background-color: #f6f6f6; margin: 0;" bgcolor="#f6f6f6">

    
    <table class="body-wrap" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; width: 100%; background-color: #f6f6f6; margin: 0;" bgcolor="#f6f6f6">
    
    <tr style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;"><td style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0;" valign="top"></td>
        <td class="container" width="600" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; display: block !important; max-width: 600px !important; clear: both !important; margin: 0 auto;" valign="top">
          <div class="content" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; max-width: 600px; display: block; margin: 0 auto; padding: 20px;">
          <img src="https://res.cloudinary.com/dsdjt8qsv/image/upload/v1758270888/logo_rrtyoj.png" style="max-width: 100%; width: 150px; margin-bottom: 25px; margin-top: 15px;" />
        `

emailTemplate += `
      <table class="main" width="100%" cellpadding="0" cellspacing="0" itemprop="action" itemscope itemtype="http://schema.org/ConfirmAction" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; border-radius: 3px; background-color: #fff; margin: 0; border: 1px solid #e9e9e9;" bgcolor="#fff">

            <tr style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;">

                <td class="content-wrap" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0; padding: 20px;" valign="top">

                    <meta itemprop="name" content="Confirm Email" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;" />
                    
                    <table width="100%" cellpadding="0" cellspacing="0" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;">
                        <tr>
                            <td>

                                <p>Hi ${input.firstName},</p>

                                <p>We have received a request to reset your password on scanserve. Please click the link below to create a new password if you initiated this request</p>

                                <a href="${input.subdomain}.${frontendUrl}/confirm-email/${input?.resetCode}" style="padding: 15px; border-radius: 8px; background-color: #2F2F31; color: #f6f6f6; font-size: 14px; font-weight: 500; margin-bottom: 20px; display: inline-block; margin-top: 10px; text-decoration: none;">Create a new password</a><br/>

                                <i style="color:blue;">${input.subdomain}.${frontendUrl}/confirm-email/${input?.resetCode}</i><br/>
                                <i style="color:#666;">Copy and paste the link above n your browser if the button doesn't work</i>

                                <p>You can safely ignore this email if you did not request this password reset or if it was done in error.</p>

                                <p>Cheers,<br/>
                                The Scanserve Team</p>

                            </td>
                        </tr>
                    </table>
                </td>
            </tr>`


            emailTemplate += `</table><div class="footer" style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; width: 100%; clear: both; color: #999; margin: 0; padding: 20px;">`

            emailTemplate += `
          </div></div>
        </td>
        <td style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0;" valign="top"></td>
      </tr></table></body>
    </html>`

    return emailTemplate
}

