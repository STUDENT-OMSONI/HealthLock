import React, { useState } from "react";
import axios from "axios";

function FileUpload() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a file first!");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    try {
      setUploading(true);
      setMessage("");
      await axios.post("http://localhost:5000/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMessage("File uploaded successfully!");
    } catch (err) {
      console.error(err);
      setMessage("Upload failed. Try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <input
        type="file"
        onChange={handleFileChange}
        className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4
          file:rounded-full file:border-0 file:text-sm file:font-semibold
          file:bg-red-600 file:text-white hover:file:bg-red-700
          cursor-pointer"
      />
      <button
        onClick={handleUpload}
        disabled={uploading}
        className="bg-gray-900 text-white px-6 py-2.5 rounded-full font-semibold
          hover:bg-black transition-colors disabled:bg-gray-300"
      >
        {uploading ? "Uploading..." : "Upload"}
      </button>
      {message && <p className="text-sm text-gray-600">{message}</p>}
    </div>
  );
}

export default FileUpload;
