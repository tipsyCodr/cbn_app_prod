import { View, Text, TouchableOpacity, TextInput, FlatList, Image, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import { SvgXml } from 'react-native-svg';
import { svgs } from '@/assets/constants/svgs';
import {getMembers, getWorldwideMembers, getCategories} from '@/utils/form-api';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {BASE_URL} from "@/utils/globals";

interface Member {
  id: number;
  name: string;
  company?: string;
  specialty?: string;
  profile_photo?: string | null;
  email?: string;
  mobile?: string;
  designation?: string;
  occupation?: string;
  category?: string;
    address?: string;
}

interface Category {
    id: number;
    name: string;
    value: string;
}

const TABS = [
  { key: 'chapter', label: 'CHAPTER ROSTER' },
  { key: 'worldwide', label: 'WORLDWIDE SEARCH' },
];

// Default categories in case API fails
const DEFAULT_CATEGORIES = [
    {id: 0, name: 'All Categories', value: ''},
    {id: 1, name: 'Finance', value: 'Finance'},
    {id: 2, name: 'Technology', value: 'Technology'},
    {id: 3, name: 'Marketing', value: 'Marketing'},
];

const Search = () => {
  const [activeTab, setActiveTab] = useState('chapter');
  const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [chapterMembers, setChapterMembers] = useState<Member[]>([]);
  const [worldwideMembers, setWorldwideMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
    const [categories, setCategories] = useState<Category[]>([
        {id: 0, name: 'All Categories', value: ''}
    ]);
    const [categoriesLoading, setCategoriesLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const loadChapterMembers = async () => {
      try {
        setLoading(true);
        const result = await getMembers();
        if (result.success && result.data) {
          setChapterMembers(result.data);
        } else {
          setError(result.message || 'Failed to load chapter members');
        }
      } catch (error) {
        console.error('Error loading chapter members:', error);
        setError('Failed to load chapter members');
      } finally {
        setLoading(false);
      }
    };

    loadChapterMembers();
  }, []);

  useEffect(() => {
    if (activeTab === 'worldwide') {
      const loadWorldwideMembers = async () => {
        try {
          setLoading(true);
          const result = await getWorldwideMembers();
          if (result.success && result.data) {
            setWorldwideMembers(result.data);
          } else {
            setError(result.message || 'Failed to load worldwide members');
          }
        } catch (error) {
          console.error('Error loading worldwide members:', error);
          setError('Failed to load worldwide members');
        } finally {
          setLoading(false);
        }
      };

      loadWorldwideMembers();
    }
  }, [activeTab]);

    useEffect(() => {
        if (activeTab === 'worldwide' && categories.length <= 1) {
            const fetchCategories = async () => {
                try {
                    setCategoriesLoading(true);
                    const result = await getCategories();
                    if (result.success && result.data && result.data.length > 0) {
                        // Add "All Categories" option at the beginning
                        const allCategoriesOption = {id: 0, name: 'All Categories', value: ''};
                        setCategories([
                            allCategoriesOption,
                            ...result.data.map((cat: any, index: number) => ({
                                id: index + 1,
                                name: typeof cat === 'string' ? cat : cat.name || 'Unknown',
                                value: typeof cat === 'string' ? cat : cat.name || ''
                            }))
                        ]);
                    } else {
                        console.log('Using default categories');
                        setCategories(DEFAULT_CATEGORIES);
                    }
                } catch (error) {
                    console.error('Error loading categories:', error);
                    setCategories(DEFAULT_CATEGORIES);
                } finally {
                    setCategoriesLoading(false);
        }
      };

        fetchCategories();
    }
  }, [activeTab]);

    const currentMembers = activeTab === 'chapter' ? chapterMembers : worldwideMembers;

    const filteredMembers = currentMembers.filter(member => {
        const matchesSearch =
      member.name.toLowerCase().includes(search.toLowerCase()) ||
      (member.specialty?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
        (member.company?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
        (member.address?.toLowerCase().includes(search.toLowerCase()) ?? false);

      if (activeTab === 'worldwide') {
          const matchesCategory = !category || member.category?.toLowerCase() === category.toLowerCase();
          const matchesCity = !city ||
              (member.address && member.address.toLowerCase().includes(city.toLowerCase()));
          const matchesState = !state ||
              (member.address && member.address.toLowerCase().includes(state.toLowerCase()));

        return matchesSearch && matchesCategory && matchesCity && matchesState;
    }

      return matchesSearch;
  });

    if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#042117" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
        <Text style={{ color: '#042117', textAlign: 'center' }}>{error}</Text>
        <TouchableOpacity
            onPress={() => setActiveTab('chapter')}
            style={{marginTop: 16, padding: 8, backgroundColor: '#042117', borderRadius: 4}}
        >
            <Text style={{color: '#fff'}}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#fff', paddingTop: 24 }}>
      {/* Tabs */}
      <View style={{ flexDirection: 'row', marginHorizontal: 16, borderRadius: 8, overflow: 'hidden', borderWidth: 1, borderColor: '#E0E0E0' }}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={{ flex: 1, backgroundColor: activeTab === tab.key ? '#042117' : '#fff', padding: 12, alignItems: 'center' }}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={{ color: activeTab === tab.key ? '#fff' : '#042117', fontWeight: 'bold' }}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Search Bar */}
      <View style={{ flexDirection: 'row', alignItems: 'center', margin: 16, backgroundColor: '#F5F5F5', borderRadius: 8, paddingHorizontal: 12 }}>
        <Ionicons name="search" size={20} color="#666" style={{ marginRight: 8 }} />
        <TextInput
          style={{ flex: 1, height: 40 }}
          placeholder={`Search ${activeTab === 'chapter' ? 'Chapter' : 'Worldwide'} by Name, Specialty...`}
          value={search}
          onChangeText={setSearch}
        />
      </View>

        {/* Worldwide Filter Form */}
        {activeTab === 'worldwide' && (
            <View style={{margin: 16, marginTop: 0, backgroundColor: '#F5F5F5', borderRadius: 8, padding: 12}}>
                <Text style={{fontWeight: 'bold', color: '#042117', marginBottom: 8}}>Worldwide Search Filters</Text>

            {/* Category Dropdown */}
            <View style={{marginBottom: 12}}>
                <Text style={{fontSize: 12, color: '#666', marginBottom: 4}}>Category</Text>
                <TouchableOpacity
                    style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        backgroundColor: '#fff',
                        borderRadius: 4,
                        padding: 10,
                        borderWidth: 1,
                        borderColor: '#E0E0E0'
                    }}
                    onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
                >
                    <Text>{category || 'All Categories'}</Text>
                    {categoriesLoading ? (
                        <ActivityIndicator size="small" color="#042117"/>
                    ) : (
                        <Ionicons name={showCategoryDropdown ? "chevron-up" : "chevron-down"} size={16} color="#666"/>
                    )}
                </TouchableOpacity>

              {showCategoryDropdown && (
                  <View style={{
                      backgroundColor: '#fff',
                      borderWidth: 1,
                      borderColor: '#E0E0E0',
                      borderRadius: 4,
                      marginTop: 4,
                      maxHeight: 200,
                  }}>
                      <FlatList
                          data={categories}
                          keyExtractor={(item) => item.id.toString()}
                          renderItem={({item}) => (
                              <TouchableOpacity
                                  style={{padding: 10}}
                                  onPress={() => {
                                      setCategory(item.value);
                                      setShowCategoryDropdown(false);
                      }}
                    >
                        <Text style={{color: category === item.value ? '#042117' : '#333'}}>
                            {item.name}
                        </Text>
                    </TouchableOpacity>
                  )}
                  style={{maxHeight: 200}}
                />
              </View>
            )}
          </View>

                {/* City Input */}
                <View style={{marginBottom: 12}}>
                    <Text style={{fontSize: 12, color: '#666', marginBottom: 4}}>City</Text>
                    <TextInput
                        style={{
                            backgroundColor: '#fff',
                            borderRadius: 4,
                            padding: 10,
                            borderWidth: 1,
                            borderColor: '#E0E0E0'
                        }}
                        placeholder="Enter city..."
                        value={city}
                        onChangeText={setCity}
                    />
          </View>

                {/* State Input */}
                <View style={{marginBottom: 12}}>
                    <Text style={{fontSize: 12, color: '#666', marginBottom: 4}}>State</Text>
                    <TextInput
                        style={{
                            backgroundColor: '#fff',
                            borderRadius: 4,
                            padding: 10,
                            borderWidth: 1,
                            borderColor: '#E0E0E0'
                        }}
                        placeholder="Enter state..."
                        value={state}
                        onChangeText={setState}
                    />
                </View>

                {/* Reset Filters Button */}
                <TouchableOpacity
                    style={{
                        alignSelf: 'flex-end',
                        marginTop: 12,
                        backgroundColor: '#042117',
                        paddingVertical: 8,
                        paddingHorizontal: 16,
                        borderRadius: 4
                    }}
                    onPress={() => {
                        setCategory('');
                        setCity('');
                        setState('');
                    }}
                >
                    <Text style={{color: '#fff', fontWeight: 'bold'}}>Reset Filters</Text>
                </TouchableOpacity>
        </View>
      )}

        {/* Member List */}
      <FlatList
        data={filteredMembers}
        keyExtractor={item => item.id?.toString() || Math.random().toString()}
        renderItem={({ item }) => (
            <TouchableOpacity
            onPress={() => router.push({
              pathname: "/member/[id]",
                params: {id: item.id?.toString() || ""}
            })}
            style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' }}
          >
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#E0E0E0', justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
              {item.profile_photo ? (
                  <Image
                      source={{uri: BASE_URL + "public/storage/" + item.profile_photo}}
                  style={{ width: 40, height: 40, borderRadius: 20 }}
                />
              ) : (
                  <Image
                      source={require('@/assets/icons/user-profile.png')}
                      style={{width: 32, height: 32, borderRadius: 16}}
                />
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#042117', fontWeight: 'bold' }}>{item.name}</Text>
              {item.specialty && (
                <Text style={{ color: '#444D5D', fontSize: 12 }}>{item.specialty}</Text>
              )}
              {item.company && (
                <Text style={{ color: '#444D5D', fontSize: 12 }}>{item.company}</Text>
              )}
                {activeTab === 'worldwide' && item.address && (
                    <Text style={{color: '#444D5D', fontSize: 12}}>{item.address}</Text>
                )}
            </View>
                <SvgXml xml={svgs.right} width='16' height='16'/>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingBottom: 24 }}
        ListEmptyComponent={
            <View style={{padding: 24, alignItems: 'center'}}>
                <Text style={{color: '#666', textAlign: 'center'}}>
                    {search || category || city || state ? 'No matching members found' : `No ${activeTab === 'chapter' ? 'chapter' : 'worldwide'} members available`}
            </Text>
          </View>
        }
      />
    </View>
  );
};

export default Search;