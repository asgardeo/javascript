/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com).
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import firebase from '@react-native-firebase/app';

// Firebase configuration from google-services.json
const firebaseConfig = {
  apiKey: 'AIzaSyBQdsqwCY3iz7FkGtF_HJ71PzeKhcEQXME',
  projectId: 'is-push-notification',
  databaseURL: 'https://is-push-notification-default-rtdb.firebaseio.com/',
  storageBucket: 'is-push-notification.firebasestorage.app',
  appId: '1:34944661957:android:e9dcbc135739a6e0f3f3ac',
  messagingSenderId: '34944661957',
};

/**
 * Initialize Firebase app with explicit configuration
 * Uses configuration extracted from google-services.json for reliability
 */
export const initializeFirebase = async (): Promise<void> => {
  try {
    // Check if the default Firebase app is already initialized
    if (firebase.apps.length > 0) {
      console.log('Firebase app already initialized');
      return;
    }

    // Initialize Firebase app with explicit configuration
    const app = await firebase.initializeApp(firebaseConfig);
    console.log('Firebase app initialized successfully:', app.name);
  } catch (error) {
    console.error('Firebase initialization error:', error);
    throw error;
  }
};

/**
 * Check if Firebase is properly initialized
 */
export const isFirebaseInitialized = (): boolean => {
  return firebase.apps.length > 0;
};
