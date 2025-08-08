import React from 'react';
import Posts from '../posts/Posts';
import '../posts/Posts.css'; // Optional: for any favorites-specific styling

const Favorites = ({ searchQuery, setSearchQuery }) => {
    return (
        <Posts
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            title="❤️ Фаворити"
            subtitle="Вашите допаднати македонски ора и традиции"
            apiEndpoint="http://localhost:3001/favorites" // Your favorites API endpoint
            searchPlaceholder="Резултати во фаворити за"
            isFavoritesPage={true}
        />
    );
};

export default Favorites;