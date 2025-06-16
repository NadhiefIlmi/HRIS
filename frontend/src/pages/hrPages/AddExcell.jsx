import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  UploadCloud,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronRight,
  Users,
  Plus,
  FileText,
  DownloadCloud,
} from "lucide-react";
import API from "../../api/api";

function AddExcel() {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState({
    success: null,
    message: "",
  });
  const [fileName, setFileName] = useState("");

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const allowedExtensions = [".xlsx", ".xls"];
      const fileExtension = selectedFile.name
        .substring(selectedFile.name.lastIndexOf("."))
        .toLowerCase();

      if (allowedExtensions.includes(fileExtension)) {
        setFile(selectedFile);
        setFileName(selectedFile.name);
        setUploadStatus({ success: null, message: "" });
      } else {
        setUploadStatus({
          success: false,
          message: "Invalid file type. Only Excel files (.xlsx, .xls) are allowed.",
        });
        setFile(null);
        setFileName("");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setUploadStatus({
        success: false,
        message: "Please select a file first.",
      });
      return;
    }

    setIsUploading(true);
    setUploadStatus({ success: null, message: "" });

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("file", file);

      const response = await API.post(
        "/api/hr/upload-employee-excel",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setUploadStatus({
        success: true,
        message: `Successfully uploaded ${response.data.count} employees!`,
      });
      setFile(null);
      setFileName("");
    } catch (error) {
      console.error("Upload error:", error);
      setUploadStatus({
        success: false,
        message:
          error.response?.data?.message ||
          "Failed to upload file. Please check the format and try again.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen from-slate-50 via-blue-50/30 to-indigo-50/40">
      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-[#662b1f]/5 to-orange-200/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-200/10 to-purple-200/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
       

        {/* Main Card */}
        <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/50 overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/3 rounded-full translate-y-24 -translate-x-24"></div>

          <div className="relative">
            <div className="flex items-center mb-6">
              <div className="w-2 h-8 bg-gradient-to-b from-[#662b1f] to-orange-500 rounded-full mr-4"></div>
              <h2 className="text-3xl font-bold text-gray-900">
                Bulk Employee Registration
              </h2>
              <Users className="ml-4 text-[#662b1f]" size={28} />
            </div>

            <p className="text-gray-600 mb-8 max-w-2xl">
              Upload an Excel file to register multiple employees at once. Ensure
              the file follows the required format with all necessary columns.
            </p>

            {/* Upload Section */}
            <div className="bg-gray-50/60 rounded-xl p-6 mb-8 border border-gray-200/50">
              <div className="flex flex-col items-center justify-center py-8 px-4 border-2 border-dashed border-gray-300 rounded-lg bg-white/50">
                <UploadCloud className="text-[#662b1f] mb-4" size={48} />
                <p className="text-lg font-medium text-gray-700 mb-2">
                  {fileName || "Select Excel file to upload"}
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  {fileName
                    ? "Ready to upload"
                    : "Only .xlsx or .xls files are accepted"}
                </p>

                <label className="cursor-pointer">
                  <span className="px-6 py-3 bg-gradient-to-r from-[#662b1f] to-[#8b3a1f] text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200 inline-flex items-center">
                    <UploadCloud className="mr-2" size={18} />
                    {fileName ? "Change File" : "Browse Files"}
                    <input
                      type="file"
                      className="hidden"
                      accept=".xlsx,.xls"
                      onChange={handleFileChange}
                    />
                  </span>
                </label>

                {fileName && (
                  <button
                    onClick={() => {
                      setFile(null);
                      setFileName("");
                    }}
                    className="mt-3 text-sm text-red-500 hover:text-red-700 flex items-center"
                  >
                    <XCircle className="mr-1" size={16} />
                    Remove file
                  </button>
                )}
              </div>

              {/* Status Message */}
              {uploadStatus.message && (
                <div
                  className={`mt-4 p-4 rounded-lg flex items-start ${
                    uploadStatus.success
                      ? "bg-green-50 text-green-800"
                      : "bg-red-50 text-red-800"
                  }`}
                >
                  {uploadStatus.success ? (
                    <CheckCircle className="mr-3 flex-shrink-0" size={20} />
                  ) : (
                    <AlertCircle className="mr-3 flex-shrink-0" size={20} />
                  )}
                  <p className="text-sm">{uploadStatus.message}</p>
                </div>
              )}

              {/* File Requirements */}
              <div className="mt-6">
                <h4 className="font-semibold text-gray-700 mb-3 flex items-center">
                  <FileText className="mr-2 text-[#662b1f]" size={18} />
                  File Requirements
                </h4>
                <ul className="text-sm text-gray-600 space-y-2 pl-2">
                  <li className="flex items-start">
                    <span className="text-[#662b1f] mr-2">•</span>
                    File must be in Excel format (.xlsx or .xls)
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#662b1f] mr-2">•</span>
                    Must include all required columns in the correct order
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#662b1f] mr-2">•</span>
                    First row should contain column headers
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#662b1f] mr-2">•</span>
                    Maximum file size: 5MB
                  </li>
                </ul>

                <div className="mt-4">
                  <a
                    href="/templates/employee-upload-template.xlsx"
                    download
                    className="inline-flex items-center text-sm text-[#662b1f] hover:text-[#8b3a1f] font-medium"
                  >
                    <DownloadCloud className="mr-2" size={16} />
                    Download template file  (Masih Belum Bisa)
                  </a>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4">
             
              <button
                onClick={handleSubmit}
                disabled={!file || isUploading}
                className={`px-6 py-3 rounded-lg font-medium shadow-md transition-all duration-200 flex items-center ${
                  !file || isUploading
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-[#662b1f] to-[#8b3a1f] text-white hover:shadow-lg"
                }`}
              >
                {isUploading ? (
                  "Uploading..."
                ) : (
                  <>
                    <Plus className="mr-2" size={18} />
                    Upload Employees
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/40 shadow-lg">
            <div className="flex items-center justify-center mb-4">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gradient-to-r from-[#662b1f] to-orange-500 rounded-full"></div>
                <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
                <div className="w-2 h-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"></div>
              </div>
            </div>
            <p className="text-sm text-gray-600 font-medium">
              &copy; 2024 HR Management System
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddExcel;