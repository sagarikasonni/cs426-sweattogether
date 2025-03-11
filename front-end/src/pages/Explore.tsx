import { useState } from 'react';
import NavBar from '../components/NavBar.tsx';
import ProfileCard from '../components/ProfileCard.tsx';
import FilterBar from '../components/FilterBar.tsx';
import { filterProfiles, sortProfiles, SortOption } from '../utils/ProfileUtils.ts';

function Explore() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>('name-az');
  const [filters, setFilters] = useState<any>({
    levels: [],
    genders: [],
    maxDistance: null,
    workoutTypes: [],
  });

  const toggleFilter = () => {
    setIsFilterOpen(() => !isFilterOpen);
  };

  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOption(() => event.target.value as SortOption);
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters(() => newFilters);
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
      image: 'https://placehold.co/150x150',
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
    }
  ];

  const filteredProfiles = filterProfiles(profileData, filters);
  const sortedProfiles = sortProfiles(filteredProfiles, sortOption);

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
        <FilterBar isFilterOpen={isFilterOpen} onFilterChange={handleFilterChange} />
        <div className='w-full'>
          <div className={`p-4 flex ${isFilterOpen ? 'hidden' : ''} md:block justify-start`}>
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

          <div
            className="flex p-4 transition-transform duration-300 max-w-full overflow-x-auto"
            onClick={() => isFilterOpen && toggleFilter()}
          >
            <div className="flex flex-wrap gap-8 justify-center">
              {sortedProfiles.length > 0 ? (
                sortedProfiles.map((profile) => (
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
                ))
              ) : (
                <p>No profiles to display. Try adjusting your filters.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Explore;
