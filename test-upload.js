import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

async function testUpload() {
  try {
    const token = process.argv[2];
    const workspaceId = process.argv[3];
    
    if (!token || !workspaceId) {
      console.log('Usage: node test-upload.js <token> <workspaceId>');
      return;
    }

    const form = new FormData();
    form.append('image', fs.createReadStream('c:/Development/symbio/test-upload.png'));

    const response = await axios.post(`http://localhost:4000/upload/image?workspaceId=${workspaceId}`, form, {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log('Upload successful:', response.data);
  } catch (error) {
    console.error('Upload failed:', error.response?.data || error.message);
  }
}

testUpload();
