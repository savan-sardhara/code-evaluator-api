import { useState } from 'react';
import axios from 'axios';
import './ScreenshotUpload.css';

const ScreenshotUpload = ({ enrollmentNumber }) => {
  const [screenshots, setScreenshots] = useState({});
  const [uploading, setUploading] = useState({});
  const [uploadedFiles, setUploadedFiles] = useState({});

  const operations = [
    { key: 'insert', label: 'INSERT/CREATE', description: 'Screenshot of creating a new record' },
    { key: 'readAll', label: 'READ ALL', description: 'Screenshot of fetching all records' },
    { key: 'readById', label: 'READ BY ID', description: 'Screenshot of fetching a single record by ID' },
    { key: 'update', label: 'UPDATE', description: 'Screenshot of updating an existing record' },
    { key: 'delete', label: 'DELETE', description: 'Screenshot of deleting a record' }
  ];

  const handleFileSelect = async (operation, file) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size should be less than 5MB');
      return;
    }

    // Set the file and immediately start upload
    setScreenshots(prev => ({
      ...prev,
      [operation]: file
    }));

    // Automatically upload the file
    await uploadScreenshot(operation, file);
  };

  const uploadScreenshot = async (operation, file = null) => {
    const uploadFile = file || screenshots[operation];
    if (!uploadFile) return;

    setUploading(prev => ({ ...prev, [operation]: true }));

    const formData = new FormData();
    formData.append('screenshot', uploadFile);

    try {
      const response = await axios.post(
        `http://localhost:3000/api/screenshots/upload/${enrollmentNumber}/${operation}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.success) {
        setUploadedFiles(prev => ({
          ...prev,
          [operation]: response.data.data.file
        }));
        // Clear the selected file after successful upload
        setScreenshots(prev => ({
          ...prev,
          [operation]: null
        }));
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload screenshot. Please try again.');
    } finally {
      setUploading(prev => ({ ...prev, [operation]: false }));
    }
  };

  return (
    <div className="screenshot-upload-container">
      <h3>📸 Upload Postman Screenshots</h3>
      <p>Select screenshots of your CRUD operations testing in Postman (uploads automatically):</p>
      
      <div className="operations-grid">
        {operations.map(({ key, label, description }) => (
          <div key={key} className="operation-card">
            <div className="operation-header">
              <h4>{label}</h4>
              <p>{description}</p>
            </div>
            
            <div className="upload-section">
              {uploadedFiles[key] ? (
                <div className="uploaded-indicator">
                  ✅ Uploaded: {uploadedFiles[key].filename}
                  <small>({new Date(uploadedFiles[key].uploadedAt).toLocaleString()})</small>
                </div>
              ) : (
                <>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileSelect(key, e.target.files[0])}
                    className="file-input"
                    id={`${key}-file`}
                    disabled={uploading[key]}
                  />
                  <label 
                    htmlFor={`${key}-file`} 
                    className={`file-label ${uploading[key] ? 'uploading' : ''}`}
                  >
                    {uploading[key] 
                      ? '📤 Uploading...' 
                      : screenshots[key] 
                        ? `📁 ${screenshots[key].name}` 
                        : '📎 Choose Screenshot'
                    }
                  </label>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScreenshotUpload;