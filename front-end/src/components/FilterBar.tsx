interface FilterBarProps {
    isFilterOpen: boolean;
}

const FilterBar: React.FC<FilterBarProps> = ({ isFilterOpen }) => {
    // Show filter bar on medium or larger screens or if it has been toggled on
    return (
        <div
        className={`static min-h-screen bg-gray-200 p-4
          ${isFilterOpen ? '' : 'hidden'}
          md:block`}
        >
            <h2 className="text-xl font-bold mb-4">Filter</h2>
            <form>
                {/* Level */}
                <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-700">Level</h3>
                    <div className="flex flex-col space-y-2">
                        <label className="flex items-center">
                            <input type="checkbox" className="mr-2" />
                            Beginner
                        </label>
                        <label className="flex items-center">
                            <input type="checkbox" className="mr-2" />
                            Intermediate
                        </label>
                        <label className="flex items-center">
                            <input type="checkbox" className="mr-2" />
                            Advanced
                        </label>
                    </div>
                </div>

                {/* Gender */}
                <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-700">Gender</h3>
                    <div className="flex flex-col space-y-2">
                        <label className="flex items-center">
                            <input type="checkbox" className="mr-2" />
                            Male
                        </label>
                        <label className="flex items-center">
                            <input type="checkbox" className="mr-2" />
                            Female
                        </label>
                        <label className="flex items-center">
                            <input type="checkbox" className="mr-2" />
                            Other
                        </label>
                    </div>
                </div>

                {/* Max Distance */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Max Distance (miles)</label>
                    <input
                        type="number"
                        className="w-full p-2 border border-gray-300 rounded"
                        placeholder="Enter distance"
                    />
                </div>

                {/* Workout Type */}
                <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-700">Workout Type</h3>
                    <div className="flex flex-col space-y-2">
                        <label className="flex items-center">
                            <input type="checkbox" className="mr-2" />
                            Running
                        </label>
                        <label className="flex items-center">
                            <input type="checkbox" className="mr-2" />
                            Yoga
                        </label>
                        <label className="flex items-center">
                            <input type="checkbox" className="mr-2" />
                            Swimming
                        </label>
                        <label className="flex items-center">
                            <input type="checkbox" className="mr-2" />
                            Weightlifting
                        </label>
                        <label className="flex items-center">
                            <input type="checkbox" className="mr-2" />
                            Dance
                        </label>
                    </div>
                </div>

                {/* Apply Filters Button */}
                <button className="w-full bg-gray-500 rounded text-white p-2">
                    Apply Filters
                </button>
            </form>
        </div>
    )
}

export default FilterBar
