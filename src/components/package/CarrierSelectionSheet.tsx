import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { CarrierLogo } from '../common/CarrierLogo';
import { hapticService } from '../../services/haptics.service';
import { useTheme } from '../../theme/useTheme';
import { useTranslation } from '../../hooks/useTranslation';

interface CarrierItem {
  id: string;
  name: string;
  code: string;
  logo: any;
}

interface CarrierSelectionSheetProps {
  visible: boolean;
  onClose: () => void;
  carriers: CarrierItem[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectCarrier: (carrierId: string) => void;
  isLargeScreen?: boolean;
  bottomInset?: number;
}

export const CarrierSelectionSheet: React.FC<CarrierSelectionSheetProps> = ({
  visible,
  onClose,
  carriers,
  searchQuery,
  onSearchChange,
  onSelectCarrier,
  isLargeScreen = false,
  bottomInset = 24,
}) => {
  const { theme: colors } = useTheme();
  const { t } = useTranslation();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalOverlay}
      >
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
        />

        <View
          style={[
            styles.bottomSheetContainer,
            { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outlineVariant },
            { paddingBottom: bottomInset || 24 },
            isLargeScreen && styles.bottomSheetContainerLarge,
          ]}
        >
          {/* Drag Handle (Mobile) */}
          {!isLargeScreen && (
            <View style={styles.dragHandleContainer}>
              <View style={[styles.dragHandle, { backgroundColor: colors.outlineVariant }]} />
            </View>
          )}

          <View style={[styles.sheetHeader, { borderBottomColor: colors.surfaceContainer }]}>
            <Text style={[styles.sheetTitle, { color: colors.onSurface }]}>{t('selectCarrier')}</Text>
            <TouchableOpacity style={styles.iconButton} onPress={onClose}>
              <MaterialIcons name="close" size={24} color={colors.onSurfaceVariant} />
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <View style={styles.searchIconContainer}>
              <MaterialIcons name="search" size={20} color={colors.outline} />
            </View>
            <TextInput
              style={[
                styles.searchInput,
                { backgroundColor: colors.surface, color: colors.onSurface, borderColor: colors.outlineVariant },
              ]}
              placeholder={t('searchCarriers')}
              placeholderTextColor={colors.onSurfaceVariant}
              value={searchQuery}
              onChangeText={onSearchChange}
            />
          </View>

          <View style={styles.sheetScroll}>
            {carriers.length > 0 ? (
              <FlatList
                data={carriers}
                keyExtractor={(item) => item.id}
                numColumns={2}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ paddingBottom: 24, paddingHorizontal: 24, gap: 16 }}
                columnWrapperStyle={{ gap: 16, justifyContent: 'space-between' }}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.carrierGridCard,
                      { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outlineVariant },
                    ]}
                    onPress={() => {
                      hapticService.selection();
                      onSelectCarrier(item.id);
                    }}
                  >
                    <View style={[styles.carrierGridIconBox, { backgroundColor: colors.surfaceContainer }]}>
                      <CarrierLogo logo={item.logo} size={36} />
                    </View>
                    <Text style={[styles.carrierGridName, { color: colors.onSurface }]}>{item.name}</Text>
                  </TouchableOpacity>
                )}
              />
            ) : (
              <View style={styles.noResultsContainer}>
                <MaterialIcons name="search-off" size={32} color={colors.outlineVariant} />
                <Text style={[styles.noResultsText, { color: colors.onSurface }]}>{t('noCarriersFound')}</Text>
                <Text style={[styles.noResultsSubtext, { color: colors.onSurfaceVariant }]}>
                  {t('tryDifferentSearch')}
                </Text>
              </View>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(11, 28, 48, 0.4)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bottomSheetContainer: {
    width: '100%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 24,
    maxHeight: '90%',
    height: 600,
  },
  bottomSheetContainerLarge: {
    maxWidth: 448,
    height: 600,
    borderRadius: 24,
    marginBottom: 16,
  },
  dragHandleContainer: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 4,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 999,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  sheetTitle: {
    fontFamily: 'Inter',
    fontSize: 20,
    fontWeight: '600',
  },
  iconButton: {
    padding: 8,
    borderRadius: 999,
  },
  searchContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    position: 'relative',
  },
  searchIconContainer: {
    position: 'absolute',
    left: 36,
    top: 30,
    zIndex: 1,
  },
  searchInput: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingLeft: 40,
    paddingRight: 12,
    fontFamily: 'Inter',
    fontSize: 16,
  },
  sheetScroll: {
    flex: 1,
  },
  carrierGridCard: {
    width: '47%',
    aspectRatio: 1,
    borderWidth: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  carrierGridIconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  carrierGridName: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  noResultsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  noResultsText: {
    fontFamily: 'Inter',
    fontSize: 16,
    marginTop: 12,
  },
  noResultsSubtext: {
    fontFamily: 'Inter',
    fontSize: 14,
    marginTop: 4,
  },
});
