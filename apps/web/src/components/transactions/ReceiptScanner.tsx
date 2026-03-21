import { useState, useRef } from 'react';
import { Upload, Camera, X, Loader2 } from 'lucide-react';
import api from '../../api/client';

interface ReceiptScannerProps {
  onResult: (data: {
    merchantName?: string;
    totalAmount?: number;
    date?: string;
    suggestedCategory?: string;
    rawText?: string;
  }) => void;
  onClose: () => void;
}

export default function ReceiptScanner({ onResult, onClose }: ReceiptScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showCamera, setShowCamera] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processImage(file);
  };

  const processImage = async (file: File) => {
    setPreview(URL.createObjectURL(file));
    setIsScanning(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('receipt', file);

      const res = await api.post('/ocr/scan', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const data = res.data;
      if (data.confidence > 0) {
        onResult({
          merchantName: data.merchantName,
          totalAmount: data.totalAmount,
          date: data.date,
          suggestedCategory: data.suggestedCategory,
          rawText: data.rawText,
        });
      } else {
        setError('Could not extract data from the receipt. Please enter details manually.');
      }
    } catch {
      setError('Failed to scan receipt. Please try again or enter details manually.');
    } finally {
      setIsScanning(false);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setShowCamera(true);
      }
    } catch {
      setError('Could not access camera');
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], 'receipt.jpg', { type: 'image/jpeg' });

      // Stop camera
      const stream = videoRef.current?.srcObject as MediaStream;
      stream?.getTracks().forEach((t) => t.stop());
      setShowCamera(false);

      await processImage(file);
    }, 'image/jpeg', 0.8);
  };

  return (
    <div className="p-6 bg-gray-50 border-b">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-medium text-gray-900">Scan Receipt</h4>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X size={18} />
        </button>
      </div>

      {showCamera ? (
        <div className="space-y-3">
          <video ref={videoRef} autoPlay playsInline className="w-full rounded-lg" />
          <button onClick={capturePhoto} className="btn-primary w-full">
            Capture Photo
          </button>
        </div>
      ) : (
        <>
          {preview ? (
            <div className="relative">
              <img src={preview} alt="Receipt" className="w-full rounded-lg max-h-48 object-cover" />
              {isScanning && (
                <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                  <div className="text-center text-white">
                    <Loader2 className="animate-spin mx-auto mb-2" size={32} />
                    <p className="text-sm">Scanning receipt...</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 flex flex-col items-center gap-2 p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-400 hover:bg-primary-50 transition-colors"
              >
                <Upload size={24} className="text-gray-400" />
                <span className="text-sm text-gray-600">Upload Image</span>
              </button>
              <button
                onClick={startCamera}
                className="flex-1 flex flex-col items-center gap-2 p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-400 hover:bg-primary-50 transition-colors"
              >
                <Camera size={24} className="text-gray-400" />
                <span className="text-sm text-gray-600">Take Photo</span>
              </button>
            </div>
          )}
        </>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </div>
  );
}
