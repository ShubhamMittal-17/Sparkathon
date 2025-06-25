import React from 'react';
import { Star, MessageCircle, Plus } from 'lucide-react';

const FriendsRecommendations = ({ friends, onAddToCart }) => {
  return (
    <div className="bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Friends' Recommendations</h2>
          <p className="text-gray-600">See what your friends are loving right now</p>
        </div>
        
        <div className="flex overflow-x-scroll pb-6 -mx-4 px-4 ">
          <div className='flex space-x-6'>
          {friends.map((friend) => (
            <div key={friend.id} className="bg-gradient-to-br w-96 from-blue-50 to-white rounded-xl p-6 shadow-sm border border-blue-100 hover:shadow-lg transition-all duration-300">
              
              {/* Friend Info */}
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={friend.avatar}
                  alt={friend.name}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-200"
                />
                <div>
                  <h3 className="font-semibold text-gray-900">{friend.name}</h3>
                  <div className="flex items-center gap-1 text-blue-600">
                    <MessageCircle size={14} />
                    <span className="text-sm">Recommended</span>
                  </div>
                </div>
              </div>
              
              {/* Friend's Message */}
              <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
                <p className="text-gray-700 text-sm italic">"{friend.message}"</p>
              </div>
              
              {/* Recommended Product */}
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex gap-4">
                  <img
                    src={friend.recommendation.image}
                    alt={friend.recommendation.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">
                      {friend.recommendation.name}
                    </h4>
                    <p className="text-blue-600 text-sm font-medium mb-2">
                      {friend.recommendation.brand}
                    </p>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={12}
                            className={i < Math.floor(friend.recommendation.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-600">({friend.recommendation.rating})</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-gray-900">
                        ${friend.recommendation.price.toFixed(2)}
                      </span>
                      <button
                        onClick={() => onAddToCart(friend.recommendation)}
                        className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-1"
                      >
                        <Plus size={14} />
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FriendsRecommendations;