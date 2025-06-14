"use client";

import React from "react";
import { AlertTriangle, Info, X } from "lucide-react";
import { useAppTheme } from "@/context/ThemeContext";
import Spinner from "@/components/spinners/ticketPage";

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: "primary" | "danger" | "warning";
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  icon?: "warning" | "info";
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  confirmVariant = "primary",
  onConfirm,
  onCancel,
  isLoading = false,
  icon = "warning"
}) => {
  const { uiColors, themeColors } = useAppTheme();

  // Define button styles based on variant
  const getButtonStyles = () => {
    switch (confirmVariant) {
      case "danger":
        return "bg-red-600 hover:bg-red-700 text-white dark:bg-red-700 dark:hover:bg-red-800";
      case "warning":
        return "bg-amber-500 hover:bg-amber-600 text-white dark:bg-amber-600 dark:hover:bg-amber-700";
      case "primary":
      default:
        return `${themeColors.buttonBg} ${themeColors.buttonHoverBg} ${themeColors.buttonText}`;
    }
  };

  // Define icon component based on type
  const IconComponent = icon === "warning" ? AlertTriangle : Info;
  const iconColor = icon === "warning" ? "text-amber-500" : `${themeColors.accentText}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className={`w-full max-w-md rounded-lg ${uiColors.cardBg} shadow-xl`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className={`text-lg font-semibold ${uiColors.primaryText} flex items-center`}>
            <IconComponent className={`h-5 w-5 ${iconColor} mr-2`} />
            {title}
          </h2>
          <button
            onClick={onCancel}
            className={`p-1 rounded-full ${uiColors.hoverBg} transition-colors`}
            aria-label="Close"
            disabled={isLoading}
          >
            <X className={`h-5 w-5 ${themeColors.iconStroke}`} />
          </button>
        </div>
        
        {/* Message body */}
        <div className="p-6">
          <p className={`${uiColors.secondaryText}`}>{message}</p>
        </div>
        
        {/* Actions */}
        <div className="flex justify-end items-center gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            className={`px-4 py-2 rounded-md ${uiColors.softBg} ${uiColors.secondaryText} hover:${uiColors.hoverBg} transition-colors`}
            onClick={onCancel}
            disabled={isLoading}
          >
            {cancelLabel}
          </button>
          <button
            className={`px-4 py-2 rounded-md ${getButtonStyles()} transition-colors flex items-center`}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Spinner />
                Processing...
              </>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;