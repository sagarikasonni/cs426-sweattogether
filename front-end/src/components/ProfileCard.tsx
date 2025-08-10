import { ProfileModel } from '../data/ProfileModel.ts';
import { useNavigate } from 'react-router-dom';

interface ProfileCardProps extends ProfileModel {
    matchingScore?: number;
}

function ProfileCard({ id, name, bio, location, image, matchingScore }: ProfileCardProps) {
    const navigate = useNavigate();
    const truncatedBio = bio.length > 30 ? `${bio.substring(0, 27)}...` : bio;

    const handleMessageClick = () => {
        navigate(`/messaging/${id}`);
    };

    const formatScore = (score: number) => {
        return (score * 100).toFixed(1) + '%';
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow-lg hover:shadow-xl transition-shadow flex flex-col justify-between w-40">
            <div className="w-full h-32 mb-4 rounded-md overflow-hidden">
                <img
                    src={image}
                    alt="Profile"
                    className="w-full h-full object-cover"
                />
            </div>
            <h3 className="text-xl font-semibold mb-2">{name}</h3>
            <p className="text-gray-600 text-sm mb-2">Location: {location.city}</p>
            <p className="text-gray-700 mb-2">{truncatedBio}</p>
            
            {/* Matching Score Display */}
            {matchingScore !== undefined && (
                <div className="mb-2 text-center">
                    <span className="text-xs text-gray-500">Match Score:</span>
                    <div className="text-lg font-bold text-blue-600">
                        {formatScore(matchingScore)}
                    </div>
                </div>
            )}
            
            <button
                onClick={handleMessageClick}
                className="w-full bg-gray-500 text-white p-2 rounded mt-auto">
                Message
            </button>
        </div>
    )
}

export default ProfileCard;      
