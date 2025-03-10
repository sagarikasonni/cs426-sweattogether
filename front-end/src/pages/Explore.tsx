import { useState } from 'react';
import NavBar from '../components/NavBar.tsx';
import ProfileCard from '../components/ProfileCard.tsx';
import FilterBar from '../components/FilterBar.tsx';

function Explore() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortOption, setSortOption] = useState<'name-az' | 'level-low-high' | 'level-high-low'>('name-az'); // Default sort by name (A-Z)

  const toggleFilter = () => {
    setIsFilterOpen(() => !isFilterOpen);
  };

  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOption(() => event.target.value as 'name-az' | 'level-low-high' | 'level-high-low');
  };

  const profileData = [
    {
      id: 1,
      name: 'John Doe',
      bio: 'Strength training and cardio enthusiast',
      location: 'New York, NY',
      level: 'Intermediate',
      gender: 'Male',
      zip: '01003',
      workoutTypes: ['Strength', 'Cardio'],
      image: 'https://placehold.co/600x400',
    },
    {
      id: 2,
      name: 'Jane Smith',
      bio: 'Yoga lover and fitness enthusiast',
      location: 'Los Angeles, CA',
      level: 'Beginner',
      gender: 'Female',
      zip: '01003',
      workoutTypes: ['Yoga'],
      image: 'https://placehold.co/600x400',
    },
    {
      id: 3,
      name: 'Sam Lee',
      bio: 'Running and outdoor workouts expert',
      location: 'Chicago, IL',
      level: 'Advanced',
      gender: 'Male',
      zip: '01003',
      workoutTypes: ['Running', 'Outdoor Workouts'],
      image: 'https://placehold.co/600x400',
    },
  ];

  // Sorting the profileData based on selected sortOption
  const sortedProfiles = [...profileData].sort((a, b) => {
    if (sortOption === 'name-az') {
      return a.name.localeCompare(b.name); // Sort by name alphabetically (A-Z)
    }
    if (sortOption === 'level-low-high') {
      const levels = ['Beginner', 'Intermediate', 'Advanced'];
      return levels.indexOf(a.level) - levels.indexOf(b.level); // Sort by level (low to high)
    }
    if (sortOption === 'level-high-low') {
      const levels = ['Beginner', 'Intermediate', 'Advanced'];
      return levels.indexOf(b.level) - levels.indexOf(a.level); // Sort by level (high to low)
    }
    return 0;
  });

  return (
    <>
      <NavBar />
      {/* Toggle Filter Button (&#8680 is ☰)*/}
      <button
        onClick={toggleFilter}
        className="md:hidden fixed bg-white top-8 left-4 px-2 py-1 rounded text-black"
      >
        {isFilterOpen ? '✖' : <span>&#9776;</span>}
      </button>

      <div className="flex">
        {/* Filter Bar */}
        <FilterBar isFilterOpen={isFilterOpen} />

        <div>
          {/* Sorting Dropdown below the NavBar but above the profiles */}
          <div className="p-4 flex justify-end">
            <label htmlFor="sort" className="mr-2">Sort by:</label>
            <select
              id="sort"
              value={sortOption}
              onChange={handleSortChange}
              className="border rounded"
            >
              <option value="name-az">Name (A-Z)</option>
              <option value="level-low-high">Level (Low to High)</option>
              <option value="level-high-low">Level (High to Low)</option>
            </select>
          </div>

          {/* Profile Cards Section */}
          <div
            className="flex-1 p-4 transition-transform duration-300 max-w-full overflow-x-auto"
            onClick={() => isFilterOpen && toggleFilter()}
          >
            <div className="flex flex-wrap gap-8 justify-center">
              {sortedProfiles.map((profile) => (
                <ProfileCard
                  key={profile.id}
                  id={profile.id}
                  name={profile.name}
                  bio={profile.bio}
                  location={profile.location}
                  level={profile.level}
                  gender={profile.gender}
                  zip={profile.zip}
                  workoutTypes={profile.workoutTypes}
                  image={profile.image}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Explore;
