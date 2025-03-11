import { useState } from 'react';
import NavBar from '../components/NavBar.tsx';
import ProfileCard from '../components/ProfileCard.tsx';
import FilterBar from '../components/FilterBar.tsx';

function Explore() {
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [sortOption, setSortOption] = useState<'name-az' | 'level-low-high' | 'level-high-low'>('name-az');
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
        setSortOption(() => event.target.value as 'name-az' | 'level-low-high' | 'level-high-low');
    };

    const handleFilterChange = (newFilters: any) => {
        setFilters(newFilters);
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
        },
    ];

    const filteredProfiles = profileData.filter(profile => {
        const matchesLevel = filters.levels.length === 0 || filters.levels.includes(profile.level);
        const matchesGender = filters.genders.length === 0 || filters.genders.includes(profile.gender);
        const matchesDistance = true; // TODO: implement distance logic
        const matchesWorkoutTypes = filters.workoutTypes.length === 0 || filters.workoutTypes.some((type: string) => profile.workoutTypes.includes(type));
        return matchesLevel && matchesGender && matchesDistance && matchesWorkoutTypes;
    });

    const sortedProfiles = [...filteredProfiles].sort((a, b) => {
        if (sortOption === 'name-az') {
            return a.name.localeCompare(b.name);
        }
        if (sortOption === 'level-low-high') {
            const levels = ['Beginner', 'Intermediate', 'Advanced'];
            return levels.indexOf(a.level) - levels.indexOf(b.level);
        }
        if (sortOption === 'level-high-low') {
            const levels = ['Beginner', 'Intermediate', 'Advanced'];
            return levels.indexOf(b.level) - levels.indexOf(a.level);
        }
        return 0;
    });

    return (
        <>
            <NavBar />
            <button
                onClick={toggleFilter}
                className="md:hidden fixed bg-white top-8 left-4 px-2 py-1 rounded text-black"
            >
                {isFilterOpen ? '✖' : <span>&#9776;</span>}
            </button>

            <div className="flex">
                <FilterBar isFilterOpen={isFilterOpen} onFilterChange={handleFilterChange} />
                <div className='w-full'>
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

                    <div
                        className="flex p-4 transition-transform duration-300 max-w-full overflow-x-auto"
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
