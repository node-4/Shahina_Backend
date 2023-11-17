var nodemailer = require('nodemailer');
var FCM = require('fcm-node');
module.exports = {
  sendMail: (email, text, userName, callback) => {
    let html = `<!DOCTYPE HTML PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
            <head>
            <!--[if gte mso 9]>
            <xml>
              <o:OfficeDocumentSettings>
                <o:AllowPNG/>
                <o:PixelsPerInch>96</o:PixelsPerInch>
              </o:OfficeDocumentSettings>
            </xml>
            <![endif]-->
              <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <meta name="x-apple-disable-message-reformatting">
              <!--[if !mso]><!--><meta http-equiv="X-UA-Compatible" content="IE=edge"><!--<![endif]-->
              <title></title>
              
                <style type="text/css">
                  table, td { color: #000000; } @media only screen and (min-width: 670px) {
              .u-row {
                width: 650px !important;
              }
              .u-row .u-col {
                vertical-align: top;
              }
            
              .u-row .u-col-100 {
                width: 650px !important;
              }
            
            }
            
            @media (max-width: 670px) {
              .u-row-container {
                max-width: 100% !important;
                padding-left: 0px !important;
                padding-right: 0px !important;
              }
              .u-row .u-col {
                min-width: 320px !important;
                max-width: 100% !important;
                display: block !important;
              }
              .u-row {
                width: calc(100% - 40px) !important;
              }
              .u-col {
                width: 100% !important;
              }
              .u-col > div {
                margin: 0 auto;
              }
            }
            body {
              margin: 0;
              padding: 0;
            }
            
            table,
            tr,
            td {
              vertical-align: top;
              border-collapse: collapse;
            }
            
            p {
              margin: 0;
            }
            
            .ie-container table,
            .mso-container table {
              table-layout: fixed;
            }
            
            * {
              line-height: inherit;
            }
            
            a[x-apple-data-detectors='true'] {
              color: inherit !important;
              text-decoration: none !important;
            }
            
            </style>
              
              
            
            <!--[if !mso]><!--><link href="https://fonts.googleapis.com/css?family=Montserrat:400,700&display=swap" rel="stylesheet" type="text/css"><!--<![endif]-->
            
            </head>
            
            <body class="clean-body u_body" style="margin: 0;padding: 0;-webkit-text-size-adjust: 100%;background-color: #ffffff;color: #000000">
              <!--[if IE]><div class="ie-container"><![endif]-->
              <!--[if mso]><div class="mso-container"><![endif]-->
              <table style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;min-width: 320px;Margin: 0 auto;background-color: #ffffff;width:100%" cellpadding="0" cellspacing="0">
              <tbody>
              <tr style="vertical-align: top">
                <td style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">
                <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="background-color: #ffffff;"><![endif]-->
                
            
            <div class="u-row-container" style="padding: 0px;background-color: transparent">
              <div class="u-row" style="Margin: 0 auto;min-width: 320px;max-width: 650px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #dff1ff;">
                <div style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
                  <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:650px;"><tr style="background-color: #dff1ff;"><![endif]-->
                  
            <!--[if (mso)|(IE)]><td align="center" width="650" style="background-color: #ffffff;width: 650px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
            <div class="u-col u-col-100" style="max-width: 320px;min-width: 650px;display: table-cell;vertical-align: top;">
              <div style="background-color: #ffffff;width: 100% !important;">
              <!--[if (!mso)&(!IE)]><!--><div style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;"><!--<![endif]-->
              
            <table style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
              <tbody>
                <tr>
                  <td style="overflow-wrap:break-word;word-break:break-word;padding:13px 0px 15px;font-family:'Montserrat',sans-serif;" align="left">
                    
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="padding-right: 0px;padding-left: 0px;" align="center">
                 
                <img align="center" border="0"
                src="https://res.cloudinary.com/listyourpics/image/upload/v1653630166/i0fugotwu56jouwyrmje.png"
                alt="Image" title="Image"
                style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: inline-block !important;border: none;height: auto;float: none;width: 54%;max-width: 100px;"
                width="100" />
                  
                </td>
              </tr>
            </table>
            
                  </td>
                </tr>
              </tbody>
            </table>
            
              <!--[if (!mso)&(!IE)]><!--></div><!--<![endif]-->
              </div>
            </div>
            <!--[if (mso)|(IE)]></td><![endif]-->
                  <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
                </div>
              </div>
            </div>
            
            
            
            <div class="u-row-container" style="padding: 0px;background-color: transparent">
              <div class="u-row" style="Margin: 0 auto;min-width: 320px;max-width: 650px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #f3fbfd;">
                <div style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
                  <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:650px;"><tr style="background-color: #f3fbfd;"><![endif]-->
                  
            <!--[if (mso)|(IE)]><td align="center" width="650" style="width: 650px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
            <div class="u-col u-col-100" style="max-width: 320px;min-width: 650px;display: table-cell;vertical-align: top;">
              <div style="width: 100% !important;">
              <!--[if (!mso)&(!IE)]><!--><div style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;"><!--<![endif]-->
              
            <table style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
              <tbody>
                <tr>
                  <td style="overflow-wrap:break-word;word-break:break-word;padding:40px 10px 10px;font-family:'Montserrat',sans-serif;" align="left">
                    
              <div style="color: #1b262c; line-height: 140%; text-align: center; word-wrap: break-word;">
                <p style="font-size: 14px; line-height: 140%;"><strong><span style="font-size: 24px; line-height: 33.6px;">Welcome to ListYourPics</span></strong></p>
              </div>
            
                  </td>
                </tr>
              </tbody>
            </table>
            
            <table style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
              <tbody>
                <tr>
                  <td style="overflow-wrap:break-word;word-break:break-word;padding:10px 50px 20px;font-family:'Montserrat',sans-serif;" align="left">
                    
              <div style="color: #1b262c; line-height: 140%; text-align: left; word-wrap: break-word;">
                <p style="font-size: 14px; line-height: 140%;">
                Dear ${userName},
                <br><br>
                OTP for your E-mail verification is  ${text}. Please use this  OTP (One-Time-Password) to login to your own ListYourPics and access the unlimited possibilities of ListYourPics.
                <br><br>
                This OTP is valid for the next 05 minutes and can be used only once.<br><br>
        
                <br><br>
                Thanks and regards <br>
                Team Listyourpic
                </p>
              </div>
            
                  </td>
                </tr>
              </tbody>
            </table>
            
              <!--[if (!mso)&(!IE)]><!--></div><!--<![endif]-->
              </div>
            </div>
            <!--[if (mso)|(IE)]></td><![endif]-->
                  <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
                </div>
              </div>
            </div>
            
            
            
            <div class="u-row-container" style="padding: 0px;background-color: transparent">
              <div class="u-row" style="Margin: 0 auto;min-width: 320px;max-width: 650px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #151418;">
                <div style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
                  <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:650px;"><tr style="background-color: #151418;"><![endif]-->
                  
            <!--[if (mso)|(IE)]><td align="center" width="650" style="width: 650px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
            <div class="u-col u-col-100" style="max-width: 320px;min-width: 650px;display: table-cell;vertical-align: top;">
              <div style="width: 100% !important;">
              <!--[if (!mso)&(!IE)]><!--><div style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;"><!--<![endif]-->
              
            <table style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
              <tbody>
                <tr>
                  <td style="overflow-wrap:break-word;word-break:break-word;padding:18px;font-family:'Montserrat',sans-serif;" align="left">
                    
              <div style="color: #ffffff; line-height: 140%; text-align: center; word-wrap: break-word;">
                <p dir="rtl" style="font-size: 14px; line-height: 140%;"><span style="font-size: 14px; line-height: 19.6px;">Copyright @ 2022 ListYourPics | All RIghts Reserved</span></p>
              </div>
            
                  </td>
                </tr>
              </tbody>
            </table>
            
              <!--[if (!mso)&(!IE)]><!--></div><!--<![endif]-->
              </div>
            </div>
            <!--[if (mso)|(IE)]></td><![endif]-->
                  <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
                </div>
              </div>
            </div>
            
            
                <!--[if (mso)|(IE)]></td></tr></table><![endif]-->
                </td>
              </tr>
              </tbody>
              </table>
              <!--[if mso]></div><![endif]-->
              <!--[if IE]></div><![endif]-->
            </body>
            </html>`
    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        "user": "info@shahinahoja.com",
        "pass": "gganlypsemwqhwlh"
      }
    });
    let mailOptions;
    mailOptions = {
      from: 'info@shahinahoja.com',
      to: email,
      subject: 'Forget password verification',
      html: html,
    };
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        callback(error, null)
      } else {
        callback(null, info.response)
      }
    });
  },
  pushNotificationforUser: (deviceToken, title, body) => {
    return new Promise((resolve, reject) => {
      var serverKey = 'AAAALBHVLdY:APA91bEvOzvyZ9QODspc4-36_hTs_k5AmAhagPNY6CGC6HCGzozKayrBnSfr6y0TEnpxhupiJeY7-szp_9Ty0s9rWZMg7p8P_SOxru07yAQrMLicr_Q9mM6EdskBKUXx3FsoJVErQKFE';
      var fcm = new FCM(serverKey);
      var message = { to: deviceToken, "content_available": true, notification: { title: title, body: body } };
      fcm.send(message, function (err, response) {
        if (err) {
          console.log(">>>>>>>>>>", err)
          return resolve(err);
        } else {
          console.log(">>>>>>>>>response", response)
          return resolve(response);

        }
      });
    });
  },
  sendMail1: (email, code, callback) => {
    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        "user": "info@shahinahoja.com",
        "pass": "gganlypsemwqhwlh"
      }
    });
    let mailOptions = {
      from: 'info@shahinahoja.com',
      to: email,
      subject: 'Gift Card Provide by Your friend',
      text: `Gift Card Provide by Your friend Coupan Code is ${code}`,
    };
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        callback(error, null)
      } else {
        callback(null, info.response)
      }
    });
  },

  sendMailtoAdmin: (email, text, userName, callback) => {
    let html = `
    <!DOCTYPE HTML
      PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    
    <head>
      <!--[if gte mso 9]>
                <xml>
                  <o:OfficeDocumentSettings>
                    <o:AllowPNG/>
                    <o:PixelsPerInch>96</o:PixelsPerInch>
                  </o:OfficeDocumentSettings>
                </xml>
                <![endif]-->
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta name="x-apple-disable-message-reformatting">
      <!--[if !mso]><!-->
      <meta http-equiv="X-UA-Compatible" content="IE=edge"><!--<![endif]-->
      <title></title>
    
      <style type="text/css">
        table,
        td {
          color: #000000;
        }
    
        @media only screen and (min-width: 670px) {
          .u-row {
            width: 650px !important;
          }
    
          .u-row .u-col {
            vertical-align: top;
          }
    
          .u-row .u-col-100 {
            width: 650px !important;
          }
    
        }
    
        @media (max-width: 670px) {
          .u-row-container {
            max-width: 100% !important;
            padding-left: 0px !important;
            padding-right: 0px !important;
          }
    
          .u-row .u-col {
            min-width: 320px !important;
            max-width: 100% !important;
            display: block !important;
          }
    
          .u-row {
            width: calc(100% - 40px) !important;
          }
    
          .u-col {
            width: 100% !important;
          }
    
          .u-col>div {
            margin: 0 auto;
          }
        }
    
        body {
          margin: 0;
          padding: 0;
        }
    
        table,
        tr,
        td {
          vertical-align: top;
          border-collapse: collapse;
        }
    
        p {
          margin: 0;
        }
    
        .ie-container table,
        .mso-container table {
          table-layout: fixed;
        }
    
        * {
          line-height: inherit;
        }
    
        a[x-apple-data-detectors='true'] {
          color: inherit !important;
          text-decoration: none !important;
        }
      </style>
    
    
    
      <!--[if !mso]><!-->
      <link href="https://fonts.googleapis.com/css?family=Montserrat:400,700&display=swap" rel="stylesheet" type="text/css">
      <!--<![endif]-->
    
    </head>
    <body>
      <div>
        <p style="margin-top:48.25pt; margin-left:32.1pt; text-align:justify; line-height:23.15pt"><span
            style="font-family:Calibri; font-size:19pt">Appointment</span><span
            style="font-family:Calibri; font-size:19pt; letter-spacing:5.4pt"> </span><span
            style="font-family:Calibri; font-size:19pt">confirmed</span></p>
        <p style="margin-top:30.85pt; margin-left:32.8pt; text-align:justify; line-height:13.4pt"><span
            style="font-family:Calibri; font-size:11pt">Hi</span><span
            style="font-family:Calibri; font-size:11pt; letter-spacing:2.05pt"> </span><span
            style="font-family:Calibri; font-size:11pt">Shahina</span><span
            style="font-family:Calibri; font-size:11pt; letter-spacing:6.65pt"> </span><span
            style="font-family:Calibri; font-size:11pt">Hoja,</span></p>
        <p style="margin-top:12.85pt; margin-right:58.55pt; margin-left:32.45pt; line-height:13.9pt"><span
            style="font-family:Calibri; font-size:11pt">The</span><span
            style="font-family:Calibri; font-size:11pt; letter-spacing:3.35pt"> </span><span
            style="font-family:Calibri; font-size:11pt">following</span><span
            style="font-family:Calibri; font-size:11pt; letter-spacing:2.9pt"> </span><span
            style="font-family:Calibri; font-size:11pt">appointment</span><span
            style="font-family:Calibri; font-size:11pt; letter-spacing:3.4pt"> </span><span
            style="font-family:Calibri; font-size:11pt">has</span><span
            style="font-family:Calibri; font-size:11pt; letter-spacing:3.9pt"> </span><span
            style="font-family:Calibri; font-size:11pt">been</span><span
            style="font-family:Calibri; font-size:11pt; letter-spacing:3.2pt"> </span><span
            style="font-family:Calibri; font-size:11pt">booked online</span></p>
        <p style="margin-top:6.2pt; margin-right:59.15pt; margin-left:32.45pt; line-height:12.8pt"><span
            style="font-family:Calibri; font-size:11pt">JeTOP</span><span
            style="font-family:Calibri; font-size:11pt; letter-spacing:8pt"> </span><span
            style="font-family:Calibri; font-size:11pt">Hair</span><span
            style="font-family:Calibri; font-size:11pt; letter-spacing:2.95pt"> </span><span
            style="font-family:Calibri; font-size:11pt">Loss</span><span
            style="font-family:Calibri; font-size:11pt; letter-spacing:4.9pt"> </span><span
            style="font-family:Calibri; font-size:11pt">Treatment/restoration</span><span
            style="font-family:Calibri; font-size:11pt; letter-spacing:4.35pt"> </span><span
            style="font-family:Calibri; font-size:11pt">with Shahina</span><span
            style="font-family:Calibri; font-size:11pt; letter-spacing:6.3pt"> </span><span
            style="font-family:Calibri; font-size:11pt">Hoja</span></p>
        <p style="margin-top:0.05pt; margin-left:32.45pt; text-align:justify; line-height:13.4pt"><span
            style="font-family:Calibri; font-size:11pt">Saturday,</span><span
            style="font-family:Calibri; font-size:11pt; letter-spacing:5.75pt"> </span><span
            style="font-family:Calibri; font-size:11pt">16</span><span
            style="font-family:Calibri; font-size:11pt; letter-spacing:2.05pt"> </span><span
            style="font-family:Calibri; font-size:11pt">Dec</span><span
            style="font-family:Calibri; font-size:11pt; letter-spacing:3.45pt"> </span><span
            style="font-family:Calibri; font-size:11pt">2023</span><span
            style="font-family:Calibri; font-size:11pt; letter-spacing:3.75pt"> </span><span
            style="font-family:Calibri; font-size:11pt">at</span><span
            style="font-family:Calibri; font-size:11pt; letter-spacing:2.1pt"> </span><span
            style="font-family:Calibri; font-size:11pt">1:45pm</span></p>
        <p style="margin-top:14.4pt; margin-left:32.1pt; text-align:justify; line-height:13.4pt"><span
            style="font-family:Calibri; font-size:11pt">At</span><span
            style="font-family:Calibri; font-size:11pt; letter-spacing:1.75pt"> </span><span
            style="font-family:Calibri; font-size:11pt">this</span><span
            style="font-family:Calibri; font-size:11pt; letter-spacing:2.6pt"> </span><span
            style="font-family:Calibri; font-size:11pt">location:</span></p>
        <p style="margin-top:5.15pt; margin-right:78.05pt; margin-left:32.1pt; text-indent:0.35pt; line-height:13.15pt">
          <span style="font-family:Calibri; font-size:11pt">Shahina</span><span
            style="font-family:Calibri; font-size:11pt; letter-spacing:6.3pt"> </span><span
            style="font-family:Calibri; font-size:11pt">Hoja</span><span
            style="font-family:Calibri; font-size:11pt; letter-spacing:2.65pt"> </span><span
            style="font-family:Calibri; font-size:11pt">Aesthetics</span><span
            style="font-family:Calibri; font-size:11pt; letter-spacing:6.2pt"> </span><span
            style="font-family:Calibri; font-size:11pt">-</span><span
            style="font-family:Calibri; font-size:11pt; letter-spacing:1.65pt"> </span><span
            style="font-family:Calibri; font-size:11pt">Shahina</span><span
            style="font-family:Calibri; font-size:11pt; letter-spacing:6.65pt"> </span><span
            style="font-family:Calibri; font-size:11pt">Hoja Aesthetics</span>
        </p>
        <p style="margin-top:0.05pt; margin-left:32.45pt; text-align:justify; line-height:13.4pt"><span
            style="font-family:Calibri; font-size:11pt">905</span><span
            style="font-family:Calibri; font-size:11pt; letter-spacing:2.55pt"> </span><span
            style="font-family:Calibri; font-size:11pt">Watters</span><span
            style="font-family:Calibri; font-size:11pt; letter-spacing:3.2pt"> </span><span
            style="font-family:Calibri; font-size:11pt">Creek</span><span
            style="font-family:Calibri; font-size:11pt; letter-spacing:5.05pt"> </span><span
            style="font-family:Calibri; font-size:11pt">Boulevard,</span><span
            style="font-family:Calibri; font-size:11pt; letter-spacing:6.05pt"> </span><span
            style="font-family:Calibri; font-size:11pt">141,</span><span
            style="font-family:Calibri; font-size:11pt; letter-spacing:2.3pt"> </span><span
            style="font-family:Calibri; font-size:11pt">Allen,</span><span
            style="font-family:Calibri; font-size:11pt; letter-spacing:3.15pt"> </span><span
            style="font-family:Calibri; font-size:11pt">Texas</span></p>
        <p style="margin-top:14.4pt; margin-left:32.45pt; text-align:justify; line-height:13.4pt">
          <span style="font-family:Calibri; font-size:11pt">Customer</span>
          <span style="font-family:Calibri; font-size:11pt; letter-spacing:5pt"> </span>
          <span style="font-family:Calibri; font-size:11pt">details:</span>
        </p>
        <p style="margin-top:4.55pt; margin-right:133.65pt; margin-left:32.45pt; text-indent:0.35pt; line-height:13.9pt">
          <span style="font-family:Calibri">Rickey Thomas</span>
          <span style="font-family:Calibri; letter-spacing:2.1pt"> </span>
        </p>
        <p style="margin-top:14.4pt; margin-left:32.45pt; text-align:justify; line-height:13.4pt">
          <span style="font-family:Calibri">compton.latoya@yahoo.com </span>
          <span style="font-family:Calibri; letter-spacing:1.3pt"> </span>
        </p>
        <p style="margin-top:14.4pt; margin-left:32.45pt; text-align:justify; line-height:13.4pt">
          <span style="font-family:Calibri; font-size:11pt"> +1 (214) 971-2275</span>
        </p>
      </div>
    </body>
    
    </html>`
    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        "user": "info@shahinahoja.com",
        "pass": "gganlypsemwqhwlh"
      }
    });
    let mailOptions;
    mailOptions = {
      from: 'info@shahinahoja.com',
      to: email,
      subject: 'Forget password verification',
      html: html,
    };
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        callback(error, null)
      } else {
        callback(null, info.response)
      }
    });
  },
}