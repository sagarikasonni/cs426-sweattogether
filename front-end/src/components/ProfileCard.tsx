interface ProfileCardProps {
    id: number,
    name: string,
    bio: string,
    location: string,
    level: string,
    gender: string,
    zip: string,
    workoutTypes: string[],
    image: string
}

function ProfileCard({ name, bio, location, image }: ProfileCardProps) {
    const truncatedBio = bio.length > 40 ? `${bio.substring(0, 37)}...` : bio;

    return (
        <div className="bg-white p-4 rounded-lg shadow-lg hover:shadow-xl transition-shadow w-60 flex flex-col justify-between">
            <img
                src={image}
                alt="Profile"
                className="w-full object-cover rounded-md mb-4"
            />
            <h3 className="text-xl font-semibold mb-2">{name}</h3>
            <p className="text-gray-600 text-sm mb-2">Location: {location}</p>
            <p className="text-gray-700 mb-4">{truncatedBio}</p>
            <button className="w-full bg-gray-500 text-white p-2 rounded mt-auto">
                Message
            </button>
        </div>
    )
}

export default ProfileCard;      
