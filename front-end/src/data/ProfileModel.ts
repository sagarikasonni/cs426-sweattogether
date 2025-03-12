import Workouts from '../consts/Workouts.ts'
import Levels from '../consts/Levels.ts'
import CountryModel from './CountryModel.ts';

type ProfileModel ={
    id: number;
    image: string; // link to image
    name: string;
    age: number;
    gender: string;
    location: Location;
    level: LevelModel;
    workout_preferences: WorkoutModel[]; // an array of none or any of the different workouts of type Workout, I imagine a drop down menu or something with predefined values
    bio: string;
}

type LevelModel = typeof Levels[number];

type Location ={
    city?: string | null; // city is an optional field
    state?: string | null; // state is an optional field
    country: CountryModel;
    zip_code: string;
}

type WorkoutModel = typeof Workouts[number];
// other could be replaced or further specified by a text input?

export type { ProfileModel, Location, WorkoutModel, LevelModel };