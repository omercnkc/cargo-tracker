import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  FlatList,
  useWindowDimensions
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import { useTheme } from '../theme/useTheme';
import { useTranslation } from '../hooks/useTranslation';
import { useAuthStore } from '../store/auth.store';
import { useShipments } from '../features/shipment/hooks/useShipments';
import { PackageCard } from '../components/home/PackageCard';
import HeaderRightActions from '../components/common/HeaderRightActions';

export const SearchScreen = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 768;

  const { theme: colors } = useTheme();
  const { t } = useTranslation();
  const user = useAuthStore(state => state.user);
  
  const { data: shipments, isLoading } = useShipments(user?.id);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredShipments = useMemo(() => {
    if (!shipments) return [];
    if (!searchQuery.trim()) return shipments;
    
    const query = searchQuery.toLowerCase().trim();
    return shipments.filter(s => 
      s.tracking_number.toLowerCase().includes(query) ||
      (s.title && s.title.toLowerCase().includes(query)) ||
      (s.courier_companies?.name && s.courier_companies.name.toLowerCase().includes(query))
    );
  }, [shipments, searchQuery]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* TopAppBar */}
      <View style={[styles.appBar, { paddingTop: insets.top, backgroundColor: colors.surface }]}>
        <View style={styles.appBarContent}>
          <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          
          <Text style={[styles.appBarTitle, { color: colors.primary }]}>{t('searchTitle')}</Text>
          
          <View style={{ width: 40 }} />
        </View>
      </View>

      <View style={styles.mainContent}>
        {/* Search Input Bar */}
        <View style={styles.searchSection}>
          <View style={[styles.searchInputContainer, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outlineVariant }]}>
            <View style={styles.searchIconLeft}>
              <MaterialIcons name="search" size={24} color={colors.outline} />
            </View>
            <TextInput 
              style={[styles.searchInput, { color: colors.onSurface }]}
              placeholder={t('searchPlaceholder')}
              placeholderTextColor={colors.outlineVariant}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus={true}
              autoCapitalize="characters"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity style={styles.clearBtn} onPress={() => setSearchQuery('')}>
                <MaterialIcons name="close" size={20} color={colors.outline} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Results List */}
        <FlatList
          data={filteredShipments}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: isLargeScreen ? 32 : insets.bottom + 96, paddingTop: 16 }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialIcons name="search-off" size={48} color={colors.outlineVariant} />
              <Text style={[styles.emptyText, { color: colors.onSurface }]}>{t('noResults')}</Text>
            </View>
          }
          renderItem={({ item }) => (
            <PackageCard
              id={item.id}
              name={item.courier_companies?.name || item.title || 'Kargo'}
              code={item.tracking_number}
              status={(item.current_status === 'delivered' ? 'delivered' : item.current_status === 'pending' ? 'pending' : 'transit') as any}
              icon="local-shipping"
              isLargeScreen={isLargeScreen}
              onPress={() => navigation.navigate('PackageDetail', { id: item.id })}
            />
          )}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  appBar: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(197, 197, 211, 0.3)',
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
    width: '100%',
  },
  appBarTitle: {
    fontFamily: 'Inter',
    fontSize: 20,
    fontWeight: '700',
  },
  iconButton: {
    padding: 8,
    borderRadius: 999,
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 16,
    maxWidth: 896,
    width: '100%',
    alignSelf: 'center',
  },
  searchSection: {
    paddingTop: 16,
    paddingBottom: 8,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  searchIconLeft: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Inter',
    fontSize: 16,
  },
  clearBtn: {
    padding: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontFamily: 'Inter',
    fontSize: 16,
    marginTop: 12,
  },
});

export default SearchScreen;
