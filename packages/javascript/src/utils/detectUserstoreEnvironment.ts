/**
 * Utility to detect environment (Asgardeo or IS) and filter userstores.
 *
 * Usage:
 *   const result = detectUserstoreEnvironment(userstores, primaryUserstore);
 *
 * Returns:
 *   {
 *     isAsgardeo: boolean,
 *     isIS: boolean,
 *     userstoresWritable: Userstore[],
 *     userstoresReadOnly: Userstore[],
 *     allUserstores: Userstore[],
 *     primaryUserstore?: Userstore
 *   }
 */

import {Userstore} from '../models/userstore';

export interface DetectUserstoreEnvResult {
  isAsgardeo: boolean;
  isIS: boolean;
  userstoresWritable: Userstore[];
  userstoresReadOnly: Userstore[];
  allUserstores: Userstore[];
  primaryUserstore?: Userstore;
}

const detectUserstoreEnvironment = (
  userstores: Userstore[],
  primaryUserstore?: Userstore,
): DetectUserstoreEnvResult => {
  let isAsgardeo = false;
  let isIS = false;

  if (
    Array.isArray(userstores) &&
    userstores.some(u => u.name === 'DEFAULT' && u.typeName === 'AsgardeoBusinessUserStoreManager')
  ) {
    isAsgardeo = true;
  } else if (Array.isArray(userstores) && userstores.length === 0 && primaryUserstore) {
    isIS = true;
  }

  // Helper to check readonly property
  const isReadOnly = (userstore: Userstore) => {
    if (!userstore.properties) return false;
    const prop = userstore.properties.find(p => p.name === 'ReadOnly');
    return prop?.value === 'true';
  };

  const userstoresReadOnly = userstores.filter(isReadOnly);
  const userstoresWritable = userstores.filter(u => !isReadOnly(u));

  return {
    isAsgardeo,
    isIS,
    userstoresWritable,
    userstoresReadOnly,
    allUserstores: userstores,
    primaryUserstore: isIS ? primaryUserstore : undefined,
  };
};

export default detectUserstoreEnvironment;
