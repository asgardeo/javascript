'use client';

import {SignIn, useAsgardeo} from '@asgardeo/react';
import {useEffect, useRef} from 'react';

export default function SignInPage() {
  const {signIn, signInUrl, isInitialized} = useAsgardeo();
  const redirectAttempted = useRef(false);

  useEffect(() => {
    if (!signInUrl && isInitialized && !redirectAttempted.current) {
      redirectAttempted.current = true;
      signIn();
    }
  }, [signIn, signInUrl, isInitialized]);

  if (!signInUrl) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <p>Redirecting to sign in...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <SignIn />
        <div className="mt-8 text-center">
          <a href="/" className="text-sm text-gray-500 hover:text-gray-700">
            ← Back to home
          </a>
        </div>
      </div>
    </div>
  );
}
