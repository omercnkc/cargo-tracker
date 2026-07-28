import React from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  useWindowDimensions
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../theme/colors';

const RECENT_SEARCHES = [
  {
    id: '1',
    trackingNumber: 'TRK-9876543210',
    details: 'DHL • Delivered Yesterday'
  },
  {
    id: '2',
    trackingNumber: 'PST-1122334455',
    details: 'FedEx • In Transit'
  }
];

export const SearchScreen = () => {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 768;

  return (
    <View style={styles.container}>
      {/* TopAppBar */}
      <View style={[styles.appBar, { paddingTop: insets.top }]}>
        <View style={styles.appBarContent}>
          <TouchableOpacity style={styles.iconButton}>
            <MaterialIcons name="menu" size={24} color={colors.onSurfaceVariant} />
          </TouchableOpacity>
          
          <Text style={styles.appBarTitle}>KargoTakip</Text>
          
          <TouchableOpacity style={styles.iconButton}>
            <MaterialIcons name="add" size={24} color={colors.onSurfaceVariant} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.mainContent,
          { paddingBottom: isLargeScreen ? 32 : insets.bottom + 96 }
        ]}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets={true}
      >
        {/* Search Section */}
        <View style={styles.searchSection}>
          <View style={styles.searchInputContainer}>
            <View style={styles.searchIconLeft}>
              <MaterialIcons name="search" size={24} color={colors.outline} />
            </View>
            <TextInput 
              style={styles.searchInput}
              placeholder="Enter tracking number..."
              placeholderTextColor={colors.outlineVariant}
              autoFocus={true}
              autoCapitalize="characters"
            />
            <View style={styles.searchIconRight}>
              <TouchableOpacity style={styles.searchSubmitButton}>
                <MaterialIcons name="arrow-forward" size={16} color={colors.onPrimary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Filters */}
          <View style={styles.filtersContainer}>
            <TouchableOpacity style={styles.filterChip} activeOpacity={0.7}>
              <MaterialIcons name="calendar-month" size={16} color={colors.onSurfaceVariant} />
              <Text style={styles.filterChipText}>By Date</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.filterChip} activeOpacity={0.7}>
              <MaterialIcons name="domain" size={16} color={colors.onSurfaceVariant} />
              <Text style={styles.filterChipText}>By Company</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.filterChip} activeOpacity={0.7}>
              <MaterialIcons name="check-circle" size={16} color={colors.onSurfaceVariant} />
              <Text style={styles.filterChipText}>By Status</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Searches */}
        <View style={styles.recentSection}>
          <Text style={styles.sectionTitle}>Recent Searches</Text>
          
          <View style={styles.recentList}>
            {RECENT_SEARCHES.map(item => (
              <TouchableOpacity key={item.id} style={styles.recentItem} activeOpacity={0.7}>
                <View style={styles.recentItemLeft}>
                  <View style={styles.recentIconContainer}>
                    <MaterialIcons name="history" size={20} color={colors.primary} />
                  </View>
                  <View>
                    <Text style={styles.recentTrackingNumber}>{item.trackingNumber}</Text>
                    <Text style={styles.recentDetails}>{item.details}</Text>
                  </View>
                </View>
                <MaterialIcons name="chevron-right" size={24} color={colors.outline} />
              </TouchableOpacity>
            ))}
          </View>
          
          {/* Example Empty State (Hidden in logic normally if there are recents) */}
          {RECENT_SEARCHES.length === 0 && (
            <View style={styles.emptyState}>
              <MaterialIcons name="search-off" size={36} color={colors.outline} style={styles.emptyIcon} />
              <Text style={styles.emptyTitle}>No recent searches found.</Text>
              <Text style={styles.emptySubtitle}>Enter a tracking number above to begin.</Text>
            </View>
          )}
        </View>
      </ScrollView>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  appBar: {
    backgroundColor: colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    zIndex: 40,
  },
  appBarContent: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    maxWidth: 768,
    width: '100%',
    alignSelf: 'center',
  },
  appBarTitle: {
    fontFamily: 'Inter',
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
  },
  iconButton: {
    padding: 8,
    borderRadius: 999,
  },
  mainContent: {
    paddingHorizontal: 16, // margin-mobile
    paddingTop: 32, // py-8
    maxWidth: 768, // max-w-screen-md
    alignSelf: 'center',
    width: '100%',
  },
  searchSection: {
    marginBottom: 32,
  },
  searchInputContainer: {
    position: 'relative',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIconLeft: {
    position: 'absolute',
    left: 16,
    zIndex: 10,
  },
  searchInput: {
    fontFamily: 'Inter',
    fontSize: 16,
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: 12,
    height: 64,
    paddingLeft: 48,
    paddingRight: 64,
    color: colors.onSurface,
  },
  searchIconRight: {
    position: 'absolute',
    right: 16,
    zIndex: 10,
  },
  searchSubmitButton: {
    backgroundColor: colors.primary,
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  filtersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: 999,
  },
  filterChipText: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.6,
    color: colors.onSurfaceVariant,
  },
  recentSection: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    padding: 24, // container-padding
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionTitle: {
    fontFamily: 'Inter',
    fontSize: 20, // headline-md
    fontWeight: '600',
    color: colors.onBackground,
    marginBottom: 24,
  },
  recentList: {
    gap: 16,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent', // Will show on hover in web, but RN doesn't have hover easily
  },
  recentItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  recentIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recentTrackingNumber: {
    fontFamily: 'Courier Prime',
    fontSize: 14,
    color: colors.onSurface,
  },
  recentDetails: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.6,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    opacity: 0.5,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '600',
    color: colors.onSurfaceVariant,
  },
  emptySubtitle: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: colors.outline,
    marginTop: 8,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.outlineVariant + '4D',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 8,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
    zIndex: 50,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 16,
  },
  navItemActive: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 16,
    backgroundColor: colors.primaryContainer,
    borderRadius: 999,
  },
  navText: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.6,
    color: colors.onSurfaceVariant,
    marginTop: 4,
  },
  navTextActive: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.6,
    color: colors.onPrimaryContainer,
    marginTop: 4,
  },
});

export default SearchScreen;
