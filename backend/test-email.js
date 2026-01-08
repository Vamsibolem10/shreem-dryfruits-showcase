const { Resend } = require('resend');

// Test Resend email functionality
const testEmail = async () => {
  const resend = new Resend('re_XHQrodzY_ErLFfoU1FxuVY97jf9EmqRjY');

  try {
    console.log('Testing Resend email functionality...');

    const emailResult = await resend.emails.send({
      from: 'Shreem Nuts N Fruits <noreply@shreem.com>',
      to: 'test@example.com', // Replace with your email for testing
      subject: 'Test Email from Shreem Backend',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #8B4513; text-align: center;">Shreem Nuts N Fruits</h1>
          <h2 style="color: #D2691E; text-align: center;">Email Test Successful!</h2>
          <div style="background: #F5F5DC; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p>This is a test email to verify that the Resend API integration is working correctly.</p>
            <p><strong>API Key:</strong> Configured ✅</p>
            <p><strong>Email Service:</strong> Ready ✅</p>
            <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
          </div>
          <p style="text-align: center; color: #666;">This email was sent using Resend API.</p>
        </div>
      `
    });

    console.log('✅ Test email sent successfully!');
    console.log('Email ID:', emailResult.data?.id);
    console.log('To:', emailResult.data?.to);
    console.log('Status:', emailResult.data?.status);

  } catch (error) {
    console.error('❌ Email test failed:');
    console.error('Error:', error.message);
    console.error('Code:', error.code);
    console.error('Status Code:', error.statusCode);

    if (error.message.includes('API key')) {
      console.log('\n🔧 Check your Resend API key configuration');
    } else if (error.message.includes('domain')) {
      console.log('\n🔧 Verify your domain configuration in Resend dashboard');
    }
  }
};

testEmail();