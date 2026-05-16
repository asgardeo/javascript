---
'@asgardeo/react': minor
'@asgardeo/nextjs': minor
---

Add Thunder V2 platform compatibility to the Next.js SDK.

- Exported `SignInV2` and `SignUpV2` components from the React package.
- Updated Next.js `AsgardeoProvider` to correctly pass the `platform` and provide `FlowMetaProvider`.
- Modified Next.js `SignIn` and `SignUp` to dynamically route to V2 components when the `AsgardeoV2` platform is configured.
