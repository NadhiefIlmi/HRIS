const xlsx = require("xlsx");
const fs = require("fs");

const workbook = xlsx.readFile("Copy of Data_Base_Karyawan_Upload_System(2) - Copy - Copy.xlsx"); // ganti sesuai nama file
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = xlsx.utils.sheet_to_json(sheet, { defval: "" });

const employees = data.map((row) => ({
    username: row["username_final"],
    nik: row["NIK"],
    employee_name: row["Employee Name"],
    joint_date: formatDate(row["Joint Date"]),
    contract_end_date: formatDate(row["Contract End date"]),
    dob: formatDate(row["Date of Birth"]),
    pob: row["Place of Birth"],
    ktp_number: row["KTP Number"],
    kk_number: row["KK No"],
    npwp_number: row["NPWP Number"],
    gender: row["Gender"]?.toLowerCase(), // optional normalization
    bpjs_kesehatan_no: row["BPJS Kesehatan No"],
    bpjs_clinic: row["BPJS Clinic"],
    bpjs_tk_no: row["BPJS TK No"],
    bpjs_jp_no: row["BPJS JP No"],
    phone_nmb: row["No HP"],
    email: row["Email"],
    ktp_address: row["KTP Address"],
    password: row["Password"],
    educationHistory: [
        {
            last_education: row["Last Education"],
            institution: row["School / University"],
            majority: row["Majority"],
            year_of_graduation: row["Year of Graduation"]
        }
    ],
    trainingHistory: [],
    attendanceRecords: [],
    leaveInfo: [],
    leaveRecords: [],
    salarySlip: ""
}));

function formatDate(excelDate) {
    if (!excelDate) return "";
    if (typeof excelDate === "string") return excelDate.split("T")[0];
    // Handle Excel serial date
    const date = new Date((excelDate - 25569) * 86400 * 1000);
    return date.toISOString().split("T")[0];
}

fs.writeFileSync("karyawan.json", JSON.stringify(employees, null, 2));
console.log("File JSON berhasil dibuat!");
