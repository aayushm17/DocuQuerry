import React, { useState } from "react";
import axios from "axios";
import './App.css';

function App() {
  const [files, setFiles] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files)); // Convert FileList to array
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      alert("Please select at least one file before uploading.");
      return;
    }

    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    try {
      console.log("Uploading files:", files.map(f => f.name));

      const res = await axios.post("http://localhost:5000/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("📩 Server response:", res);

      if (res.status === 200 && res.data.uploadedFiles.length > 0) {
        console.log("✅ Upload successful:", res.data);
        setUploadedFiles(res.data.uploadedFiles);
        setQuery("");
        setResponse("");
      } else {
        console.error("Unexpected API response:", res.data);
        alert("Files uploaded, but unexpected response received.");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Error uploading files.");
    }
  };

  const handleQuery = async () => {
    console.log("Querying with:", { query, uploadedFiles });
    if (!query || uploadedFiles.length === 0) {
      alert("Please enter a question and ensure at least one file is uploaded.");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/chat", { query, fileNames: uploadedFiles });

      console.log("📩 Response from server:", res.data);
      if (res.data.response) {
        setResponse(res.data.response);
      } else {
        alert("No valid response received.");
      }
    } catch (error) {
      console.error("Error fetching response:", error);
      alert("Error fetching response from the server.");
    }
  };

  return (
    <div className="app-container">
      <h2>Upload Documents</h2>
      <input type="file" multiple onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>

      {uploadedFiles.length > 0 && (
        <div className="query-section">
          <h3>Ask a Question</h3>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type your question here..."
          />
          <button onClick={handleQuery}>Ask</button>
          <p className="response"><strong>Response:</strong> {response}</p>
        </div>
      )}
    </div>
  );
}

export default App;
