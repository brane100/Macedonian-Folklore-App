import React, { useState } from 'react';
import './Step2MediaUpload.css';

export default function Step2MediaUpload({ formData, setFormData, nextStep, prevStep }) {
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState('image');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadMethod, setUploadMethod] = useState('file'); // 'file' or 'url'
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const mediaTypes = [
    { value: 'image', label: '🖼️ Слика', accept: 'image/*' },
    { value: 'video', label: '🎥 Видео', accept: 'video/*' },
    { value: 'audio', label: '🎵 Аудио', accept: 'audio/*' },
    { value: 'document', label: '📄 Документ', accept: '.pdf,.doc,.docx,.txt' },
    { value: 'other', label: '📎 Друго', accept: '*/*' }
  ];

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Auto-detect media type based on file
      if (file.type.startsWith('image/')) setMediaType('image');
      else if (file.type.startsWith('video/')) setMediaType('video');
      else if (file.type.startsWith('audio/')) setMediaType('audio');
      else if (file.type === 'application/pdf' || file.name.endsWith('.doc') || file.name.endsWith('.docx')) {
        setMediaType('document');
      } else setMediaType('other');
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
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      // Auto-detect media type
      if (file.type.startsWith('image/')) setMediaType('image');
      else if (file.type.startsWith('video/')) setMediaType('video');
      else if (file.type.startsWith('audio/')) setMediaType('audio');
      else if (file.type === 'application/pdf' || file.name.endsWith('.doc') || file.name.endsWith('.docx')) {
        setMediaType('document');
      } else setMediaType('other');
    }
  };

  const uploadFile = async () => {
    if (!selectedFile) return null;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('media', selectedFile);
      formData.append('type', mediaType);

      const response = await fetch('/api/upload-media', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Грешка при прикачување на фајлот');
      }

      const result = await response.json();
      return result.filePath; // Server should return the file path
    } catch (error) {
      console.error('Upload error:', error);
      alert('Грешка при прикачување на фајлот: ' + error.message);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const addMediaFromFile = async () => {
    if (!selectedFile) {
      alert('Ве молиме изберете фајл');
      return;
    }

    const filePath = await uploadFile();
    if (filePath) {
      setFormData({
        ...formData,
        media: [...formData.media, { 
          url: filePath, 
          type: mediaType, 
          fileName: selectedFile.name,
          fileSize: selectedFile.size,
          source: 'upload'
        }]
      });
      setSelectedFile(null);
      // Reset file input
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = '';
    }
  };

  const addMediaFromUrl = () => {
    if (mediaUrl.trim()) {
      setFormData({
        ...formData,
        media: [...formData.media, { 
          url: mediaUrl, 
          type: mediaType,
          source: 'url'
        }]
      });
      setMediaUrl('');
    }
  };

  const removeMedia = (index) => {
    const newMedia = formData.media.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      media: newMedia
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
        <h2>📎 Корак 2: Додај медиуми</h2>
        <p>Прикачете слики, видеа, аудио снимки или документи</p>
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
          📁 Прикачи фајл
        </label>
        <label className="method-option">
          <input
            type="radio"
            value="url"
            checked={uploadMethod === 'url'}
            onChange={(e) => setUploadMethod(e.target.value)}
          />
          🔗 Додај URL линк
        </label>
      </div>

      {/* Media Type Selection */}
      <div className="form-group">
        <label>🎭 Вид на медиум:</label>
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
              <p>Повлечете и пуштете фајл овде или</p>
              <label className="file-input-label">
                <input
                  type="file"
                  onChange={handleFileSelect}
                  accept={mediaTypes.find(t => t.value === mediaType)?.accept}
                  className="file-input-hidden"
                />
                <span className="file-input-button">Изберете фајл</span>
              </label>
            </div>
          </div>

          {/* Selected File Preview */}
          {selectedFile && (
            <div className="selected-file-preview">
              <div className="file-info">
                <div className="file-icon">{getMediaTypeIcon(mediaType)}</div>
                <div className="file-details">
                  <div className="file-name">{selectedFile.name}</div>
                  <div className="file-size">{formatFileSize(selectedFile.size)}</div>
                </div>
                <button 
                  onClick={() => setSelectedFile(null)}
                  className="remove-file-btn"
                >
                  ❌
                </button>
              </div>
            </div>
          )}

          <button 
            onClick={addMediaFromFile}
            disabled={!selectedFile || uploading}
            className="add-media-btn"
          >
            {uploading ? (
              <>
                <span className="loading-spinner"></span>
                Се прикачува...
              </>
            ) : (
              <>
                📤 Прикачи фајл
              </>
            )}
          </button>
        </div>
      )}

      {/* URL Upload Section */}
      {uploadMethod === 'url' && (
        <div className="url-upload-section">
          <div className="form-group">
            <label>🔗 URL на медиумот:</label>
            <input
              type="url"
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              placeholder="https://example.com/media.jpg"
              className="url-input"
            />
          </div>

          <button 
            onClick={addMediaFromUrl}
            disabled={!mediaUrl.trim()}
            className="add-media-btn"
          >
            ➕ Додај URL
          </button>
        </div>
      )}

      {/* Media List */}
      {formData.media.length > 0 && (
        <div className="media-list">
          <h3>📋 Додадени медиуми:</h3>
          <div className="media-items">
            {formData.media.map((media, index) => (
              <div key={index} className="media-item">
                <div className="media-info">
                  <span className="media-icon">{getMediaTypeIcon(media.type)}</span>
                  <div className="media-details">
                    <div className="media-type">{media.type.toUpperCase()}</div>
                    <div className="media-name">
                      {media.fileName || media.url}
                    </div>
                    {media.fileSize && (
                      <div className="media-size">{formatFileSize(media.fileSize)}</div>
                    )}
                    <div className="media-source">
                      {media.source === 'upload' ? '📁 Прикачен фајл' : '🔗 URL линк'}
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => removeMedia(index)}
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
          ⬅️ Назад
        </button>
        <button 
          onClick={nextStep} 
          className="nav-btn next-btn"
          disabled={uploading}
        >
          Напред ➡️
        </button>
      </div>
    </div>
  );
}
