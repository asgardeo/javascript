# Copilot Instructions: React Native Sample App Code Review

## 🎯 Purpose
You are reviewing a **React Native sample mobile application** intended to serve as a **reference implementation** for other developers.  
Your goal is to ensure that the codebase is **clean, maintainable, secure, and follows React Native best practices**.

---

## 🔍 Review Objectives

### 1. Code Quality & Structure
- Ensure the code follows modern **React Native and React** best practices:
  - Prefer **functional components** and **React Hooks**.
  - Use clear and descriptive **naming conventions**.
  - Maintain a **modular structure** with reusable components.
- Verify that files are logically organized (e.g., `screens/`, `components/`, `hooks/`, `services/`, `assets/`).
- Identify and highlight **unused code**, constants, or imports.
- Suggest improvements to **readability** and **maintainability**.

### 2. Performance & Optimization
- Detect potential performance bottlenecks:
  - Unnecessary re-renders.
  - Heavy computations inside render functions.
  - Missing cleanup functions in `useEffect`.
- Suggest using **`useMemo`**, **`useCallback`**, or **FlatList optimizations** where appropriate.
- Ensure proper and efficient **image handling**.

### 3. Best Practices
- Ensure **TypeScript** or **PropTypes** are used for type safety.
- Check for consistent **error handling** and **async flow management**.
- Confirm configuration values are **not hardcoded** — use environment variables or config files.
- Verify clean and consistent **navigation setup** (e.g., React Navigation).
- Review **styling** consistency — recommend StyleSheet, Tailwind, or styled-components, avoiding inline duplication.

### 4. Security & Data Handling
- Ensure no sensitive information (API keys, tokens, credentials) is committed.
- Suggest secure methods for environment variable management.
- Validate that local storage (AsyncStorage, MMKV, etc.) safely handles user data.

### 5. Documentation & Comments
- Check if major modules, hooks, or components have brief, meaningful comments.
- Recommend improvements to the **README** for developer onboarding.
- Suggest adding usage examples or developer notes for clarity.

### 6. Code-Level Issues
- Identify **linting**, **formatting**, or **naming inconsistencies**.
- Point out **deprecated APIs** or outdated React Native patterns.
- Detect **potential bugs**, logical flaws, or anti-patterns.
- Recommend adding or improving **unit tests** if missing.

---

## ✅ Expected Output Format

Copilot should provide structured feedback like this:

