import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Animated,
  PanResponder,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme/useTheme';
import { useTranslation } from '../../hooks/useTranslation';
import useResponsive from '../../hooks/useResponsive';
import { usePagination } from '../../hooks/usePagination';
import { PaginationControls } from '../common/PaginationControls';
import { PackageCard } from './PackageCard';
import { DisplayPackage } from '../../mock/fallbackPackages';
import { hapticService } from '../../services/haptics.service';
import { styles } from './AllPackagesBottomSheet.styles';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface AllPackagesBottomSheetProps {
  visible: boolean;
  packages: DisplayPackage[];
  onClose: () => void;
  onSelectPackage: (pkg: DisplayPackage) => void;
}

export const AllPackagesBottomSheet: React.FC<AllPackagesBottomSheetProps> = ({
  visible,
  packages,
  onClose,
  onSelectPackage,
}) => {
  const { theme: colors } = useTheme();
  const { t } = useTranslation();
  const { isLargeScreen } = useResponsive();
  const [searchQuery, setSearchQuery] = useState('');

  const panY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  const closeWithAnimation = () => {
    Animated.timing(panY, {
      toValue: SCREEN_HEIGHT,
      duration: 220,
      useNativeDriver: true,
    }).start(() => {
      setSearchQuery('');
      onClose();
    });
  };

  useEffect(() => {
    if (visible) {
      panY.setValue(SCREEN_HEIGHT);
      Animated.spring(panY, {
        toValue: 0,
        damping: 25,
        mass: 0.8,
        stiffness: 220,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 5,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          panY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 120 || gestureState.vy > 0.5) {
          closeWithAnimation();
        } else {
          Animated.spring(panY, {
            toValue: 0,
            damping: 22,
            stiffness: 240,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  // Filter packages by search query
  const filteredPackages = useMemo(() => {
    if (!searchQuery.trim()) return packages;
    const query = searchQuery.trim().toLowerCase();
    return packages.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.code.toLowerCase().includes(query)
    );
  }, [packages, searchQuery]);

  // Reusable 5-item Lazy Pagination (DRY)
  const {
    currentPage,
    totalPages,
    totalItems,
    paginatedItems,
    setCurrentPage,
    resetPage,
  } = usePagination(filteredPackages, { itemsPerPage: 5 });

  // Reset page when search query changes
  useEffect(() => {
    resetPage();
  }, [searchQuery, resetPage]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={closeWithAnimation}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={styles.backdropTouchable}
          activeOpacity={1}
          onPress={closeWithAnimation}
        />

        <Animated.View
          style={[
            styles.bottomSheetContainer,
            {
              backgroundColor: colors.surfaceContainerLowest,
              borderColor: colors.outlineVariant,
              transform: [{ translateY: panY }],
            },
          ]}
        >
          {/* Gesture Drag Handle */}
          <View style={styles.dragHandleArea} {...panResponder.panHandlers}>
            <View style={styles.dragHandleBar} />
          </View>

          {/* Header */}
          <View style={styles.sheetHeader}>
            <View style={styles.sheetHeaderLeft}>
              <MaterialIcons name="inventory-2" size={22} color={colors.primary} />
              <Text style={[styles.sheetTitle, { color: colors.primary }]}>
                {t('allPackagesTitle')}
              </Text>
              <View
                style={[
                  styles.countBadge,
                  { backgroundColor: colors.primary },
                ]}
              >
                <Text
                  style={[
                    styles.countBadgeText,
                    { color: colors.onPrimary },
                  ]}
                >
                  {packages.length}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.closeBtn,
                { backgroundColor: colors.surfaceContainer },
              ]}
              onPress={closeWithAnimation}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <MaterialIcons name="close" size={20} color={colors.onSurfaceVariant} />
            </TouchableOpacity>
          </View>

          {/* Search Bar inside Drawer */}
          <View
            style={[
              styles.searchBarContainer,
              {
                backgroundColor: colors.surfaceContainer,
                borderColor: colors.outlineVariant,
              },
            ]}
          >
            <MaterialIcons name="search" size={20} color={colors.onSurfaceVariant} />
            <TextInput
              style={[styles.searchInput, { color: colors.onSurface }]}
              placeholder={t('searchPlaceholderPackage')}
              placeholderTextColor={colors.onSurfaceVariant}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCorrect={false}
              autoCapitalize="none"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                style={styles.clearSearchBtn}
              >
                <MaterialIcons name="cancel" size={18} color={colors.onSurfaceVariant} />
              </TouchableOpacity>
            )}
          </View>

          {/* Content List */}
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContentContainer}
            keyboardShouldPersistTaps="handled"
          >
            {filteredPackages.length === 0 ? (
              <View style={styles.emptyContainer}>
                <MaterialIcons
                  name="search-off"
                  size={44}
                  color={colors.onSurfaceVariant}
                />
                <Text style={[styles.emptyTitle, { color: colors.onSurface }]}>
                  {t('noPackagesFound')}
                </Text>
                <Text
                  style={[styles.emptySubtitle, { color: colors.onSurfaceVariant }]}
                >
                  {t('noPackagesFoundSub')}
                </Text>
              </View>
            ) : (
              paginatedItems.map((item: DisplayPackage) => (
                <PackageCard
                  key={item.id}
                  id={item.id}
                  name={item.name}
                  code={item.code}
                  status={item.status}
                  icon={item.icon}
                  isLargeScreen={isLargeScreen}
                  onPress={() => {
                    hapticService.buttonPress();
                    closeWithAnimation();
                    onSelectPackage(item);
                  }}
                />
              ))
            )}
          </ScrollView>

          {/* Pinned Bottom Pagination Footer (Fixed at the bottom of the screen) */}
          {filteredPackages.length > 0 && totalPages > 1 && (
            <View
              style={[
                styles.sheetFooter,
                {
                  borderTopColor: colors.outlineVariant,
                  backgroundColor: colors.surfaceContainerLowest,
                },
              ]}
            >
              <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                itemsPerPage={5}
                onPageChange={setCurrentPage}
                itemLabel={t('showingShipments')}
              />
            </View>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
};
