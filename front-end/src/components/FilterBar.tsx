import { useEffect } from 'react';
import Workouts from '../consts/Workouts.ts';

interface FilterBarProps {
    isFilterOpen: boolean;
    filters: any;
    onFilterChange: (filters: any) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ isFilterOpen, filters, onFilterChange }) => {
    // on filter bar changes, run passed in function
    const handleLevelChange = (level: string) => {
        const newLevels = filters.levels.includes(level)
            ? filters.levels.filter((l: string) => l !== level)
            : [...filters.levels, level];
        onFilterChange({ ...filters, levels: newLevels });
    };

    const handleGenderChange = (gender: string) => {
        const newGenders = filters.genders.includes(gender)
            ? filters.genders.filter((g: string) => g !== gender)
            : [...filters.genders, gender];
        onFilterChange({ ...filters, genders: newGenders });
    };

    const handleDistanceChange = (distance: number) => {
        onFilterChange({ ...filters, maxDistance: distance });
    };

    const handleWorkoutTypeChange = (type: string) => {
        const newWorkoutTypes = filters.workoutTypes.includes(type)
            ? filters.workoutTypes.filter((t: string) => t !== type)
            : [...filters.workoutTypes, type];
        onFilterChange({ ...filters, workoutTypes: newWorkoutTypes });
    };

    return (
        <div className={`static min-h-screen bg-gray-200 p-4 ${isFilterOpen ? '' : 'hidden'} md:block`}>
            <h2 className="text-xl font-bold mb-4">Filter</h2>
            <form>
                {/* Level */}
                <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-700">Level</h3>
                    <div className="flex flex-col space-y-2">
                        {['Beginner', 'Intermediate', 'Advanced'].map(level => (
                            <label key={level} className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={filters.levels.includes(level)}
                                    onChange={() => handleLevelChange(level)}
                                    className="mr-2"
                                />
                                {level}
                            </label>
                        ))}
                    </div>
                </div>

                {/* Gender */}
                <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-700">Gender</h3>
                    <div className="flex flex-col space-y-2">
                        {['Male', 'Female', 'Other'].map(gender => (
                            <label key={gender} className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={filters.genders.includes(gender)}
                                    onChange={() => handleGenderChange(gender)}
                                    className="mr-2"
                                />
                                {gender}
                            </label>
                        ))}
                    </div>
                </div>

                {/* Max Distance */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Max Distance (km)</label>
                    <input
                        type="number"
                        value={filters.maxDistance || ''}
                        onChange={(e) => handleDistanceChange(Number(e.target.value))}
                        className="w-full p-2 border border-gray-300 rounded"
                        placeholder="Enter distance"
                    />
                </div>

                {/* Workout Type */}
                <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-700">Workout Type</h3>
                    <div className="flex flex-col space-y-2">
                    {Workouts.map(type => (
                            <label key={type} className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={filters.workoutTypes.includes(type)}
                                    onChange={() => handleWorkoutTypeChange(type)}
                                    className="mr-2"
                                />
                                {type}
                            </label>
                        ))}
                    </div>
                </div>

            </form>
        </div>
    );
};

export default FilterBar;
