import React, { Component, ErrorInfo, ReactNode } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { translate as t } from '../../hooks/useTranslation';
import { ErrorHandler } from '../../services/error/errorHandler.service';

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0f19',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    width: '100%',
  },
  retryBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
});
