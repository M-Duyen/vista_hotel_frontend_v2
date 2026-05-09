/* eslint-disable*/
import React, { useState, useEffect, useRef } from "react";
import { FaIdCard, FaCamera, FaUpload } from "react-icons/fa";
import Webcam from "react-webcam";
import Tesseract from "tesseract.js";
import type { IDCardInfo, IDScannerModalProps } from "../../types/IDCardInfo";

function IDScannerModal({
  isOpen,
  onClose,
  onComplete,
  bookingID,
  customerID,
}: IDScannerModalProps) {
  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [selectedCamera, setSelectedCamera] = useState("");
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>(
    []
  );
  const [isScanning, setIsScanning] = useState(false);
  const [scannedIDInfo, setScannedIDInfo] = useState<IDCardInfo | null>(null);
  const [scanProgress, setScanProgress] = useState(0);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (isOpen) {
      getCameras();
      resetState();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen]);

  const getCameras = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      streamRef.current = stream;
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter((d) => d.kind === "videoinput");
      setAvailableCameras(videoDevices);
      if (videoDevices.length) setSelectedCamera(videoDevices[0].deviceId);
      stream.getTracks().forEach((t) => t.stop());
    } catch (err) {
      if (err instanceof DOMException) {
        if (err.name === "NotAllowedError")
          setError("Bạn đã từ chối quyền truy cập camera");
        else if (err.name === "NotFoundError")
          setError("Không tìm thấy camera");
        else setError("Lỗi camera: " + err.message);
      } else setError("Không thể truy cập camera");
    }
  };

  const stopCamera = () => {
    if (webcamRef.current?.stream)
      webcamRef.current.stream.getTracks().forEach((t) => t.stop());
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };
  const resetState = () => {
    setScannedIDInfo(null);
    setScanProgress(0);
    setIsScanning(false);
    setCapturedImage(null);
    setError("");
  };

  const captureImage = () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc) {
      setError("Camera chưa sẵn sàng");
      return;
    }
    setCapturedImage(imageSrc);
    processImage(imageSrc);
  };
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = ev.target?.result as string;
      setCapturedImage(img);
      processImage(img);
    };
    reader.readAsDataURL(file);
  };

  const processImage = async (imageSrc: string) => {
    setIsScanning(true);
    setScanProgress(0);
    setError("");
    try {
      const result = await Tesseract.recognize(imageSrc, "vie", {
        logger: (m) => {
          if (m.status === "recognizing text")
            setScanProgress(Math.round(m.progress * 100));
        },
      });
      const idInfo = parseIDCardInfo(result.data.text);
      if (idInfo) setScannedIDInfo(idInfo);
      else
        setError(
          "Không thể đọc thông tin CMND/CCCD. Vui lòng thử lại hoặc nhập thủ công."
        );
    } catch {
      setError("Lỗi khi xử lý ảnh. Vui lòng thử lại.");
    } finally {
      setIsScanning(false);
      setScanProgress(100);
    }
  };

  const parseIDCardInfo = (text: string): IDCardInfo | null => {
    try {
      const lines = text.split("\n").filter((l) => l.trim());
      const idNumberPattern = /(\d{9}|\d{12})/;
      const dobPattern = /(\d{2}\/\d{2}\/\d{4})/;
      const expiryPattern = /(\d{2}\/\d{2}\/\d{4})/g;
      let idNumber = "";
      let fullName = "";
      let dateOfBirth = "";
      let gender = "";
      let nationality = "Việt Nam";
      let placeOfOrigin = "";
      let placeOfResidence = "";
      let expiryDate = "";
      for (const line of lines) {
        const m = line.match(idNumberPattern);
        if (m && !idNumber) {
          idNumber = m[1];
          break;
        }
      }
      for (let i = 0; i < lines.length; i++)
        if (lines[i].includes("Họ và tên") || lines[i].includes("Full name")) {
          fullName = lines[i + 1] || "";
          break;
        }
      const dobMatches = text.match(dobPattern);
      if (dobMatches) dateOfBirth = dobMatches[0];
      if (text.includes("Nam") || text.includes("Male")) gender = "Nam";
      else if (text.includes("Nữ") || text.includes("Female")) gender = "Nữ";
      const expiryMatches = Array.from(text.matchAll(expiryPattern));
      if (expiryMatches.length > 1)
        expiryDate = expiryMatches.at(-1)?.[0] || "";
      if (!idNumber || !fullName) return null;
      return {
        idNumber,
        fullName: fullName.toUpperCase(),
        dateOfBirth,
        gender,
        nationality,
        placeOfOrigin,
        placeOfResidence,
        expiryDate,
      };
    } catch {
      return null;
    }
  };

  const handleUseMockData = () =>
    setScannedIDInfo({
      idNumber: "001234567890",
      fullName: "NGUYỄN VĂN A",
      dateOfBirth: "01/01/1990",
      gender: "Nam",
      nationality: "Việt Nam",
      placeOfOrigin: "Hà Nội",
      placeOfResidence: "123 Đường ABC, Quận 1, TP.HCM",
      expiryDate: "01/01/2035",
    });
  const handleComplete = () => {
    if (!scannedIDInfo) {
      setError("Vui lòng quét CMND/CCCD trước");
      return;
    }
    stopCamera();
    onComplete(scannedIDInfo);
  };
  const handleClose = () => {
    stopCamera();
    resetState();
    onClose();
  };
  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/70 z-[60]"
        onClick={handleClose}
      ></div>
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 overflow-y-auto">
        <div
          className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-[modalFadeIn_0.3s] my-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-5 border-b border-[#EBE3D7] sticky top-0 bg-white z-10 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <FaIdCard className="text-[#CCBDA3] text-2xl" />
              <h3 className="text-2xl font-playfair font-semibold">
                Scan ID Card
              </h3>
            </div>
            <button
              onClick={handleClose}
              className="text-2xl text-gray-500 hover:text-black"
            >
              &times;
            </button>
          </div>
          <div className="p-6">
            {(bookingID || customerID) && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg text-sm">
                {bookingID && (
                  <div>
                    <span className="text-gray-600">Booking ID:</span>{" "}
                    <span className="font-medium text-blue-700">
                      {bookingID}
                    </span>
                  </div>
                )}
                {customerID && (
                  <div>
                    <span className="text-gray-600">Customer ID:</span>{" "}
                    <span className="font-medium text-blue-700">
                      {customerID}
                    </span>
                  </div>
                )}
              </div>
            )}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}
            {availableCameras.length === 0 && !error && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-700">
                Không tìm thấy camera. Vui lòng sử dụng chức năng Upload ảnh.
              </div>
            )}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                Chọn Camera hoặc Upload Ảnh
              </label>
              {import.meta.env.DEV && (
                <div className="mb-2 text-xs text-gray-500">
                  Cameras found: {availableCameras.length}
                </div>
              )}
              <div className="flex gap-2 flex-wrap">
                <select
                  value={selectedCamera}
                  onChange={(e) => setSelectedCamera(e.target.value)}
                  className="flex-1 min-w-[200px] p-2.5 border border-[#EBE3D7] rounded-md focus:outline-none focus:ring-2 focus:ring-[#CCBDA3]"
                  disabled={isScanning || !availableCameras.length}
                >
                  {!availableCameras.length ? (
                    <option>Không tìm thấy camera</option>
                  ) : (
                    availableCameras.map((c) => (
                      <option key={c.deviceId} value={c.deviceId}>
                        {c.label || `Camera ${c.deviceId.slice(0, 5)}`}
                      </option>
                    ))
                  )}
                </select>
                <button
                  onClick={captureImage}
                  disabled={isScanning || !selectedCamera}
                  className="px-6 py-2.5 bg-[#CCBDA3] text-white rounded-md hover:bg-[#b8ac94] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <FaCamera /> Chụp Ảnh
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isScanning}
                  className="px-6 py-2.5 border border-[#CCBDA3] text-[#CCBDA3] rounded-md hover:bg-[#CCBDA3]/10 transition disabled:opacity-50 flex items-center gap-2"
                >
                  <FaUpload /> Upload
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </div>
            <div className="mb-6">
              <div
                className="relative bg-gray-100 rounded-lg overflow-hidden"
                style={{ height: "300px" }}
              >
                {!capturedImage && !isScanning && (
                  <>
                    {selectedCamera ? (
                      <Webcam
                        ref={webcamRef}
                        audio={false}
                        screenshotFormat="image/jpeg"
                        videoConstraints={{
                          deviceId: selectedCamera,
                          facingMode: "environment",
                        }}
                        className="w-full h-full object-cover"
                        onUserMedia={(s) => {
                          streamRef.current = s;
                        }}
                        onUserMediaError={(err) => {
                          const msg =
                            typeof err === "string"
                              ? err
                              : (err as any)?.message || "";
                          setError("Không thể khởi động camera: " + msg);
                        }}
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 bg-gray-200">
                        <FaIdCard className="text-6xl mb-3" />
                        <p className="text-lg">Đang tìm camera...</p>
                      </div>
                    )}
                    {selectedCamera && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-8">
                        <div className="w-full h-full border-4 border-white/70 rounded-lg shadow-2xl" />
                      </div>
                    )}
                  </>
                )}
                {isScanning && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-white">
                    <div className="w-64 h-40 border-4 border-[#CCBDA3] border-dashed rounded-lg animate-pulse" />
                    <div className="mt-4 w-64">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-[#CCBDA3] h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${scanProgress}%`,
                          }}
                        />
                      </div>
                      <p className="text-center mt-2 text-sm text-gray-600">
                        Đang xử lý... {scanProgress}%
                      </p>
                    </div>
                  </div>
                )}
                {capturedImage && !isScanning && (
                  <img
                    src={capturedImage}
                    alt="Captured"
                    className="w-full h-full object-contain"
                  />
                )}
              </div>
            </div>
            {scannedIDInfo && (
              <div className="bg-[#F5F0EB] p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-3 text-green-600">
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <h4 className="font-semibold">Thông Tin CMND/CCCD</h4>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Số CMND/CCCD:</span>{" "}
                    <span className="font-medium">
                      {scannedIDInfo.idNumber}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Họ và Tên:</span>{" "}
                    <span className="font-medium">
                      {scannedIDInfo.fullName}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Ngày Sinh:</span>{" "}
                    <span className="font-medium">
                      {scannedIDInfo.dateOfBirth}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Giới Tính:</span>{" "}
                    <span className="font-medium">{scannedIDInfo.gender}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Quốc Tịch:</span>{" "}
                    <span className="font-medium">
                      {scannedIDInfo.nationality}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Ngày Hết Hạn:</span>{" "}
                    <span className="font-medium">
                      {scannedIDInfo.expiryDate}
                    </span>
                  </div>
                </div>
              </div>
            )}
            {import.meta.env.DEV && (
              <button
                onClick={handleUseMockData}
                className="mt-4 text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Sử dụng dữ liệu mẫu (Dev mode)
              </button>
            )}
          </div>
          <div className="p-5 border-t border-[#EBE3D7] bg-[#F5F0EB]/30 flex justify-end gap-3 sticky bottom-0">
            <button
              onClick={handleClose}
              className="px-6 py-2.5 border border-[#EBE3D7] rounded-md hover:bg-[#EBE3D7]/50 transition font-medium"
            >
              Hủy
            </button>
            {scannedIDInfo && (
              <button
                onClick={() => {
                  setCapturedImage(null);
                  setScannedIDInfo(null);
                }}
                className="px-6 py-2.5 border border-[#CCBDA3] text-[#CCBDA3] rounded-md hover:bg-[#CCBDA3]/10 transition font-medium"
              >
                Quét Lại
              </button>
            )}
            <button
              onClick={handleComplete}
              disabled={!scannedIDInfo}
              className="px-6 py-2.5 bg-[#CCBDA3] text-white rounded-md hover:bg-[#b8ac94] transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Xác Nhận
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default IDScannerModal;
