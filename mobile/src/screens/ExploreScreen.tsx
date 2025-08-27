import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Mock data - using the same structure as MockProfiles.json (ML scores will be calculated by backend)
const mockProfiles = [
  {
    id: 1,
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRVv3z-qdrQcOLy1SDW3Y0abdEQsgHW_Bu23A&s",
    name: "Alice",
    age: 30,
    gender: "Female",
    location: {
      city: "New York",
      state: "NY",
      country: "United States",
      zip_code: "11004"
    },
    level: "Beginner",
    workout_preferences: ["Running", "Swimming"],
    bio: "Just somebody looking for a workout partner.",
  },
  {
    id: 2,
    image: "https://images.pexels.com/photos/39866/entrepreneur-startup-start-up-man-39866.jpeg",
    name: "John",
    age: 22,
    gender: "Male",
    location: {
      city: "Boston",
      state: "MA",
      country: "United States",
      zip_code: "02108"
    },
    level: "Advanced",
    workout_preferences: ["Running", "Cycling"],
    bio: "I like running and biking!",
  },
  {
    id: 3,
    image: "https://freerangestock.com/sample/152938/a-group-of-people-with-backpacks.jpg",
    name: "Bob",
    age: 32,
    gender: "Male",
    location: {
      city: "Boston",
      state: "MA",
      country: "United States",
      zip_code: "02109"
    },
    level: "Beginner",
    workout_preferences: ["Hiking", "Swimming"],
    bio: "I'm a swimmer.",
  },
  {
    id: 4,
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTAYJuwFoYWYcTT6lgqunl9JdSzWQNU-j40CQ&s",
    name: "Jane",
    age: 26,
    gender: "Female",
    location: {
      city: "New York",
      state: "NY",
      country: "United States",
      zip_code: "11004"
    },
    level: "Advanced",
    workout_preferences: ["CrossFit", "Jogging"],
    bio: "I'm an athlete in NY.",
  },
  {
    id: 5,
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQHIDGbMRABFFP6z6hBQClQmMKA1QqjqhNYRw&s",
    name: "Michael",
    age: 30,
    gender: "Male",
    location: {
      city: "New York",
      state: "NY",
      country: "United States",
      zip_code: "11004"
    },
    level: "Beginner",
    workout_preferences: ["Walking"],
    bio: "Love to take walks around New York.",
  },
  {
    id: 6,
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRgBeOKmbfE8VBojClOCyg73bVh-1BWHQWlww&s",
    name: "Julie",
    age: 20,
    gender: "Female",
    location: {
      city: "Amherst",
      state: "MA",
      country: "United States",
      zip_code: "01002"
    },
    level: "Intermediate",
    workout_preferences: ["Running", "Swimming"],
    bio: "I like running and swimming",
  },
  {
    id: 7,
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQlY1Kd3aC7BqbPsYM0CO4Tm640xeRpmWvgtA&s",
    name: "Alex",
    age: 28,
    gender: "Male",
    location: {
      city: "San Francisco",
      state: "CA",
      country: "United States",
      zip_code: "94102"
    },
    level: "Intermediate",
    workout_preferences: ["Yoga", "Hiking", "Cycling"],
    bio: "Tech worker who loves outdoor activities and yoga.",
  },
  {
    id: 8,
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRgBeOKmbfE8VBojClOCyg73bVh-1BWHQWlww&s",
    name: "Maria",
    age: 24,
    gender: "Female",
    location: {
      city: "Miami",
      state: "FL",
      country: "United States",
      zip_code: "33101"
    },
    level: "Advanced",
    workout_preferences: ["Dancing", "Swimming", "Pilates"],
    bio: "Professional dancer and fitness instructor.",
  }
];

interface Profile {
  id: number;
  image: string;
  name: string;
  age: number;
  gender: string;
  location: {
    city: string;
    state: string;
    country: string;
    zip_code: string;
  };
  level: string;
  workout_preferences: string[];
  bio: string;
  matchingScore?: number; // Optional since it's added by ML backend
}

interface Filters {
  levels: string[];
  genders: string[];
  workoutTypes: string[];
  maxDistance: number | null;
}

export default function ExploreScreen({ navigation }: any) {
  const [profiles, setProfiles] = useState<Profile[]>(mockProfiles);
  const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>(mockProfiles);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    levels: [],
    genders: [],
    workoutTypes: [],
    maxDistance: null,
  });

  const levels = ['Beginner', 'Intermediate', 'Advanced'];
  const genders = ['Male', 'Female', 'Nonbinary'];
  const workoutTypes = [
    'Running', 'Swimming', 'Cycling', 'Hiking', 'Yoga', 'Weightlifting',
    'CrossFit', 'Pilates', 'Boxing', 'Dancing', 'HIIT'
  ];

  // Get ML-ranked profiles from backend
  const getMLRankedProfiles = async (filteredProfiles: Profile[]) => {
    try {
      // Create current user profile for ML matching based on current filters
      const currentUser = {
        id: 0,
        name: "Current User",
        age: 25,
        image: "",
        bio: "",
        level: filters.levels.length === 1 ? filters.levels[0] : "Beginner",
        gender: filters.genders.length === 1 ? filters.genders[0] : "Male",
        location: {
          city: null,
          state: null,
          country: "United States",
          zip_code: "10001"
        },
        workout_preferences: filters.workoutTypes.length > 0 ? filters.workoutTypes : []
      };

      const matchRequest = {
        current_user: currentUser,
        all_users: filteredProfiles,
        top_k: filteredProfiles.length
      };

      console.log('Sending ML request:', matchRequest);

      const response = await fetch('http://127.0.0.1:8000/match', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(matchRequest)
      });

      if (!response.ok) {
        throw new Error('ML matching failed');
      }

      const data = await response.json();
      console.log('ML matching response:', data);
      
      // Return profiles with their ML scores
      if (data.matches) {
        return data.matches.map((m: any) => ({
          ...m.profile,
          matchingScore: m.score
        }));
      } else {
        // Fallback: return profiles with default scores
        return filteredProfiles.map(profile => ({
          ...profile,
          matchingScore: 0.5
        }));
      }
    } catch (error) {
      console.error('ML matching error, using filtered profiles:', error);
      // Fallback: return profiles with default scores
      return filteredProfiles.map(profile => ({
        ...profile,
        matchingScore: 0.5
      }));
    }
  };

  // Get filtered profiles based on current filters
  const getFilteredProfiles = () => {
    return mockProfiles.filter(profile => {
      // Filter by level - if levels array is empty, show all levels
      if (filters.levels.length > 0 && !filters.levels.includes(profile.level)) {
        return false;
      }
      
      // Filter by gender - if genders array is empty, show all genders
      if (filters.genders.length > 0 && !filters.genders.includes(profile.gender)) {
        return false;
      }
      
      // Filter by workout preferences - if workoutTypes array is empty, show all workouts
      if (filters.workoutTypes.length > 0 && !filters.workoutTypes.some((w: string) => profile.workout_preferences.includes(w))) {
        return false;
      }
      
      return true;
    });
  };

  useEffect(() => {
    const updateProfiles = async () => {
      // First apply basic filters
      const filteredProfiles = getFilteredProfiles();
      
      // Then get ML ranking if we have profiles to rank
      if (filteredProfiles.length > 0) {
        const mlRankedProfiles = await getMLRankedProfiles(filteredProfiles);
        
        // Sort by ML score (highest first)
        const sortedByML = mlRankedProfiles.sort((a, b) => b.matchingScore - a.matchingScore);
        setFilteredProfiles(sortedByML);
      } else {
        setFilteredProfiles([]);
      }
    };

    updateProfiles();
  }, [filters]);

  const toggleFilter = (category: keyof Filters, value: string) => {
    setFilters(prev => {
      const currentArray = prev[category] as string[];
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value];
      
      return {
        ...prev,
        [category]: newArray,
      };
    });
  };

  const clearAllFilters = () => {
    setFilters({
      levels: [],
      genders: [],
      workoutTypes: [],
      maxDistance: null,
    });
  };

  const renderProfileCard = ({ item }: { item: Profile }) => (
    <TouchableOpacity
      style={styles.profileCard}
      onPress={() => {
        console.log('Profile pressed:', item.name, 'ID:', item.id);
        navigation.navigate('ProfileDetail', { profileId: item.id });
      }}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.profileName}>{item.name}</Text>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>{(item.matchingScore * 100).toFixed(0)}%</Text>
          <Text style={styles.scoreLabel}>Match</Text>
        </View>
      </View>
      
      <View style={styles.cardBody}>
        <Text style={styles.cardText}>{item.age} • {item.gender} • {item.level}</Text>
        <Text style={styles.cardText}>{item.location.city}</Text>
        <Text style={styles.bioText} numberOfLines={2}>{item.bio}</Text>
        
        <View style={styles.workoutContainer}>
          {item.workout_preferences.slice(0, 3).map((workout, index) => (
            <View key={index} style={styles.workoutTag}>
              <Text style={styles.workoutText}>{workout}</Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderFilterSection = () => (
    <View style={styles.filterSection}>
      <View style={styles.filterHeader}>
        <Text style={styles.filterTitle}>Filters</Text>
        <TouchableOpacity onPress={clearAllFilters}>
          <Text style={styles.clearButton}>Clear All</Text>
        </TouchableOpacity>
      </View>

      {/* Level Filter */}
      <View style={styles.filterGroup}>
        <Text style={styles.filterLabel}>Level</Text>
        <View style={styles.filterOptions}>
          {levels.map(level => (
            <TouchableOpacity
              key={level}
              style={[
                styles.filterOption,
                filters.levels.includes(level) && styles.filterOptionSelected
              ]}
              onPress={() => toggleFilter('levels', level)}
            >
              <Text style={[
                styles.filterOptionText,
                filters.levels.includes(level) && styles.filterOptionTextSelected
              ]}>
                {level}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Gender Filter */}
      <View style={styles.filterGroup}>
        <Text style={styles.filterLabel}>Gender</Text>
        <View style={styles.filterOptions}>
          {genders.map(gender => (
            <TouchableOpacity
              key={gender}
              style={[
                styles.filterOption,
                filters.genders.includes(gender) && styles.filterOptionSelected
              ]}
              onPress={() => toggleFilter('genders', gender)}
            >
              <Text style={[
                styles.filterOptionText,
                filters.genders.includes(gender) && styles.filterOptionTextSelected
              ]}>
                {gender}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Workout Types Filter */}
      <View style={styles.filterGroup}>
        <Text style={styles.filterLabel}>Workout Types</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filterOptions}>
            {workoutTypes.map(workout => (
              <TouchableOpacity
                key={workout}
                style={[
                  styles.filterOption,
                  filters.workoutTypes.includes(workout) && styles.filterOptionSelected
                ]}
                onPress={() => toggleFilter('workoutTypes', workout)}
              >
                <Text style={[
                  styles.filterOptionText,
                  filters.workoutTypes.includes(workout) && styles.filterOptionTextSelected
                ]}>
                  {workout}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Text style={styles.filterButtonText}>Filters</Text>
        </TouchableOpacity>
        
        {/* Debug Navigation Button */}
        <TouchableOpacity
          style={[styles.filterButton, { marginLeft: 10 }]}
          onPress={() => {
            console.log('Debug: Navigating to ProfileDetail');
            navigation.navigate('ProfileDetail', { profileId: 1 });
          }}
        >
          <Text style={styles.filterButtonText}>Test Nav</Text>
        </TouchableOpacity>
      </View>

      {showFilters && renderFilterSection()}

      <FlatList
        data={filteredProfiles}
        renderItem={renderProfileCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.profileList}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  filterButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  filterSection: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  clearButton: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '600',
  },
  filterGroup: {
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  filterOptionSelected: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  filterOptionText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  filterOptionTextSelected: {
    color: '#ffffff',
  },
  profileList: {
    padding: 16,
  },
  profileCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  scoreContainer: {
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  scoreLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  cardBody: {
    gap: 8,
  },
  cardText: {
    fontSize: 16,
    color: '#374151',
  },
  bioText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  workoutContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  workoutTag: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  workoutText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
});
