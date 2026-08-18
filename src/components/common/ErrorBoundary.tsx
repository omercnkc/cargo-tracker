import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { translate as t } from '../../hooks/useTranslation';
import { ErrorHandler } from '../../services/error/errorHandler.service';
import { styles } from './ErrorBoundary.styles';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    ErrorHandler.handleError(error, 'ReactErrorBoundary', { showToast: false, showAlert: false });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View style={styles.container}>
          <View style={styles.card}>
            <View style={styles.iconContainer}>
              <Ionicons name="warning-outline" size={48} color="#ef4444" />
            </View>
            <Text style={styles.title}>{t('errorBoundaryTitle')}</Text>
            <Text style={styles.message}>{t('errorBoundaryMsg')}</Text>

            <TouchableOpacity
              style={styles.retryBtn}
              onPress={this.handleReset}
              activeOpacity={0.8}
            >
              <Ionicons name="refresh" size={18} color="#ffffff" style={{ marginRight: 8 }} />
              <Text style={styles.retryBtnText}>{t('retry')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
