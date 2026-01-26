'use client';

import {ChevronDown, LogOut, Settings, UserIcon, Workflow, LayoutDashboard, Bug} from 'lucide-react';
import {UserDropdown as _UserDropdown, SignOutButton, UserProfile} from '@asgardeo/react';
import type {UserDropdownRenderProps} from '@asgardeo/react';
import {useState, useRef} from 'react';
import {Link} from 'react-router';

export type UserDropdownProps = {
  mode?: 'custom' | 'default';
};

export default function UserDropdown({mode = 'default'}: UserDropdownProps) {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  if (mode === 'custom') {
    return (
      <_UserDropdown>
        {({user, isLoading}: UserDropdownRenderProps) => (
          <>
            <div className="relative" ref={userDropdownRef}>
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-50"
              >
                {isLoading ? (
                  <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
                ) : user?.profileUrl ? (
                  <img src={user.profileUrl} alt={user.userName} className="w-8 h-8 rounded-full" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <span className="text-white text-sm font-medium">{user?.userName?.charAt(0)?.toUpperCase()}</span>
                  </div>
                )}
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </button>

              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-75 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="text-sm font-medium text-gray-900">
                      {user?.name?.givenName} {user?.name?.familyName}
                    </div>
                    <div className="text-sm text-gray-500">@{user?.userName}</div>
                  </div>

                  <button
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => {
                      setShowUserProfile(true);
                      setShowUserDropdown(false);
                    }}
                  >
                    <UserIcon className="h-4 w-4 mr-3" />
                    Your profile
                  </button>

                  <Link
                    to="/settings"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setShowUserDropdown(false)}
                  >
                    <Settings className="h-4 w-4 mr-3" />
                    Settings
                  </Link>

                  <Link
                    to="/debug"
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setShowUserDropdown(false)}
                  >
                    <Bug className="h-4 w-4 mr-3" />
                    Debug (Token Info)
                  </Link>

                  <div className="border-t border-gray-100 mt-1">
                    <SignOutButton>
                      {({signOut}: {signOut: () => void}) => (
                        <button
                          onClick={() => {
                            signOut();
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <LogOut className="h-4 w-4 mr-3" />
                          Sign out
                        </button>
                      )}
                    </SignOutButton>
                  </div>
                </div>
              )}
            </div>

            {showUserProfile && <UserProfile mode="popup" open={showUserProfile} onOpenChange={setShowUserProfile} />}
          </>
        )}
      </_UserDropdown>
    );
  }

  return (
    <>
      <_UserDropdown
        menuItems={[
          {
            label: (
              <span className="flex items-center">
                <Workflow className="h-4 w-4 mr-3" />
                Workflows
              </span>
            ),
            onClick: () => null,
          },
          {
            label: (
              <span className="flex items-center">
                <LayoutDashboard className="h-4 w-4 mr-3" />
                Dashboard
              </span>
            ),
            href: '/dashboard',
          },
          {
            label: (
              <span className="flex items-center">
                <Settings className="h-4 w-4 mr-3" />
                Settings
              </span>
            ),
            href: '/settings',
          },
          {
            label: (
              <span className="flex items-center">
                <Bug className="h-4 w-4 mr-3" />
                Debug
              </span>
            ),
            href: '/debug',
          },
        ]}
      />
    </>
  );
}
