import React, { useState } from 'react'
import NavBar from '../components/NavBar.tsx'
import { ProfileModel, WorkoutModel, LevelModel } from '../data/ProfileModel.ts'
import Workouts from '../consts/Workouts.ts'
import Levels from '../consts/Levels.ts'
import Countries from '../consts/Countries.ts'
import CountryModel from '../data/CountryModel.ts'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleUser } from '@fortawesome/free-solid-svg-icons'

// Function to get initial profile
const getInitialProfile = (): ProfileModel => {
  let savedProfile = localStorage.getItem("userProfile")
  // if profile exists
  if (savedProfile) {
    let parsed = JSON.parse(savedProfile)
    return {
      ...parsed,
      level: parsed.level || Levels[0],
      location: {
        ...parsed.location, 
        country: parsed.location.country || Countries[0]
      }
    }
  }

  return {
    id: 1, 
    image: '',
    name: '',
    age: 0,
    gender: '',
    location: {
      city: '',
      state: '',
      country: Countries[0] as CountryModel,
      zip_code: ''
    },
    level: Levels[0] as LevelModel,
    workout_preferences: [],
    bio: ''
  }
}

function Profile() {
    const [profile, setProfile] = useState<ProfileModel>(getInitialProfile)
    const genders = ['Male', 'Female', 'Other'] as const

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        if (name in profile.location) {
            setProfile({
                ...profile,
                location: {
                    ...profile.location,
                    [name]: value
                }
            })
        } else {
            setProfile({
                ...profile,
                [name]: value
            })
        }
    }

    const handleWorkoutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value, checked } = e.target
        setProfile((prevProfile) => {
            const updatedWorkouts = checked
                ? [...prevProfile.workout_preferences, value as WorkoutModel]
                : prevProfile.workout_preferences.filter(workout => workout !== value)
            return { ...prevProfile, workout_preferences: updatedWorkouts }
        })
    }

    // currently set to only select one checkbox
    const handleGenderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { value, checked } = e.target
      if (checked) {
        setProfile(prevProfile => ({ ...prevProfile, gender: value }))
      }
    }

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setProfile(prevProfile => ({ ...prevProfile, image: reader.result as string }))
            }
            reader.readAsDataURL(file)
        }
    }

    const handleReset = () => {
      localStorage.removeItem("userProfile")
      window.location.reload()
    }

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      
      if (!profile.name) {
        alert("Please fill out the name field!")
        return
      }

      // Age has to be an integer
      if (profile.age % 1 !== 0) {
        alert("Age has to be an integer")
        return
      }

      // Age has to be a positive number 
      if (profile.age < 0) {
        alert("Age has to be a positive number")
        return
      }

      // Zip code needs to be 5-digit 
      if (profile.location.zip_code.length < 5) {
        alert("Zip Code has to be a 5-digit number")
        return 
      }

      // Zip code needs to be a positive number
      if (Number(profile.location.zip_code) < 0) {
        alert("Zip Code needs to be positive")
        return
      }

      // Zip code needs to be an interger
      if (!Number.isInteger(Number(profile.location.zip_code))) {
        alert("Zip code needs to be an integer")
        return
      }

      // setProfile(profile)
      localStorage.setItem("userProfile", JSON.stringify(profile))
      alert("Profile saved successfully!")
    }

    return (
      <>
        <NavBar />
        <div className="flex justify-center p-2 bg-gray-100">
          <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg p-4 w-full max-lg border">
            <div className="flex flex-col items-center mb-4">
              {/* profile picture */}
              <label className="block font-medium"/>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="border rounded p-2 w-64" />
              {profile.image ? <img src={profile.image} width={200} height={200} alt="Profile"  className="mt-2 w-32 h-32 object-cover rounded-full border border-gray-400"/>
              : 
              <FontAwesomeIcon icon={faCircleUser} className="fa-10x"/> }
            </div>
            <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
            <div className="grid gap-4">
              {/* Name */}
              <div className="mb-4">
                <label className="text-xl font-medium text-gray-700">Name: </label>
                <input type="text" name="name" value={profile.name} onChange={handleInputChange} className="border rounded w-64 p-2" />
              </div>
              {/* Age */}
              <div className="mb-4">
                <label className="text-xl font-medium text-gray-700">Age: </label>
                <input type="text" name="age" value={profile.age} onChange={handleInputChange} className="border rounded w-64 p-2" />
              </div>
              {/* Gender */}
              <div className="mb-4">
                <label className="text-xl font-medium text-gray-700">Gender: </label>
                <div className="grid gap-2">
                  {genders.map(g => (
                    <label key={g} className="flex items-center space-x-2">
                      <input type="checkbox" value={g} checked={profile.gender.includes(g)} onChange={handleGenderChange} className="w-4 h-4" />
                      <span>{g}</span>
                    </label>
                  ))}
                </div>
              </div>
              {/* City */}
              <div className="mb-4">
                <label className="text-xl font-medium text-gray-700">City: </label>
                <input type="text" name="city" value={profile.location.city || ''} onChange={handleInputChange} className="border rounded w-64 p-2" />
              </div>
              {/* State */}
              <div className="mb-4">
                <label className="text-xl font-medium text-gray-700">State: </label>
                <input type="text" name="state" value={profile.location.state || ''} onChange={handleInputChange} className="border rounded w-64 p-2" />
              </div>
              {/* Country */}
              <div className="mb-4">
              <label className="text-xl font-medium text-gray-700">Country: </label>
                <select name="country" value={profile.location.country} onChange={handleInputChange} className="border rounded w-64 p-2">
                  {Countries.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>
              {/* Zip code */}
              <div className="mb-4">
                <label className="text-xl font-medium text-gray-700">Zip Code: </label>
                <input type="text" name="zip_code" value={profile.location.zip_code} onChange={handleInputChange} className="border rounded w-64 p-2" />
              </div>
              {/* Level */}
              <div className="mb-4">
                <label className="text-xl font-medium text-gray-700">Level: </label>
                <select name="level" value={profile.level} onChange={handleInputChange} className="border rounded w-64 p-2">
                  {Levels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>
              {/* Workout Preferences */}
              <div className="mb-4">
                <label className="text-xl font-medium text-gray-700">Workout Preferences: </label>
                <div className="grid grid-cols-2 gap-2">
                  {Workouts.map(workout => (
                    <label key={workout} className="flex items-center space-x-2">
                      <input type="checkbox" value={workout} checked={profile.workout_preferences.includes(workout)} onChange={handleWorkoutChange} className="w-4 h-4" />
                      <span>{workout}</span>
                    </label>
                  ))}
                </div>
              </div>
              {/* Bio */}
              <div className="mb-4">
              <label className="text-xl font-medium text-gray-700">Bio</label>
                <textarea name="bio" value={profile.bio} onChange={handleInputChange} className="border rounded w-full p-2 resize-none" rows={3}></textarea>
              </div>
              {/* Buttons Row */}
              <div className='flex gap-4 mt-4'>
                {/* Submit  Button*/}
                <button onClick={handleSubmit} className="w-20 bg-gray-500 text-white p-2 rounded mt-auto">Submit</button>
                {/* Reset Button */}
                <button onClick={handleReset} className="w-40 bg-gray-500 text-white p-2 rounded mt-auto">Reset Profile</button>
              </div>
            </div>
          </form>
        </div>
      </>
    )
}

export default Profile