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
import { styles } from './CarrierSelectionSheet.styles';

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

export default CarrierSelectionSheet;
