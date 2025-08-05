import React from "react";
import styled from "styled-components";

const OverlayContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
`;

const Modal = styled.div`
  background-color: white;
  padding: 2.5rem;
  border-radius: 8px;
  max-width: 600px;
  width: 90%;
  box-shadow: 0 5px 15px rgba(0,0,0,0.3);
  position: relative;

  h3 {
    margin-top: 0;
    color: #003087;
  }

  p, li {
    font-size: 1rem;
    line-height: 1.6;
    color: #4c6272;
  }
`;

const ModalCloseButton = styled.button`
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  background: #e9ecef;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  &:hover { background-color: #dee2e6; }
`;

const RagDataUploadModal = ({ onClose, onUpload }) => {
  const [files, setFiles] = React.useState([]);
  const [isDragging, setIsDragging] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);
  const [status, setStatus] = React.useState("idle");
  const [errorMessage, setErrorMessage] = React.useState("");
  const fileInputRef = React.useRef();

  const MAX_FILE_SIZE_MB = 1000;
  const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
  const MAX_FILES = 5;

  const validateFiles = (newFiles) => {
    let validFiles = [...files];
    for (let f of newFiles) {
      if (f.size > MAX_FILE_SIZE_BYTES) {
        setErrorMessage(`"${f.name}" exceeds 1GB limit.`);
        continue;
      }
      if (validFiles.length >= MAX_FILES) {
        setErrorMessage(`You can only upload up to ${MAX_FILES} files.`);
        break;
      }
      validFiles.push(f);
    }
    setFiles(validFiles);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    validateFiles(droppedFiles);
    e.dataTransfer.clearData();
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    validateFiles(selectedFiles);
    e.target.value = "";
  };

  const handleUploadClick = async () => {
    try {
      const result = await onUpload(files);
      if (result?.data) {
        setStatus("success");
      } else {
        setErrorMessage("Unexpected error while adding data to RAG");
        setStatus("error");
      }
    } catch (err) {
      setErrorMessage("Something went wrong. Please try again.");
      setStatus("error");
    }
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  return (
    <OverlayContainer onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <ModalCloseButton onClick={onClose}>×</ModalCloseButton>

        {status === "idle" && (
          <>
            <h3>📚 Add Data to RAG</h3>
            <p style={{ marginBottom: "1rem", color: "#4c6272" }}>
              Upload up to {MAX_FILES} files (TXT, PDF — Max 1GB each)
            </p>

            {errorMessage && (
              <p style={{ color: "#e53935", fontWeight: "bold", marginBottom: "1rem" }}>
                {errorMessage}
              </p>
            )}

            <div
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              style={{
                border: `2px dashed ${
                  isDragging ? "#005eb8" : isHovered ? "#005eb8" : "#BCC8D8"
                }`,
                borderRadius: "12px",
                padding: "2rem",
                textAlign: "center",
                cursor: "pointer",
                backgroundColor: isDragging
                  ? "#eaf1f8"
                  : isHovered
                  ? "#f1f5f9"
                  : "#f9fafb",
                boxShadow: isHovered
                  ? "0 0 8px rgba(0,94,184,0.3)"
                  : "none",
                transition:
                  "background-color 0.2s, border-color 0.2s, box-shadow 0.2s",
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.pdf"
                multiple
                style={{ display: "none" }}
                onChange={handleFileChange}
              />

              {files.length > 0 ? (
                <ul style={{ listStyle: "none", padding: 0 }}>
                  {files.map((f, i) => (
                    <li key={i} style={{ marginBottom: "0.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span>{f.name}</span>
                      <button
                        type="button"
                        onClick={() => removeFile(i)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#e53935",
                          cursor: "pointer",
                          fontWeight: "bold"
                        }}
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <>
                  <p style={{ fontSize: "2rem", margin: 0 }}>📎</p>
                  <p style={{ color: "#5f6368", margin: "0.5rem 0" }}>
                    Click or drag & drop files here
                  </p>
                  <small style={{ color: "#888" }}>
                    Supported: TXT, PDF — Max 1GB each
                  </small>
                </>
              )}
            </div>

            <div
              style={{
                marginTop: "1.5rem",
                display: "flex",
                gap: "0.5rem",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={onClose}
                style={{
                  padding: "0.5rem 1.25rem",
                  border: "1px solid #ccc",
                  backgroundColor: "#fff",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                disabled={files.length === 0}
                onClick={handleUploadClick}
                style={{
                  padding: "0.5rem 1.25rem",
                  border: "none",
                  backgroundColor: files.length > 0 ? "#005eb8" : "#BCC8D8",
                  color: "#fff",
                  borderRadius: "8px",
                  cursor: files.length > 0 ? "pointer" : "not-allowed",
                  fontWeight: "bold",
                }}
              >
                Submit
              </button>
            </div>
          </>
        )}

        {status === "success" && (
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <h3>Upload Successful</h3>
            <p>Your documents were successfully added to the RAG knowledge base.</p>
            <button
              onClick={onClose}
              style={{
                marginTop: "1.5rem",
                padding: "0.5rem 1.25rem",
                backgroundColor: "#005eb8",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Close
            </button>
          </div>
        )}

        {status === "error" && (
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <h3>Upload Failed</h3>
            <p style={{ color: "#e53935", fontWeight: "bold" }}>
              {errorMessage}
            </p>
            <button
              onClick={() => setStatus("idle")}
              style={{
                marginTop: "1.5rem",
                padding: "0.5rem 1.25rem",
                backgroundColor: "#005eb8",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Try Again
            </button>
          </div>
        )}
      </Modal>
    </OverlayContainer>
  );
};

export default RagDataUploadModal;
