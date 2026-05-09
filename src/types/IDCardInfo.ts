export interface IDCardInfo {
  idNumber: string;
  fullName: string;
  dateOfBirth: string;
  gender: string;
  nationality: string;
  placeOfOrigin: string;
  placeOfResidence: string;
  expiryDate: string;
}
export interface IDScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (idInfo: IDCardInfo) => void;
  bookingID?: string;
  customerID?: string;
}
