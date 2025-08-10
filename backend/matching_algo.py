from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from sklearn.preprocessing import OneHotEncoder, MinMaxScaler
from sklearn.metrics.pairwise import cosine_similarity
from geopy.geocoders import Nominatim
from geopy.distance import geodesic
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
import uvicorn
import os
import json

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

global_encoder = OneHotEncoder(sparse_output=False, handle_unknown='ignore')
global_scaler = MinMaxScaler()
geolocator = Nominatim(user_agent="ml-matching")

# ------------------------
# Models & Sample Profiles
# ------------------------

class Location(BaseModel):
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    zip_code: Optional[str] = None

class UserProfile(BaseModel):
    id: int
    name: str
    age: int
    image: str
    bio: str
    level: str
    gender: str
    location: Location
    workout_preferences: List[str]

class MatchRequest(BaseModel):
    current_user: UserProfile
    all_users: List[UserProfile]
    top_k: int = 3

# ------------------------
# Helper Functions
# ------------------------

ALL_WORKOUTS = [
    "Balance exercises", "Boxing", "Calisthenics", "Circuit training", "CrossFit",
    "Cycling", "Dancing", "HIIT", "Hiking", "Jogging", "Pilates", "Rock Climbing",
    "Running", "Swimming", "Walking", "Weightlifting", "Yoga", "Other"
]

LEVEL_ORDER = ["Beginner", "Intermediate", "Advanced"]

def load_mock_profiles():
    try:
        profiles_path = os.path.join(os.path.dirname(__file__), '..', 'mockData', 'MockProfiles.json')
        with open(profiles_path, 'r') as f:
            return json.load(f)
    except Exception as e:
        print(f"Failed to load mock profiles: {e}")
        return []

MOCK_PROFILES = load_mock_profiles()
zip_cache = {}

def get_coordinates(zip_code: str, country: str):
    key = f"{zip_code},{country}"
    if key in zip_cache:
        return zip_cache[key]
    try:
        location = geolocator.geocode({"postalcode": zip_code, "country": country})
        if location:
            coord = (location.latitude, location.longitude)
            zip_cache[key] = coord
            return coord
    except:
        return None

def haversine_distance(zip1, country1, zip2, country2):
    if not zip1 or not country1 or not zip2 or not country2:
        return 9999
    coord1 = get_coordinates(zip1, country1)
    coord2 = get_coordinates(zip2, country2)
    if coord1 and coord2:
        return geodesic(coord1, coord2).km
    else:
        return 9999

def encode_user(user: UserProfile, reference_user: UserProfile, distance_km: float) -> List[float]:
    # Level similarity (one-hot encoding)
    level_vector = [0, 0, 0]
    if user.level in LEVEL_ORDER:
        level_vector[LEVEL_ORDER.index(user.level)] = 1
    
    # Gender similarity (one-hot encoding)
    gender_vector = [1 if user.gender == g else 0 for g in ["Male", "Female", "Nonbinary"]]
    
    # Workout preference similarity (binary vector)
    workout_vector = [1 if w in user.workout_preferences else 0 for w in ALL_WORKOUTS]
    
    # Distance similarity (normalized, closer = higher score)
    # Convert distance to similarity: closer profiles get higher scores
    distance_similarity = max(0, 1 - (distance_km / 100.0))  # 100km = 0 similarity, 0km = 1 similarity
    
    # Age similarity (if we had age data, we could add this)
    # age_similarity = 1 - abs(user.age - reference_user.age) / 50.0
    
    # Combine all features
    features = level_vector + gender_vector + [distance_similarity] + workout_vector
    
    return features

# ------------------------
# FastAPI Routes
# ------------------------

@app.get("/match")
def get_top_matches_get(
    level: Optional[List[str]] = Query(None),
    gender: Optional[List[str]] = Query(None),
    zip_code: Optional[str] = None,
    country: str = "United States",
    city: Optional[str] = None,
    state: Optional[str] = None,
    workouts: Optional[List[str]] = Query(None),
    max_distance: Optional[float] = Query(None),
    top_k: int = 3
):
    print(f"Received filters - level: {level}, gender: {gender}, workouts: {workouts}, max_distance: {max_distance}")  # Debug log
    
    filtered_profiles = []
    for profile in MOCK_PROFILES:
        # Filter by level - only if level parameter is provided and not empty
        if level and len(level) > 0 and profile["level"] not in level:
            continue
        
        # Filter by gender - only if gender parameter is provided and not empty
        if gender and len(gender) > 0 and profile["gender"] not in gender:
            continue
        
        # Filter by workout preferences - only if workouts parameter is provided and not empty
        if workouts and len(workouts) > 0 and not any(w in profile["workout_preferences"] for w in workouts):
            continue
        
        # Filter by distance if zip_code and max_distance are provided
        if zip_code and max_distance and profile["location"]["zip_code"]:
            distance = haversine_distance(
                zip_code, country,
                profile["location"]["zip_code"], profile["location"]["country"]
            )
            if distance > max_distance:
                continue
        
        filtered_profiles.append(profile)

    # If no filters are applied, return all profiles
    if not level and not gender and not workouts and not max_distance:
        filtered_profiles = MOCK_PROFILES
    elif (level and len(level) == 0) or (gender and len(gender) == 0) or (workouts and len(workouts) == 0):
        # If any filter is an empty array, return no profiles
        filtered_profiles = []

    print(f"Filtered profiles count: {len(filtered_profiles)}")  # Debug log

    current_user = UserProfile(
        id=0,
        name="Current User",
        age=25,
        image="",
        bio="",
        level=level[0] if level and len(level) > 0 else "Beginner",
        gender=gender[0] if gender and len(gender) > 0 else "Male",
        location=Location(
            city=city,
            state=state,
            country=country,
            zip_code=zip_code
        ),
        workout_preferences=workouts or []
    )

    mock_users = [UserProfile(**p) for p in filtered_profiles]

    match_request = MatchRequest(
        current_user=current_user,
        all_users=mock_users,
        top_k=top_k
    )

    return get_top_matches_logic(match_request)

@app.post("/match")
def get_top_matches(data: MatchRequest):
    print(f"Received POST request with {len(data.all_users)} users to match")
    print(f"Current user: {data.current_user.name}, Level: {data.current_user.level}, Gender: {data.current_user.gender}")
    print(f"Current user workout preferences: {data.current_user.workout_preferences}")
    return get_top_matches_logic(data)

def get_top_matches_logic(data: MatchRequest):
    vectors = []
    users = []
    current_id = data.current_user.id

    for user in data.all_users:
        if user.id == current_id:
            continue
        
        # Calculate distance between current user and this profile
        dist = haversine_distance(
            data.current_user.location.zip_code, data.current_user.location.country,
            user.location.zip_code, user.location.country
        )
        
        # Encode user profile for ML comparison
        vec = encode_user(user, data.current_user, dist)
        vectors.append(vec)
        users.append(user)

    if not vectors:
        raise HTTPException(status_code=400, detail="No users to compare")

    # Encode current user for comparison
    current_vector = encode_user(data.current_user, data.current_user, 0)
    
    # Calculate cosine similarities
    similarities = cosine_similarity([current_vector], vectors)[0]
    
    # Sort by similarity score (highest first)
    sorted_indices = np.argsort(similarities)[::-1][:data.top_k]

    top_matches = []
    for i in sorted_indices:
        user = users[i]
        score = float(similarities[i])
        
        # Add distance information for debugging
        dist = haversine_distance(
            data.current_user.location.zip_code, data.current_user.location.country,
            user.location.zip_code, user.location.country
        )
        
        top_matches.append({
            "profile": user.dict(),
            "score": score,
            "distance_km": dist if dist < 9999 else None
        })

    return {"matches": top_matches}

# ------------------------
# Local run
# ------------------------

if __name__ == "__main__":
    uvicorn.run("matching_algo:app", host="127.0.0.1", port=8000, reload=True)

