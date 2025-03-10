type ProfileModel ={
    id: number;
    name: string;
    age: number;
    location: Location;
    workout_preferences: Workouts[]; // an array of none or any of the different workouts of type Workout, I imagine a drop down menu or something with predefined values
}

type Location ={
    city?: string | null; // city is an optional field
    state?: string | null; // state is an optional field
    country: string;
    zip_code: string;
}

type Workouts = "running" | "jogging" | "cycling" | "swimming" | "dancing" | "walking" | "HIIT (High-Intensity Interval Training" | "weightlifting" | "bodyweight exercises" | "circuit training" | "pilates" | "weight training" | "yoga" | "stretching" | "balance exercises" | "other";
// other could be replaced or further specified by a text input?

/*
to use make an instance of this type, there is an example below:

const person: ProfileModel = {
    id: 1,
    name: "Alice",
    age: 30,
    location: {
      city: "New York",
      state: "NY",
      country: "USA",
      zip_code: "11004",
    },
    workout_preferences: ["running", "swimming"],
  };

  then you can display {person.name} etc.
  also person can be replaced with a variable name of your choice
  
  */

export type { ProfileModel, Location, Workouts };