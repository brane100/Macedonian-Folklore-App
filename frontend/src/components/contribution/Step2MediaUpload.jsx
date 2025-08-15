import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './Step2MediaUpload.css';

export default function Step2MediaUpload({ formData, setFormData, nextStep, prevStep }) {
  const {t} = useTranslation();
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaUrlType, setMediaUrlType] = useState('image');
  const [mediaType, setMediaType] = useState('image');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadMethod, setUploadMethod] = useState('file'); // 'file' or 'url'
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const mediaTypes = [
  { value: 'image', label: t('media.image'), accept: 'image/*' },
  { value: 'video', label: t('media.video'), accept: 'video/*' },
  { value: 'audio', label: t('media.audio'), accept: 'audio/*' }
  ];

  const handleFileSelect = (event) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setSelectedFiles(Array.from(files));
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setSelectedFiles(Array.from(e.dataTransfer.files));
      // Optionally auto-detect media type from first file
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) setMediaType('image');
      else if (file.type.startsWith('video/')) setMediaType('video');
      else setMediaType('audio');
    }
  };

  // const uploadFiles = async () => {
  //   if (!selectedFiles.length) return [];
  //   setUploading(true);
  //   try {
  //     const formData = new FormData();
  //     selectedFiles.forEach((file, i) => {
  //       formData.append(`media-${i}`, file, file.name);
  //     });
  //     formData.append('type', mediaType);
  //     const response = await fetch('/upload-media', {
  //       method: 'POST',
  //       body: formData,
  //       credentials: 'include'
  //     });
  //     if (!response.ok) {
  //       throw new Error('Грешка при прикачување на фајлот');
  //     }
  //     const result = await response.json();
  //     // Expecting result.filePaths: array of file paths
  //     return result.filePaths || [];
  //   } catch (error) {
  //     console.error('Upload error:', error);
  //     alert('Грешка при прикачување на фајлот: ' + error.message);
  //     return [];
  //   } finally {
  //     setUploading(false);
  //   }
  // };

  const addMediaFromFile = () => {
    if (!selectedFiles.length) {
      alert(t('step2.selectFilePrompt'));
      return;
    }
    setFormData({
      ...formData,
      mediaRaw: [...(formData.mediaRaw || []), ...selectedFiles]
    });
    setSelectedFiles([]);
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = '';
  };

  const addMediaFromUrl = () => {
    if (mediaUrl.trim()) {
      setFormData({
        ...formData,
        mediaUrl: [...(formData.mediaUrl || []), { url: mediaUrl, type: mediaUrlType }]
      });
      setMediaUrl('');
      setMediaUrlType('image');
    }
  };

  const removeMediaRaw = (index) => {
    const newMediaRaw = (formData.mediaRaw || []).filter((_, i) => i !== index);
    setFormData({
      ...formData,
      mediaRaw: newMediaRaw
    });
  };

  const removeMediaUrl = (index) => {
    const newMediaUrl = (formData.mediaUrl || []).filter((_, i) => i !== index);
    setFormData({
      ...formData,
      mediaUrl: newMediaUrl
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getMediaTypeIcon = (type) => {
    switch(type) {
      case 'image': return '🖼️';
      case 'video': return '🎥';
      case 'audio': return '🎵';
      case 'document': return '📄';
      default: return '📎';
    }
  };

  return (
    <div className="step2-container">
      <div className="step2-header">
  <h2>📎 {t('step2.title')}</h2>
  <p>{t('step2.subtitle')}</p>
      </div>

      {/* Upload Method Selection */}
      <div className="upload-method-selector">
        <label className="method-option">
          <input
            type="radio"
            value="file"
            checked={uploadMethod === 'file'}
            onChange={(e) => setUploadMethod(e.target.value)}
          />
          📁 {t('step2.uploadFile')}
        </label>
        <label className="method-option">
          <input
            type="radio"
            value="url"
            checked={uploadMethod === 'url'}
            onChange={(e) => setUploadMethod(e.target.value)}
          />
          🔗 {t('step2.addUrl')}
        </label>
      </div>

      {/* Media Type Selection */}
      <div className="form-group">
  <label>🎭 {t('step2.mediaType')}</label>
        <select 
          value={mediaType} 
          onChange={(e) => setMediaType(e.target.value)}
          className="media-type-select"
        >
          {mediaTypes.map(type => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      {/* File Upload Section */}
      {uploadMethod === 'file' && (
        <div className="file-upload-section">
          {/* Drag and Drop Area */}
          <div 
            className={`drag-drop-area ${dragActive ? 'drag-active' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="drag-drop-content">
              <div className="upload-icon">📁</div>
              <p>{t('step2.dragDrop')}</p>
              <label className="file-input-label">
                <input
                  type="file"
                  onChange={handleFileSelect}
                  accept={mediaTypes.find(t => t.value === mediaType)?.accept}
                  className="file-input-hidden"
                  multiple
                  required
                />
                <span className="file-input-button">{t('step2.chooseFiles')}</span>
              </label>
            </div>
          </div>

          {/* Selected Files Preview */}
          {selectedFiles.length > 0 && (
            <div className="selected-file-preview">
              {selectedFiles.map((file, idx) => (
                <div className="file-info" key={idx}>
                  <div className="file-icon">{getMediaTypeIcon(mediaType)}</div>
                  <div className="file-details">
                    <div className="file-name">{file.name}</div>
                    <div className="file-size">{formatFileSize(file.size)}</div>
                  </div>
                  <button 
                    onClick={() => setSelectedFiles(selectedFiles.filter((_, i) => i !== idx))}
                    className="remove-file-btn"
                  >
                    ❌
                  </button>
                </div>
              ))}
            </div>
          )}

          <button 
            onClick={addMediaFromFile}
            disabled={!selectedFiles.length || uploading}
            className="add-media-btn"
          >
            {uploading ? (
              <>
                <span className="loading-spinner"></span>
                {t('step2.uploading')}
              </>
            ) : (
              <>
                📤 {t('step2.uploadFiles')}
              </>
            )}
          </button>
        </div>
      )}

      {/* URL Upload Section */}
      {uploadMethod === 'url' && (
        <div className="url-upload-section">
          <div className="form-group">
            <label>🔗 {t('step2.urlLabel')}</label>
            <input
              type="url"
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              placeholder="https://example.com/media.jpg"
              className="url-input"
            />
          </div>
          <div className="form-group">
            <label>🎭 {t('step2.mediaType')}</label>
            <select 
              value={mediaUrlType} 
              onChange={(e) => setMediaUrlType(e.target.value)}
              className="media-type-select"
            >
              {mediaTypes.filter(type => type.value !== 'other' && type.value !== 'document').map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          <button 
            onClick={addMediaFromUrl}
            disabled={!mediaUrl.trim()}
            className="add-media-btn"
          >
            ➕ {t('step2.addUrlBtn')}
          </button>
        </div>
      )}

      {/* Media List */}
      {(formData.mediaRaw?.length > 0 || formData.mediaUrl?.length > 0) && (
        <div className="media-list">
          <h3>📋 {t('step2.addedMedia')}</h3>
          <div className="media-items">
            {/* Show raw files */}
            {formData.mediaRaw?.map((file, index) => (
              <div key={index} className="media-item">
                <div className="media-info">
                  <span className="media-icon">{getMediaTypeIcon(file.type)}</span>
                  <div className="media-details">
                    <div className="media-type">{file.type?.toUpperCase()}</div>
                    <div className="media-name">{file.name}</div>
                    <div className="media-size">{formatFileSize(file.size)}</div>
                    <div className="media-source">📁 {t('step2.uploadedFile')}</div>
                  </div>
                </div>
                <button 
                  onClick={() => removeMediaRaw(index)}
                  className="remove-media-btn"
                >
                  🗑️
                </button>
              </div>
            ))}
            {/* Show URLs */}
            {formData.mediaUrl?.map((item, index) => (
              <div key={index} className="media-item">
                <div className="media-info">
                  <span className="media-icon">{getMediaTypeIcon(item.type)}</span>
                  <div className="media-details">
                    <div className="media-type">{item.type?.toUpperCase()}</div>
                    <div className="media-name">{item.url}</div>
                    <div className="media-source">🔗 {t('step2.urlLink')}</div>
                  </div>
                </div>
                <button 
                  onClick={() => removeMediaUrl(index)}
                  className="remove-media-btn"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="step-navigation">
        <button onClick={prevStep} className="nav-btn prev-btn">
          ⬅️ {t('step2.back')}
        </button>
        <button 
          onClick={nextStep} 
          className="nav-btn next-btn"
          disabled={uploading}
        >
          {t('step2.next')} ➡️
        </button>
      </div>
    </div>
  );
}
