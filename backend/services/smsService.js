// Real SMS Gateway Service (Fast2SMS, 2Factor.in, Twilio, Msg91)

/**
 * Send real SMS with OTP to an actual mobile phone number
 * @param {string} phone - Mobile number (e.g. 9876543210 or +919876543210)
 * @param {string} otp - 6-digit OTP code
 * @param {object} customKeys - Optional dynamic API keys passed from frontend config
 */
export const sendRealSMS = async (phone, otp, customKeys = {}) => {
  const cleanPhone = phone.replace(/[^0-9]/g, '').slice(-10); // 10-digit Indian number
  const fullPhone = phone.startsWith('+') ? phone : `+91${cleanPhone}`;

  const fast2smsKey = customKeys.fast2smsKey || process.env.FAST2SMS_API_KEY;
  const twoFactorKey = customKeys.twoFactorKey || process.env.TWOFACTOR_API_KEY;
  const twilioSid = customKeys.twilioSid || process.env.TWILIO_ACCOUNT_SID;
  const twilioToken = customKeys.twilioToken || process.env.TWILIO_AUTH_TOKEN;
  const twilioFrom = customKeys.twilioFrom || process.env.TWILIO_PHONE_NUMBER;
  const msg91Key = customKeys.msg91Key || process.env.MSG91_AUTH_KEY;

  console.log(`\n======================================================`);
  console.log(`  🚀 INITIATING REAL SMS DISPATCH`);
  console.log(`  📱 TARGET PHONE: ${fullPhone} (10-digit: ${cleanPhone})`);
  console.log(`  🔑 OTP CODE: [ ${otp} ]`);
  console.log(`  ⏱️  VALIDITY: 5 MINUTES`);

  // 1. Try 2Factor.in (India dedicated OTP SMS Gateway - https://2factor.in)
  if (twoFactorKey && twoFactorKey.trim()) {
    try {
      console.log(`  📡 Connecting to 2Factor.in Gateway...`);
      const url = `https://2factor.in/API/V1/${twoFactorKey.trim()}/SMS/${cleanPhone}/${otp}/OTP1`;
      const response = await fetch(url, { method: 'GET' });
      const data = await response.json();
      console.log(`  📬 2Factor.in Gateway Response:`, data);

      if (data.Status === 'Success') {
        console.log(`  ✅ REAL SMS DELIVERED via 2Factor.in to ${cleanPhone}!`);
        console.log(`======================================================\n`);
        return { 
          success: true, 
          provider: '2factor', 
          deliveredRealSMS: true, 
          message: `Real SMS sent to ${cleanPhone} via 2Factor.in`,
          sessionId: data.Details 
        };
      } else {
        console.warn(`  ⚠️ 2Factor Notice:`, data.Details);
      }
    } catch (err) {
      console.error(`  ❌ 2Factor.in Error:`, err.message);
    }
  }

  // 2. Try Fast2SMS (India standard - https://fast2sms.com)
  if (fast2smsKey && fast2smsKey.trim()) {
    try {
      console.log(`  📡 Connecting to Fast2SMS Gateway (OTP Route)...`);
      const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          'authorization': fast2smsKey.trim(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          route: 'otp',
          variables_values: otp,
          numbers: cleanPhone
        })
      });

      const data = await response.json();
      console.log(`  📬 Fast2SMS Gateway Response:`, data);

      if (data.return) {
        console.log(`  ✅ REAL SMS DELIVERED via Fast2SMS to ${cleanPhone}!`);
        console.log(`======================================================\n`);
        return { 
          success: true, 
          provider: 'fast2sms', 
          deliveredRealSMS: true, 
          message: `Real SMS sent to ${cleanPhone} via Fast2SMS`,
          requestId: data.request_id 
        };
      } else {
        console.warn(`  ⚠️ Fast2SMS Notice:`, data.message);
        
        // Fallback: Try Quick SMS route if OTP route template has issues
        try {
          console.log(`  📡 Retrying Fast2SMS with Quick SMS route (q)...`);
          const qRes = await fetch('https://www.fast2sms.com/dev/bulkV2', {
            method: 'POST',
            headers: {
              'authorization': fast2smsKey.trim(),
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              route: 'q',
              message: `Your CraveCourier verification code is ${otp}. Valid for 5 minutes. Do not share.`,
              language: 'english',
              numbers: cleanPhone
            })
          });
          const qData = await qRes.json();
          console.log(`  📬 Fast2SMS Quick Route Response:`, qData);
          if (qData.return) {
            console.log(`  ✅ REAL SMS DELIVERED via Fast2SMS Quick Route to ${cleanPhone}!`);
            console.log(`======================================================\n`);
            return { 
              success: true, 
              provider: 'fast2sms-quick', 
              deliveredRealSMS: true, 
              message: `Real SMS sent to ${cleanPhone} via Fast2SMS` 
            };
          }
        } catch (qErr) {
          console.error(`  ❌ Fast2SMS Quick Route Error:`, qErr.message);
        }
      }
    } catch (err) {
      console.error(`  ❌ Fast2SMS Dispatch Error:`, err.message);
    }
  }

  // 3. Try Twilio SMS
  if (twilioSid && twilioToken && twilioFrom) {
    try {
      console.log(`  📡 Connecting to Twilio SMS Gateway...`);
      const auth = Buffer.from(`${twilioSid.trim()}:${twilioToken.trim()}`).toString('base64');
      const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid.trim()}/Messages.json`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          To: fullPhone,
          From: twilioFrom.trim(),
          Body: `Your CraveCourier food delivery verification code is: ${otp}. Valid for 5 minutes.`
        })
      });

      const data = await response.json();
      console.log(`  📬 Twilio Response:`, data.status || data.message);
      if (response.ok) {
        console.log(`  ✅ REAL SMS DELIVERED via Twilio to ${fullPhone}!`);
        console.log(`======================================================\n`);
        return { 
          success: true, 
          provider: 'twilio', 
          deliveredRealSMS: true, 
          message: `Real SMS sent to ${fullPhone} via Twilio` 
        };
      }
    } catch (err) {
      console.error(`  ❌ Twilio Dispatch Error:`, err.message);
    }
  }

  // 4. Try MSG91
  if (msg91Key && process.env.MSG91_TEMPLATE_ID) {
    try {
      console.log(`  📡 Connecting to MSG91 Gateway...`);
      const response = await fetch(
        `https://control.msg91.com/api/v5/otp?template_id=${process.env.MSG91_TEMPLATE_ID}&mobile=91${cleanPhone}&authkey=${msg91Key.trim()}&otp=${otp}`,
        { method: 'POST' }
      );
      const data = await response.json();
      console.log(`  📬 MSG91 Response:`, data);
      if (data.type === 'success') {
        console.log(`  ✅ REAL SMS DELIVERED via MSG91 to ${cleanPhone}!`);
        console.log(`======================================================\n`);
        return { 
          success: true, 
          provider: 'msg91', 
          deliveredRealSMS: true, 
          message: `Real SMS sent to ${cleanPhone} via MSG91` 
        };
      }
    } catch (err) {
      console.error(`  ❌ MSG91 Dispatch Error:`, err.message);
    }
  }

  console.log(`  ℹ️  No live carrier SMS API key provided in backend/.env`);
  console.log(`  💡 Real OTP generated & logged above: [ ${otp} ]`);
  console.log(`  💡 Set FAST2SMS_API_KEY or TWOFACTOR_API_KEY in backend/.env for real SMS carrier dispatch.`);
  console.log(`======================================================\n`);

  return {
    success: true,
    provider: 'local-dev-logger',
    deliveredRealSMS: false,
    message: 'OTP generated. Add FAST2SMS_API_KEY in backend/.env for real carrier SMS delivery.'
  };
};

