"use client"
import React, { Suspense, useEffect } from 'react';

const InvalidTokenMessage = () => {
    useEffect(() => {
        // Replace the current state with tokenexp, preventing back navigation
        window.history.replaceState(null, "", "/tokenexp");
    
        // Add an event listener for the back button
        const handleBackButton = () => {
          // Close the app directly when back button is pressed
          window.close();
        };
    
        window.addEventListener("popstate", handleBackButton);
    
        // Clean up event listener when the component unmounts
        return () => {
          window.removeEventListener("popstate", handleBackButton);
        };
      }, []);
    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h1 style={{ color: 'red' }}>Invalid Token</h1>
            <p>Your token is either invalid or has expired.</p>
        </div>
    );
};

const TokenExpiredPage = () => {
    return (
        <div>
            <Suspense fallback={<div>Loading...</div>}>
                <InvalidTokenMessage />
            </Suspense>
        </div>
    );
};

export default TokenExpiredPage;
