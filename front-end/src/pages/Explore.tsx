import { useState } from 'react';
import NavBar from '../components/NavBar.tsx';
import ProfileCard from '../components/ProfileCard.tsx';
import FilterBar from '../components/FilterBar.tsx';

function Explore() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const toggleFilter = () => {
    setIsFilterOpen(() => !isFilterOpen);
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

        {/* Profile Cards Section */}
        <div
          className="flex-1 p-4 transition-transform duration-300 max-w-full overflow-x-auto"
          onClick={() => isFilterOpen && toggleFilter()}
        >
          <div className="flex flex-wrap gap-8 justify-center">
            {profileData.map((profile) => (
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
    </>
  );
}

export default Explore;
