export type SortOption = 'name-az' | 'level-low-high' | 'level-high-low';

export const filterProfiles = (profiles: any[], filters: any) => {
    return profiles.filter(profile => {
        const matchesLevel = filters.levels.length === 0 || filters.levels.includes(profile.level);
        const matchesGender = filters.genders.length === 0 || filters.genders.includes(profile.gender);
        const matchesDistance = true; // TODO: implement distance logic
        const matchesWorkoutTypes = filters.workoutTypes.length === 0 || filters.workoutTypes.some((type: string) => profile.workoutTypes.includes(type));
        return matchesLevel && matchesGender && matchesDistance && matchesWorkoutTypes;
    });
};

export const sortProfiles = (profiles: any[], sortOption: SortOption) => {
    const levels = ['Beginner', 'Intermediate', 'Advanced'];

    return [...profiles].sort((a, b) => {
        if (sortOption === 'name-az') {
            return a.name.localeCompare(b.name);
        }
        if (sortOption === 'level-low-high') {
            return levels.indexOf(a.level) - levels.indexOf(b.level);
        }
        if (sortOption === 'level-high-low') {
            return levels.indexOf(b.level) - levels.indexOf(a.level);
        }
        return 0;
    });
};
