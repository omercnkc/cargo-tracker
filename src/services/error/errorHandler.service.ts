import { Alert } from 'react-native';
import { translate as t } from '../../hooks/useTranslation';
import { logger } from '../../utils/logger';

export enum AppErrorCode {
  GPS_DISABLED = 'GPS_DISABLED',
  LOCATION_PERMISSION_DENIED = 'LOCATION_PERMISSION_DENIED',
  GPS_UNAVAILABLE = 'GPS_UNAVAILABLE',
  NETWORK_OFFLINE = 'NETWORK_OFFLINE',
  CAMERA_PERMISSION_DENIED = 'CAMERA_PERMISSION_DENIED',
  FILE_SYSTEM_ERROR = 'FILE_SYSTEM_ERROR',
  BIOMETRIC_FAILED = 'BIOMETRIC_FAILED',
  API_ERROR = 'API_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export interface AppErrorPayload {
  code: AppErrorCode | string;
  title: string;
  message: string;
  originalError?: any;
  isWarning?: boolean;
}

type ToastFunction = (message: string, type?: 'success' | 'warning' | 'error' | 'info', title?: string) => void;

let globalToastHandler: ToastFunction | null = null;

export const registerGlobalToastHandler = (toastFn: ToastFunction | null) => {
  globalToastHandler = toastFn;
};

class ErrorHandlerService {
  /**
   * Normalizes any error or error code into a structured AppErrorPayload
   */
  normalizeError(error: unknown, context?: string): AppErrorPayload {
    if (typeof error === 'string' && Object.values(AppErrorCode).includes(error as AppErrorCode)) {
      return this.getErrorPayloadByCode(error as AppErrorCode);
    }

    const errObj = error as any;
    const errMsg = errObj?.message || String(error || '');

    // Pattern matching common React Native / Expo device & network error messages
    if (errMsg.includes('Current location is unavailable') || errMsg.includes('location services are enabled')) {
      return this.getErrorPayloadByCode(AppErrorCode.GPS_DISABLED, errObj);
    }
    if (errMsg.includes('Location permission') || errMsg.includes('permission denied')) {
      return this.getErrorPayloadByCode(AppErrorCode.LOCATION_PERMISSION_DENIED, errObj);
    }
    if (
      errMsg.includes('Network request failed') ||
      errMsg.includes('offline') ||
      errMsg.includes('Internet') ||
      errMsg.includes('reverseGeocodeAsync') ||
      errMsg.includes('reverseGeocode') ||
      errMsg.includes('UNAVAILABLE') ||
      errMsg.includes('IOException') ||
      errMsg.includes('Geocoder') ||
      errMsg.includes('jsqv')
    ) {
      return this.getErrorPayloadByCode(AppErrorCode.NETWORK_OFFLINE, errObj);
    }
    if (errMsg.includes('Camera') && errMsg.includes('permission')) {
      return this.getErrorPayloadByCode(AppErrorCode.CAMERA_PERMISSION_DENIED, errObj);
    }

    return {
      code: AppErrorCode.UNKNOWN_ERROR,
      title: t('errorGenericTitle'),
      message: errMsg || t('errorGenericMsg'),
      originalError: error,
      isWarning: false,
    };
  }

  private getErrorPayloadByCode(code: AppErrorCode, originalError?: any): AppErrorPayload {
    switch (code) {
      case AppErrorCode.GPS_DISABLED:
        return {
          code,
          title: t('gpsDisabledTitle'),
          message: t('gpsDisabledMsg'),
          originalError,
          isWarning: true,
        };

      case AppErrorCode.LOCATION_PERMISSION_DENIED:
        return {
          code,
          title: t('gpsPermissionDeniedTitle'),
          message: t('gpsPermissionDeniedMsg'),
          originalError,
          isWarning: true,
        };

      case AppErrorCode.GPS_UNAVAILABLE:
        return {
          code,
          title: t('gpsUnavailableTitle'),
          message: t('gpsUnavailableMsg'),
          originalError,
          isWarning: true,
        };

      case AppErrorCode.NETWORK_OFFLINE:
        return {
          code,
          title: t('networkOfflineTitle'),
          message: t('networkOfflineMsg'),
          originalError,
          isWarning: true,
        };

      case AppErrorCode.CAMERA_PERMISSION_DENIED:
        return {
          code,
          title: t('cameraDeniedTitle'),
          message: t('cameraDeniedMsg'),
          originalError,
          isWarning: true,
        };

      case AppErrorCode.FILE_SYSTEM_ERROR:
        return {
          code,
          title: t('fileSystemErrorTitle'),
          message: t('fileSystemErrorMsg'),
          originalError,
          isWarning: false,
        };

      default:
        return {
          code: AppErrorCode.UNKNOWN_ERROR,
          title: t('errorGenericTitle'),
          message: t('errorGenericMsg'),
          originalError,
          isWarning: false,
        };
    }
  }

  /**
   * Centralized error handler method
   */
  handleError(
    error: unknown,
    context = 'General',
    options: { showAlert?: boolean; showToast?: boolean; mode?: 'alert' | 'toast' | 'both' | 'none' } = {}
  ): AppErrorPayload {
    const payload = this.normalizeError(error, context);
    const mode = options.mode ?? (options.showAlert ? 'alert' : options.showToast ? 'toast' : 'both');

    // Use logger.warn for expected user/device runtime warnings to avoid Dev Mode RedBox screens
    if (payload.isWarning) {
      logger.warn(`[${context}] ${payload.title}: ${payload.message}`, payload.originalError);
    } else {
      logger.error(`[${context}] ${payload.title}: ${payload.message}`, payload.originalError);
    }

    if (mode === 'toast' || mode === 'both') {
      if (globalToastHandler) {
        globalToastHandler(
          payload.message,
          payload.isWarning ? 'warning' : 'error',
          payload.title
        );
      } else if (mode === 'toast') {
        // Fallback to Alert if Toast system is not yet initialized
        Alert.alert(payload.title, payload.message);
      }
    }

    if (mode === 'alert' || (mode === 'both' && !globalToastHandler)) {
      Alert.alert(payload.title, payload.message);
    }

    return payload;
  }
}

export const ErrorHandler = new ErrorHandlerService();
