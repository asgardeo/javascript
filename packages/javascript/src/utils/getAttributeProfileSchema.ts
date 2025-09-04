/**
 * Filters and processes SCIM schemas based on profile and supported/required rules.
 *
 * - If `supportedByDefault` is true and `required` is true, keep the attribute.
 * - If `supportedByDefault` is false and `required` is true and there's a `profiles` object,
 *   check if the passed in profile is among the keys and its `supportedByDefault` isn't false.
 *   If false, don't return.
 *
 * Recursively processes subAttributes as well.
 *
 * @param schemas - Array of SCIM schemas (with attributes)
 * @param profile - Profile type: 'console', 'endUser', or 'selfRegistration'
 * @returns Filtered schemas with only the attributes that match the rules
 */

import {ProfileSchemaType, Schema, SchemaAttribute} from '../models/scim2-schema';

const isTrue = (val: any): boolean => val === true || val === 'true';

const filterAttributes = (attributes: SchemaAttribute[], profile: ProfileSchemaType): SchemaAttribute[] =>
  attributes
    ?.map(attr => {
      let keep = false;
      const supported = isTrue(attr.supportedByDefault);
      // required can be at top level or inside profiles[profile]
      const profileConfig = attr.profiles ? attr.profiles[profile] : undefined;
      const required = typeof profileConfig?.required === 'boolean' ? profileConfig.required : !!attr.required;

      if (supported && required) {
        keep = true;
      } else if (!supported && required && profileConfig) {
        if (isTrue(profileConfig.supportedByDefault) && isTrue(profileConfig.required)) {
          keep = true;
        }
      }

      let subAttributes: SchemaAttribute[] | undefined = undefined;

      if (Array.isArray(attr.subAttributes) && attr.subAttributes.length > 0) {
        subAttributes = filterAttributes(attr.subAttributes, profile);
      }

      if (keep || (subAttributes && subAttributes.length > 0)) {
        return {
          ...attr,
          subAttributes,
        };
      }

      return null;
    })
    .filter(Boolean) as SchemaAttribute[];

/**
 * Accepts a flat array of attributes and filters them by profile rules.
 * If you pass a SCIM schema object array, extract the attributes first.
 */
const getAttributeProfileSchema = (attributes: SchemaAttribute[], profile: ProfileSchemaType): SchemaAttribute[] => {
  if (!Array.isArray(attributes)) return [];
  return filterAttributes(attributes, profile);
};

export default getAttributeProfileSchema;
