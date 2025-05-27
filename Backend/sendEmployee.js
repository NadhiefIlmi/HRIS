const axios = require('axios');
const fs = require('fs');

const filePath = './karyawan.json'; // Path ke file JSON hasil konversi

async function registerEmployees() {
  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    const employees = JSON.parse(data);

    const response = await axios.post('http://localhost:5000/api/employee/batch-register', employees, {
      headers: { 'Content-Type': 'application/json' },
    });

    console.log('✅ Respon dari server:', response.data);
  } catch (error) {
    console.error('❌ Gagal mengirim data:', error.response?.data || error.message);
  }
}

registerEmployees();
