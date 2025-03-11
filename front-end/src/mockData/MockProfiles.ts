import { ProfileModel } from "../data/ProfileModel";

const profileData: ProfileModel[] = [
    {
        id: 1,
        image: "https://placehold.co/150x150",
        name: "Alice",
        age: 30,
        gender: "Female",
        location: {
            city: "New York",
            state: "NY",
            country: "USA",
            zip_code: "11004",
        },
        level: "Beginner",
        workout_preferences: ["Running", "Swimming"],
        bio: "Just somebody looking for a workout partner.",
    }
];

export default profileData;
