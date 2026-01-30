import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload,
  Camera,
  FileImage,
  Loader2,
  Check,
  X,
  Plus,
  Sparkles,
  AlertCircle
} from 'lucide-react'
import { useMedicineStore } from '../../store/medicineStore'
import { extractPrescriptionData, isGeminiConfigured } from '../../services/geminiService'

export default function PrescriptionScanner() {
  const { addMedicine } = useMedicineStore()
  const [uploadedFile, setUploadedFile] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [extractedData, setExtractedData] = useState(null)
  const [error, setError] = useState(null)
  const [dragOver, setDragOver] = useState(false)

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file && (file.type.startsWith('image/') || file.type === 'application/pdf')) {
      handleFileUpload(file)
    }
  }, [])

  const handleFileUpload = async (file) => {
    setUploadedFile(file)
    setError(null)
    setIsProcessing(true)

    try {
      // Check if Gemini is configured
      if (!isGeminiConfigured()) {
        throw new Error('Gemini API key not configured. Please add your API key to the .env file.')
      }

      // Call real Gemini API
      const medicines = await extractPrescriptionData(file)

      if (medicines.length === 0) {
        setError('No medicines found in the prescription. Please try with a clearer image.')
        setExtractedData(null)
      } else {
        setExtractedData(medicines)
      }
    } catch (err) {
      console.error('Prescription scan error:', err)
      setError(err.message || 'Failed to analyze prescription. Please try again.')
      setExtractedData(null)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const handleSaveAll = () => {
    extractedData.forEach(med => {
      addMedicine({
        name: med.name,
        dosage: med.dosage,
        frequency: med.frequency,
        pillsRemaining: 30,
        totalPills: 30,
        refillThreshold: 10,
        time: 'morning'
      })
    })
    // Reset state
    setUploadedFile(null)
    setExtractedData(null)
  }

  const handleRemoveItem = (index) => {
    setExtractedData(prev => prev.filter((_, i) => i !== index))
  }

  const handleReset = () => {
    setUploadedFile(null)
    setExtractedData(null)
    setError(null)
  }

  return (
    <div className="prescription-scanner">
      {/* Header */}
      <div className="scanner-header">
        <div>
          <h1>
            <Sparkles className="inline-icon" size={28} />
            AI Prescription Scanner
          </h1>
          <p>Upload a prescription to automatically extract medicine details</p>
        </div>
      </div>

      {/* Upload Area */}
      {!uploadedFile && (
        <motion.div
          className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="upload-content">
            <div className="upload-icon">
              <Upload size={40} />
            </div>
            <h3>Drop your prescription here</h3>
            <p>or click to browse files</p>
            <div className="upload-formats">
              <span><FileImage size={14} /> JPG, PNG</span>
              <span><FileImage size={14} /> PDF</span>
            </div>
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={handleFileChange}
              className="file-input"
            />
          </div>

          <div className="upload-divider">
            <span>or</span>
          </div>

          <button className="camera-btn btn btn-secondary">
            <Camera size={20} />
            Take a Photo
          </button>
        </motion.div>
      )}

      {/* Processing State */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div
            className="processing-state"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <div className="processing-content">
              <div className="processing-animation">
                <Loader2 className="spinner" size={48} />
                <Sparkles className="sparkle sparkle-1" size={16} />
                <Sparkles className="sparkle sparkle-2" size={12} />
                <Sparkles className="sparkle sparkle-3" size={14} />
              </div>
              <h3>AI is analyzing your prescription...</h3>
              <p>Using Gemini 1.5 Flash to extract medicine details</p>
              <div className="processing-steps">
                <div className="step done">
                  <Check size={16} />
                  <span>Image uploaded</span>
                </div>
                <div className="step active">
                  <Loader2 size={16} className="mini-spinner" />
                  <span>Extracting text</span>
                </div>
                <div className="step">
                  <span className="step-dot" />
                  <span>Identifying medicines</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Table */}
      <AnimatePresence>
        {extractedData && !isProcessing && (
          <motion.div
            className="results-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="results-header">
              <div>
                <h2>Extracted Medicines</h2>
                <p>{extractedData.length} medicine(s) found</p>
              </div>
              <button className="btn btn-ghost" onClick={handleReset}>
                <X size={18} />
                Start Over
              </button>
            </div>

            <div className="results-table">
              <div className="table-header">
                <span>Medicine Name</span>
                <span>Dosage</span>
                <span>Frequency</span>
                <span>Confidence</span>
                <span></span>
              </div>
              {extractedData.map((med, index) => (
                <motion.div
                  key={index}
                  className="table-row"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <span className="med-name">{med.name}</span>
                  <span className="med-dosage">{med.dosage}</span>
                  <span className="med-frequency">{med.frequency}</span>
                  <span className={`confidence ${med.confidence >= 90 ? 'high' : med.confidence >= 75 ? 'medium' : 'low'}`}>
                    {med.confidence}%
                  </span>
                  <button
                    className="remove-btn"
                    onClick={() => handleRemoveItem(index)}
                  >
                    <X size={16} />
                  </button>
                </motion.div>
              ))}
            </div>

            <div className="results-actions">
              <button className="btn btn-ghost">
                <Plus size={18} />
                Add Manual Entry
              </button>
              <motion.button
                className="btn btn-primary"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSaveAll}
              >
                <Check size={18} />
                Save All to Inventory
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error State */}
      {error && (
        <div className="error-state">
          <AlertCircle size={24} />
          <p>{error}</p>
          <button className="btn btn-ghost" onClick={handleReset}>
            Try Again
          </button>
        </div>
      )}

      <style>{`
        .prescription-scanner {
          padding-bottom: var(--space-8);
        }

        .scanner-header {
          margin-bottom: var(--space-8);
        }

        .scanner-header h1 {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          font-size: var(--font-size-2xl);
          color: var(--forest-green);
          margin-bottom: var(--space-1);
        }

        .inline-icon {
          color: var(--buttermilk-yellow);
          filter: drop-shadow(0 0 8px rgba(255, 249, 196, 0.5));
        }

        .scanner-header p {
          color: var(--text-secondary);
          font-size: var(--font-size-sm);
        }

        /* Upload Zone */
        .upload-zone {
          background: var(--surface);
          border: 2px dashed rgba(27, 94, 32, 0.3);
          border-radius: var(--radius-2xl);
          padding: var(--space-10);
          text-align: center;
          transition: all var(--transition-base);
          position: relative;
        }

        .upload-zone.drag-over {
          border-color: var(--forest-green);
          background: rgba(27, 94, 32, 0.05);
        }

        .upload-content {
          position: relative;
        }

        .upload-icon {
          width: 80px;
          height: 80px;
          margin: 0 auto var(--space-4);
          background: var(--gradient-subtle);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--forest-green);
        }

        .upload-content h3 {
          font-size: var(--font-size-lg);
          color: var(--text-primary);
          margin-bottom: var(--space-1);
        }

        .upload-content p {
          color: var(--text-secondary);
          font-size: var(--font-size-sm);
        }

        .upload-formats {
          display: flex;
          justify-content: center;
          gap: var(--space-4);
          margin-top: var(--space-4);
        }

        .upload-formats span {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-size: var(--font-size-xs);
          color: var(--text-muted);
        }

        .file-input {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
          cursor: pointer;
        }

        .upload-divider {
          display: flex;
          align-items: center;
          margin: var(--space-6) 0;
        }

        .upload-divider::before,
        .upload-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: rgba(0, 0, 0, 0.1);
        }

        .upload-divider span {
          padding: 0 var(--space-4);
          font-size: var(--font-size-sm);
          color: var(--text-muted);
        }

        .camera-btn {
          margin: 0 auto;
        }

        /* Processing State */
        .processing-state {
          background: var(--surface);
          border-radius: var(--radius-2xl);
          padding: var(--space-12);
          text-align: center;
          box-shadow: var(--shadow-lg);
        }

        .processing-content h3 {
          font-size: var(--font-size-lg);
          color: var(--text-primary);
          margin-bottom: var(--space-2);
        }

        .processing-content p {
          color: var(--text-secondary);
          font-size: var(--font-size-sm);
          margin-bottom: var(--space-6);
        }

        .processing-animation {
          position: relative;
          width: 100px;
          height: 100px;
          margin: 0 auto var(--space-6);
        }

        .spinner {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: var(--forest-green);
          animation: spin 1.5s linear infinite;
        }

        .sparkle {
          position: absolute;
          color: var(--buttermilk-yellow);
          animation: sparkle 2s ease-in-out infinite;
        }

        .sparkle-1 { top: 0; right: 10px; animation-delay: 0s; }
        .sparkle-2 { bottom: 10px; left: 5px; animation-delay: 0.5s; }
        .sparkle-3 { top: 20px; left: 0; animation-delay: 1s; }

        @keyframes spin {
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }

        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: scale(0); }
          50% { opacity: 1; transform: scale(1); }
        }

        .processing-steps {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
          max-width: 300px;
          margin: 0 auto;
        }

        .step {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          font-size: var(--font-size-sm);
          color: var(--text-muted);
        }

        .step.done {
          color: var(--success);
        }

        .step.active {
          color: var(--forest-green);
        }

        .step-dot {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: var(--surface-muted);
        }

        .mini-spinner {
          animation: spin 1s linear infinite;
        }

        /* Results Section */
        .results-section {
          background: var(--surface);
          border-radius: var(--radius-2xl);
          padding: var(--space-6);
          box-shadow: var(--shadow-lg);
        }

        .results-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: var(--space-6);
        }

        .results-header h2 {
          font-size: var(--font-size-lg);
          color: var(--forest-green);
          margin-bottom: var(--space-1);
        }

        .results-header p {
          font-size: var(--font-size-sm);
          color: var(--text-secondary);
        }

        .results-table {
          border: 1px solid rgba(0, 0, 0, 0.1);
          border-radius: var(--radius-lg);
          overflow: hidden;
        }

        .table-header {
          display: grid;
          grid-template-columns: 2fr 1fr 1.5fr 1fr 40px;
          gap: var(--space-4);
          padding: var(--space-3) var(--space-4);
          background: var(--surface-muted);
          font-size: var(--font-size-xs);
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .table-row {
          display: grid;
          grid-template-columns: 2fr 1fr 1.5fr 1fr 40px;
          gap: var(--space-4);
          padding: var(--space-4);
          align-items: center;
          border-bottom: 1px solid rgba(0, 0, 0, 0.06);
        }

        .table-row:last-child {
          border-bottom: none;
        }

        .med-name {
          font-weight: 600;
          color: var(--text-primary);
        }

        .med-dosage {
          color: var(--forest-green);
          font-weight: 500;
        }

        .med-frequency {
          color: var(--text-secondary);
          font-size: var(--font-size-sm);
        }

        .confidence {
          padding: var(--space-1) var(--space-2);
          border-radius: var(--radius-md);
          font-size: var(--font-size-xs);
          font-weight: 600;
          text-align: center;
        }

        .confidence.high {
          background: rgba(34, 197, 94, 0.1);
          color: #16A34A;
        }

        .confidence.medium {
          background: rgba(245, 158, 11, 0.1);
          color: #D97706;
        }

        .confidence.low {
          background: rgba(239, 68, 68, 0.1);
          color: #DC2626;
        }

        .remove-btn {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--surface-muted);
          border: none;
          border-radius: var(--radius-md);
          color: var(--text-muted);
          cursor: pointer;
        }

        .remove-btn:hover {
          background: var(--error);
          color: white;
        }

        .results-actions {
          display: flex;
          justify-content: space-between;
          margin-top: var(--space-6);
          padding-top: var(--space-6);
          border-top: 1px solid rgba(0, 0, 0, 0.1);
        }

        /* Error State */
        .error-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-4);
          padding: var(--space-8);
          background: rgba(239, 68, 68, 0.1);
          border-radius: var(--radius-xl);
          color: var(--error);
          text-align: center;
        }

        @media (max-width: 768px) {
          .table-header,
          .table-row {
            grid-template-columns: 1fr;
            gap: var(--space-2);
          }

          .table-header {
            display: none;
          }

          .table-row {
            display: flex;
            flex-wrap: wrap;
          }

          .med-name {
            width: 100%;
          }
        }
      `}</style>
    </div>
  )
}
