import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
  matchingScore?: number;
}

export default function ProfileDetailScreen({ route, navigation }: any) {
  const { profileId } = route.params;

  // Mock profile data - using the same structure as MockProfiles.json
  const allProfiles: { [key: number]: Profile } = {
    1: {
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
      matchingScore: 0.85,
    },
    2: {
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
      matchingScore: 0.72,
    },
    3: {
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
      matchingScore: 0.68,
    },
    4: {
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
      matchingScore: 0.79,
    },
    5: {
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
      matchingScore: 0.58,
    },
    6: {
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
      matchingScore: 0.71,
    },
    7: {
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
      matchingScore: 0.65,
    },
    8: {
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
      matchingScore: 0.63,
    }
  };

  // Get the profile based on the ID passed in
  const profile = allProfiles[profileId as keyof typeof allProfiles] || allProfiles[1];

  console.log('ProfileDetailScreen: Showing profile for ID:', profileId, 'Name:', profile.name);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{profile.name[0]}</Text>
            </View>
          </View>
          
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{profile.name}</Text>
            <Text style={styles.profileDetails}>{profile.age} • {profile.gender} • {profile.level}</Text>
            <Text style={styles.profileLocation}>{profile.location.city}</Text>
          </View>

          <View style={styles.scoreContainer}>
            <Text style={styles.scoreText}>{(profile.matchingScore || 0) * 100}%</Text>
            <Text style={styles.scoreLabel}>Match</Text>
          </View>
        </View>

        {/* Bio Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.bioText}>{profile.bio}</Text>
        </View>

        {/* Workout Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Workout Preferences</Text>
          <View style={styles.workoutContainer}>
            {profile.workout_preferences.map((workout, index) => (
              <View key={index} style={styles.workoutTag}>
                <Text style={styles.workoutText}>{workout}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity style={styles.messageButton}>
            <Text style={styles.messageButtonText}>💬 Send Message</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.connectButton}>
            <Text style={styles.connectButtonText}>❤️ Connect</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    padding: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  profileDetails: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 4,
  },
  profileLocation: {
    fontSize: 16,
    color: '#6b7280',
  },
  scoreContainer: {
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  scoreLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  section: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  bioText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  workoutContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  workoutTag: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  workoutText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  actionContainer: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 20,
  },
  messageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  messageButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  connectButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#3b82f6',
    gap: 8,
  },
  connectButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3b82f6',
  },
});
