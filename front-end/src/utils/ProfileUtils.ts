import { ProfileModel, WorkoutModel } from "../data/ProfileModel";
import Levels from "../data/Levels";

export type SortOption = 'name-az' | 'level-low-high' | 'level-high-low';

// Utility function to calculate distance between two coordinates (Haversine formula)
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth radius in kilometers
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
};

// Get coordinates from a zip code
const getCoordinatesFromZip = async (zipCode: string): Promise<{ lat: number, lon: number }> => {
    const response = await fetch(`https://api.zippopotam.us/us/${zipCode}`);
    const data = await response.json();
    return {
        lat: parseFloat(data.places[0].latitude),
        lon: parseFloat(data.places[0].longitude)
    };
};

export const filterProfiles = async (profiles: ProfileModel[], filters: any, userZipCode: string) => {
    // Get coordinates of the user's zip code
    const userCoordinates = await getCoordinatesFromZip(userZipCode);

    // Use Promise.all to process profiles asynchronously
    const filteredProfiles = await Promise.all(profiles.map(async profile => {
        const matchesLevel = filters.levels.length === 0 || filters.levels.includes(profile.level);
        const matchesGender = filters.genders.length === 0 || filters.genders.includes(profile.gender);
        const matchesWorkoutTypes = filters.workoutTypes.length === 0 ||
            filters.workoutTypes.some((type: WorkoutModel) => profile.workout_preferences.includes(type));

        let matchesDistance = true;
        if (filters.maxDistance && profile.location.zip_code) {
            const profileCoordinates = await getCoordinatesFromZip(profile.location.zip_code);
            const distance = calculateDistance(
                userCoordinates.lat, userCoordinates.lon,
                profileCoordinates.lat, profileCoordinates.lon
            );
            matchesDistance = distance <= filters.maxDistance;
        }

        return matchesLevel && matchesGender && matchesDistance && matchesWorkoutTypes ? profile : null;
    }));

    // Filter out any null results
    return filteredProfiles.filter((profile): profile is ProfileModel => profile !== null);
};

export const sortProfiles = (profiles: any[], sortOption: SortOption) => {
    return [...profiles].sort((a, b) => {
        if (sortOption === 'name-az') {
            return a.name.localeCompare(b.name);
        }
        if (sortOption === 'level-low-high') {
            return Levels.indexOf(a.level) - Levels.indexOf(b.level);
        }
        if (sortOption === 'level-high-low') {
            return Levels.indexOf(b.level) - Levels.indexOf(a.level);
        }
        return 0;
    });
};
