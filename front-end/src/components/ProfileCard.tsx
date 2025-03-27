import { ProfileModel } from '../data/ProfileModel.ts';
import { useNavigate } from 'react-router-dom';

function ProfileCard({ id, name, bio, location, image }: ProfileModel) {
    const navigate = useNavigate();
    const truncatedBio = bio.length > 30 ? `${bio.substring(0, 27)}...` : bio;

    const handleMessageClick = () => {
        navigate(`/messaging/${id}`);
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow-lg hover:shadow-xl transition-shadow flex flex-col justify-between w-40">
            <img
                src={image}
                alt="Profile"
                className="w-full object-cover rounded-md mb-4"
            />
            <h3 className="text-xl font-semibold mb-2">{name}</h3>
            <p className="text-gray-600 text-sm mb-2">Location: {location.city}</p>
            <p className="text-gray-700 mb-4">{truncatedBio}</p>
            <button
                onClick={handleMessageClick}
                className="w-full bg-gray-500 text-white p-2 rounded mt-auto">
                Message
            </button>
        </div>
    )
}

export default ProfileCard;      
