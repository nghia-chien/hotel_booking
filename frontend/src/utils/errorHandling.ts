import { useTranslation } from "react-i18next";
import { ApiError } from "../api/client";

/**
 * Hook to handle API errors and return localized messages.
 * Uses errorCode from backend if available, otherwise falls back to the message.
 */
export const useErrorHandler = () => {
  const { t } = useTranslation();

  const getErrorMessage = (error: unknown): string => {
    if (error instanceof ApiError) {
      if (error.errorCode) {
        const translationKey = `apiErrors.${error.errorCode}`;
        const translated = t(translationKey);
        
        // If translation exists and is not the key itself
        if (translated !== translationKey) {
          return translated;
        }
      }
      return error.message;
    }
    
    if (error instanceof Error) {
      return error.message;
    }
    
    return t("apiErrors.UNKNOWN_ERROR");
  };

  return { getErrorMessage };
};
