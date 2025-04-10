import React from "react";

const UploadedFiles = ({ uploadedFiles }: { uploadedFiles: File[] }) => (
  <div style={{ marginBottom: "20px" }}>
    <h3>Uploaded Files:</h3>
    <ul>
      {uploadedFiles.map((file, index) => (
        <li key={index}>
          Ref:{index + 1} - {file.name}
        </li>
      ))}
    </ul>
  </div>
);

export default UploadedFiles;
