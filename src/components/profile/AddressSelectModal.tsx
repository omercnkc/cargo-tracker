import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
  StyleSheet
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme/useTheme';
import { useTranslation } from '../../hooks/useTranslation';
import { styles } from './AddressSelectModal.styles';

export interface SelectOption {
  id: string;
  name: string;
}

interface AddressSelectModalProps {
  visible: boolean;
  title: string;
  options: SelectOption[];
  selectedValue?: string;
  onSelect: (option: SelectOption) => void;
  onClose: () => void;
  loading?: boolean;
}

export function AddressSelectModal({
  visible,
  title,
  options,
  selectedValue,
  onSelect,
  onClose,
  loading = false,
}: AddressSelectModalProps) {
  const { theme: colors } = useTheme();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOptions = searchQuery.trim()
    ? options.filter((item) =>
        item.name
          .toLocaleLowerCase('tr-TR')
          .includes(searchQuery.trim().toLocaleLowerCase('tr-TR'))
      )
    : options;

  const handleClose = () => {
    setSearchQuery('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={handleClose}
        />
        <View
          style={[
            styles.container,
            { backgroundColor: colors.surfaceContainerLowest },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.primary }]}>{title}</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
              <MaterialIcons name="close" size={24} color={colors.onSurfaceVariant} />
            </TouchableOpacity>
          </View>

          {/* Search Box */}
          <View
            style={[
              styles.searchBox,
              {
                borderColor: colors.outlineVariant,
                backgroundColor: colors.surfaceContainer,
              },
            ]}
          >
            <MaterialIcons name="search" size={20} color={colors.onSurfaceVariant} />
            <TextInput
              style={[styles.searchInput, { color: colors.onSurface }]}
              placeholder={t('searchPlaceholder')}
              placeholderTextColor={colors.onSurfaceVariant}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <MaterialIcons
                  name="cancel"
                  size={18}
                  color={colors.onSurfaceVariant}
                />
              </TouchableOpacity>
            )}
          </View>

          {/* List or Loader */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : (
            <FlatList
              data={filteredOptions}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => {
                const isSelected = selectedValue === item.name;
                return (
                  <TouchableOpacity
                    style={[
                      styles.optionRow,
                      { borderBottomColor: colors.outlineVariant },
                      isSelected && { backgroundColor: colors.surfaceContainerHigh },
                    ]}
                    onPress={() => {
                      onSelect(item);
                      handleClose();
                    }}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        { color: isSelected ? colors.primary : colors.onSurface },
                        isSelected && { fontWeight: '700' },
                      ]}
                    >
                      {item.name}
                    </Text>
                    {isSelected && (
                      <MaterialIcons name="check" size={20} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={[styles.emptyText, { color: colors.onSurfaceVariant }]}>
                    Sonuç bulunamadı.
                  </Text>
                </View>
              }
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

export default AddressSelectModal;
