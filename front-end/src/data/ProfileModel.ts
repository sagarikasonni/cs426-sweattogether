type ProfileModel ={
    id: number;
    image: string; // link to image
    name: string;
    age: number;
    gender: string;
    location: Location;
    level: Level;
    workout_preferences: Workouts[]; // an array of none or any of the different workouts of type Workout, I imagine a drop down menu or something with predefined values
    bio: string;
}

type Level = "beginner" | "intermediate" | "advanced";

type Location ={
    city?: string | null; // city is an optional field
    state?: string | null; // state is an optional field
    country: string;
    zip_code: string;
}

type Workouts = "running" | "jogging" | "cycling" | "swimming" | "dancing" | "walking" | "hiit" | "weightlifting" | "bodyweight exercises" | "circuit training" | "pilates" | "weight training" | "yoga" | "stretching" | "balance exercises" | "other";
// other could be replaced or further specified by a text input?

/*
to use make an instance of this type, there is an example below:

const person: ProfileModel = {
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
    level: "beginner",
    workout_preferences: ["running", "swimming"],
    bio: "Just somebody looking for a workout partner.",
  };

  then you can display {person.name} etc.
  also person can be replaced with a variable name of your choice
  
  */

export type { ProfileModel, Location, Workouts };