import { Resend } from 'resend';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config({ path: '../../.env' });

async function testServices() {
  console.log("Testing Third-Party Services");
  
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { data, error } = await resend.emails.send({
      from: 'Acme <onboarding@resend.dev>',
      to: ['delivered@resend.dev'],
      subject: 'Hello World',
      html: '<strong>it works!</strong>'
    });
    
    if (error) {
      console.error("Resend Failed:", error);
    } else {
      console.log("Resend Success:", data);
    }
  } catch (err) {
    console.error("Resend Error:", err);
  }

  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });

    const res = await cloudinary.api.ping();
    console.log("Cloudinary Success:", res);
  } catch (err) {
    console.error("Cloudinary Error:", err);
  }
}

testServices();
