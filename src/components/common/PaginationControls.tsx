import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme/useTheme';
import { useTranslation } from '../../hooks/useTranslation';
import { hapticService } from '../../services/haptics.service';
import { styles } from './PaginationControls.styles';

export interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage?: number;
  onPageChange: (page: number) => void;
  itemLabel?: string;
  showInfoText?: boolean;
}

export const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage = 5,
  onPageChange,
  itemLabel,
  showInfoText = true,
}) => {
  const { theme: colors } = useTheme();
  const { t } = useTranslation();

  if (totalPages <= 1 && totalItems <= itemsPerPage) {
    return null;
  }

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate page pills (with smart windowing if > 5 pages)
  const getPageNumbers = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 3) {
      return [1, 2, 3, 4, totalPages];
    }
    if (currentPage >= totalPages - 2) {
      return [1, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, currentPage - 1, currentPage, currentPage + 1, totalPages];
  };

  const pageNumbers = getPageNumbers();

  const handlePageSelect = (page: number) => {
    if (page === currentPage) return;
    hapticService.selection();
    onPageChange(page);
  };

  const handlePrev = () => {
    if (currentPage > 1) {
      handlePageSelect(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      handlePageSelect(currentPage + 1);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.paginationWrapper}>
        {/* Previous Page Button */}
        <TouchableOpacity
          style={[
            styles.paginationBtn,
            {
              backgroundColor: colors.surfaceContainerLowest,
              borderColor: colors.outlineVariant,
            },
            currentPage === 1 && styles.paginationBtnDisabled,
          ]}
          disabled={currentPage === 1}
          onPress={handlePrev}
          activeOpacity={0.7}
        >
          <MaterialIcons
            name="chevron-left"
            size={20}
            color={currentPage === 1 ? colors.outline : colors.primary}
          />
          <Text
            style={[
              styles.paginationBtnText,
              { color: currentPage === 1 ? colors.outline : colors.primary },
            ]}
          >
            {t('previous') || 'Önceki'}
          </Text>
        </TouchableOpacity>

        {/* Page Pills */}
        <View style={styles.paginationPagesRow}>
          {pageNumbers.map((pageNum, idx) => {
            const isActive = currentPage === pageNum;
            return (
              <TouchableOpacity
                key={`${pageNum}-${idx}`}
                style={[
                  styles.paginationPagePill,
                  {
                    borderColor: isActive ? colors.primary : colors.outlineVariant,
                    backgroundColor: isActive
                      ? colors.primary
                      : colors.surfaceContainerLowest,
                  },
                ]}
                onPress={() => handlePageSelect(pageNum)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.paginationPagePillText,
                    { color: isActive ? colors.onPrimary : colors.onSurface },
                  ]}
                >
                  {pageNum}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Next Page Button */}
        <TouchableOpacity
          style={[
            styles.paginationBtn,
            {
              backgroundColor: colors.surfaceContainerLowest,
              borderColor: colors.outlineVariant,
            },
            currentPage === totalPages && styles.paginationBtnDisabled,
          ]}
          disabled={currentPage === totalPages}
          onPress={handleNext}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.paginationBtnText,
              { color: currentPage === totalPages ? colors.outline : colors.primary },
            ]}
          >
            {t('next') || 'Sonraki'}
          </Text>
          <MaterialIcons
            name="chevron-right"
            size={20}
            color={currentPage === totalPages ? colors.outline : colors.primary}
          />
        </TouchableOpacity>
      </View>

      {/* Info Subtext */}
      {showInfoText && (
        <Text style={[styles.paginationInfoText, { color: colors.onSurfaceVariant }]}>
          {`${startItem} - ${endItem} / ${totalItems} ${
            itemLabel || t('showingShipments') || 'kargo gösteriliyor'
          }`}
        </Text>
      )}
    </View>
  );
};
