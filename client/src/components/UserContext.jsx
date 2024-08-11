import React, { createContext, useState } from 'react';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [uploadedFileURL, setUploadedFileURL] = useState('');

    return (
        <UserContext.Provider value={{ uploadedFileURL, setUploadedFileURL }}>
            {children}
        </UserContext.Provider>
    );
};
