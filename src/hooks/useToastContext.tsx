import { useContext } from "react";
import { ToastContext } from "../context/ToastContext";

export const useToastContext = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToastContext phải được sử dụng trongToastProvider");
  }
  return context;
};
