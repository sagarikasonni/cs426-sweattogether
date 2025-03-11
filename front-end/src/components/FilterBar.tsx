import { useState } from 'react';

interface FilterBarProps {
    isFilterOpen: boolean;
    onFilterChange: (filters: any) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ isFilterOpen, onFilterChange }) => {
    const [levels, setLevels] = useState<string[]>([]);
    const [genders, setGenders] = useState<string[]>([]);
    const [maxDistance, setMaxDistance] = useState<number | null>(null);
    const [workoutTypes, setWorkoutTypes] = useState<string[]>([]);

    const handleLevelChange = (level: string) => {
        const newLevels = levels.includes(level)
            ? levels.filter(l => l !== level)
            : [...levels, level];
        setLevels(() => newLevels);
        onFilterChange({ levels: newLevels, genders, maxDistance, workoutTypes });
    };

    const handleGenderChange = (gender: string) => {
        const newGenders = genders.includes(gender)
            ? genders.filter(g => g !== gender)
            : [...genders, gender];
        setGenders(() => newGenders);
        onFilterChange({ levels, genders: newGenders, maxDistance, workoutTypes });
    };

    const handleDistanceChange = (distance: number) => {
        setMaxDistance(() => distance);
        onFilterChange({ levels, genders, maxDistance: distance, workoutTypes });
    };

    const handleWorkoutTypeChange = (type: string) => {
        const newWorkoutTypes = workoutTypes.includes(type)
            ? workoutTypes.filter(t => t !== type)
            : [...workoutTypes, type];
        setWorkoutTypes(() => newWorkoutTypes);
        onFilterChange({ levels, genders, maxDistance, workoutTypes: newWorkoutTypes });
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
                                    checked={levels.includes(level)}
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
                                    checked={genders.includes(gender)}
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
                    <label className="block text-sm font-medium text-gray-700">Max Distance (miles)</label>
                    <input
                        type="number"
                        value={maxDistance || ''}
                        onChange={(e) => handleDistanceChange(Number(e.target.value))}
                        className="w-full p-2 border border-gray-300 rounded"
                        placeholder="Enter distance"
                    />
                </div>

                {/* Workout Type */}
                <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-700">Workout Type</h3>
                    <div className="flex flex-col space-y-2">
                        {['Running', 'Yoga', 'Swimming', 'Weightlifting', 'Dance'].map(type => (
                            <label key={type} className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={workoutTypes.includes(type)}
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
