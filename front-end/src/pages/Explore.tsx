import { useState, useEffect } from 'react';
import NavBar from '../components/NavBar.tsx';
import ProfileCard from '../components/ProfileCard.tsx';
import FilterBar from '../components/FilterBar.tsx';
import { filterProfiles, sortProfiles, SortOption } from '../utils/ProfileUtils.ts';
import profileData from '../mockData/MockProfiles.ts';
import { ProfileModel } from '../data/ProfileModel.ts';

interface FilterState {
  levels: string[];
  genders: string[];
  workoutTypes: string[];
  maxDistance: number | null;
  zipCode: string;
}

function Explore() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [profiles, setProfiles] = useState<ProfileModel[]>(profileData);
  const [profilesWithScores, setProfilesWithScores] = useState<Array<{profile: ProfileModel, score: number}>>([]);
  const [sortOption, setSortOption] = useState<SortOption>(() => {
    return (localStorage.getItem('sortOption') as SortOption) || 'ml-score';
  });
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState<FilterState>(() => {
    const saved = localStorage.getItem('filters');
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      levels: [], // Empty array = show all levels
      genders: [], // Empty array = show all genders
      workoutTypes: [], // Empty array = show all workout types
      maxDistance: 100, // Default: 100km max distance
      zipCode: '10001' // Default: New York zip code (Manhattan)
    };
  });

  const toggleFilter = () => {
    setIsFilterOpen((prev) => !prev);
  };

  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newSortOption = event.target.value as SortOption;
    setSortOption(newSortOption);
    localStorage.setItem('sortOption', newSortOption);
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  // Calculate distance between two zip codes (better approximation for US zip codes)
  const calculateDistance = (zip1: string, zip2: string): number => {
    // This is a better approximation for US zip codes
    // US zip codes have geographic meaning - first 3 digits often indicate region
    
    // Extract first 3 digits (major region)
    const region1 = parseInt(zip1.substring(0, 3));
    const region2 = parseInt(zip2.substring(0, 3));
    
    if (isNaN(region1) || isNaN(region2)) {
      return 999; // Return high distance if zip codes can't be parsed
    }
    
    // Calculate distance based on region difference
    const regionDiff = Math.abs(region1 - region2);
    
    // Rough distance mapping:
    // Same region (0-2): 0-10 km
    // Adjacent regions (3-10): 10-50 km  
    // Nearby regions (11-50): 50-200 km
    // Far regions (51+): 200+ km
    
    if (regionDiff <= 2) return regionDiff * 5; // 0-10 km
    if (regionDiff <= 10) return 10 + (regionDiff - 3) * 5; // 10-50 km
    if (regionDiff <= 50) return 50 + (regionDiff - 11) * 4; // 50-200 km
    return 200 + (regionDiff - 51) * 10; // 200+ km
  };

  // Get filtered profiles based on current filters
  const getFilteredProfiles = () => {
    return profileData.filter(profile => {
      // Filter by level - if levels array is empty, show all levels
      if (filters.levels.length > 0 && !filters.levels.includes(profile.level)) {
        return false;
      }
      
      // Filter by gender - if genders array is empty, show all genders
      if (filters.genders.length > 0 && !filters.genders.includes(profile.gender)) {
        return false;
      }
      
      // Filter by workout preferences - if workoutTypes array is empty, show all workouts
      if (filters.workoutTypes.length > 0 && !filters.workoutTypes.some((w: string) => profile.workout_preferences.includes(w as any))) {
        return false;
      }
      
      // Filter by distance if zip code and max distance are set
      if (filters.zipCode && filters.maxDistance && profile.location.zip_code) {
        const distance = calculateDistance(filters.zipCode, profile.location.zip_code);
        console.log(`Distance from ${filters.zipCode} to ${profile.location.zip_code}: ${distance}km (max: ${filters.maxDistance}km)`);
        if (distance > filters.maxDistance) {
          console.log(`Filtering out ${profile.name} - too far`);
          return false;
        }
      }
      
      return true;
    });
  };

  // Get ML-ranked profiles from backend
  const getMLRankedProfiles = async (filteredProfiles: ProfileModel[]) => {
    try {
      // Create current user profile for ML matching
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
          zip_code: filters.zipCode
        },
        workout_preferences: filters.workoutTypes.length < 18 ? filters.workoutTypes : []
      };

      const matchRequest = {
        current_user: currentUser,
        all_users: filteredProfiles,
        top_k: filteredProfiles.length // Get all profiles ranked
      };

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
      
      // Return profiles with their scores
      if (data.matches) {
        return data.matches.map((m: any) => ({
          profile: m.profile,
          score: m.score
        }));
      } else {
        // Fallback: return profiles with default scores
        return filteredProfiles.map(profile => ({
          profile: profile,
          score: 0.5 // Default score
        }));
      }
    } catch (error) {
      console.error('ML matching error, using filtered profiles:', error);
      // Fallback: return profiles with default scores
      return filteredProfiles.map(profile => ({
        profile: profile,
        score: 0.5 // Default score
      }));
    }
  };

  useEffect(() => {
    const updateProfiles = async () => {
      setLoading(true);
    
      const filteredProfiles = getFilteredProfiles();
    
      if (filteredProfiles.length > 0) {
        const mlRankedProfiles = await getMLRankedProfiles(filteredProfiles);
    
        // Always sort by score descending
        const sortedByScore = mlRankedProfiles.sort(
          (a: {profile: ProfileModel, score: number}, b: {profile: ProfileModel, score: number}) => b.score - a.score
        );
    
        setProfilesWithScores(sortedByScore);
    
        // Extract just profiles (still in score order)
        const profilesOnly = sortedByScore.map((item: {profile: ProfileModel, score: number}) => item.profile);
    
        // Optional: If you still want to apply user's sort after score, do it here
        // Otherwise, skip and just use score order
        const finalProfiles =
          sortOption && sortOption !== 'ml-score'
            ? sortProfiles(profilesOnly, sortOption)
            : profilesOnly;
    
        setProfiles(finalProfiles);
      } else {
        setProfiles([]);
        setProfilesWithScores([]);
      }
    
      setLoading(false);
    };
    

    updateProfiles();
  }, [filters, sortOption]);

  useEffect(() => {
    localStorage.setItem('filters', JSON.stringify(filters));
  }, [filters]);

  useEffect(() => {
    localStorage.setItem('sortOption', sortOption);
  }, [sortOption]);

  return (
    <>
      <NavBar />
      <button
        onClick={toggleFilter}
        className="md:hidden fixed bg-white top-7 right-4 px-2 py-1 rounded text-black"
      >
        {isFilterOpen ? '✖' : <span>&#9776;</span>}
      </button>

      <div className="flex">
        <FilterBar
          isFilterOpen={isFilterOpen}
          filters={filters}
          onFilterChange={handleFilterChange}
        />
        <div className="w-full">
          <div
            className={`p-4 flex ${isFilterOpen ? 'hidden' : ''} md:block justify-start items-center gap-4`}
          >
            <div className="flex items-center gap-4 mb-4">
              <label className="text-sm font-medium text-gray-700">Sort by:</label>
              <select
                value={sortOption}
                onChange={(e) => handleSortChange(e)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm"
              >
                <option value="ml-score">ML Match Score (Best First)</option>
                <option value="name-az">Name (A-Z)</option>
                <option value="level-low-high">Level (Beginner → Advanced)</option>
                <option value="level-high-low">Level (Advanced → Beginner)</option>
              </select>
            </div>
            
            {/* Filter Status Indicator */}
            <div className="text-sm text-gray-600">
              {filters.levels.length > 0 && (
                <span className="mr-2">Levels: {filters.levels.join(', ')}</span>
              )}
              {filters.genders.length > 0 && (
                <span className="mr-2">Genders: {filters.genders.join(', ')}</span>
              )}
              {filters.workoutTypes.length > 0 && (
                <span className="mr-2">Workouts: {filters.workoutTypes.slice(0, 3).join(', ')}{filters.workoutTypes.length > 3 ? '...' : ''}</span>
              )}
              {filters.maxDistance && (
                <span className="mr-2">Max Distance: {filters.maxDistance}km</span>
              )}
              {filters.levels.length === 0 && filters.genders.length === 0 && filters.workoutTypes.length === 0 && (
                <span className="text-blue-600">Showing all profiles (no filters applied)</span>
              )}
            </div>
          </div>

          <div
            className="flex flex-wrap gap-8 p-4 justify-center transition-transform duration-300 max-w-full overflow-x-auto"
            onClick={() => isFilterOpen && toggleFilter()}
          >
            {loading ? (
              <p>Loading profiles...</p>
            ) : profilesWithScores.length > 0 ? (
              profilesWithScores.map((item) => (
                <ProfileCard
                  key={item.profile.id}
                  id={item.profile.id}
                  image={item.profile.image}
                  name={item.profile.name}
                  age={item.profile.age}
                  gender={item.profile.gender}
                  location={item.profile.location}
                  level={item.profile.level}
                  workout_preferences={item.profile.workout_preferences}
                  bio={item.profile.bio}
                  matchingScore={item.score}
                />
              ))
            ) : (
              <p>No profiles to display. Try adjusting your filters.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Explore;
