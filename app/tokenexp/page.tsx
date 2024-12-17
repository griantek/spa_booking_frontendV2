import React, { Suspense } from 'react';

const InvalidTokenMessage = () => {
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
