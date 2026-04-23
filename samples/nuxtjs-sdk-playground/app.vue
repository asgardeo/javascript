<template>
  <!-- AsgardeoRoot mounts the full Vue provider tree
       (I18nProvider, BrandingProvider, ThemeProvider, FlowProvider,
       UserProvider, OrganizationProvider) and is auto-registered by
       the @asgardeo/nuxt module — no import needed. -->
  <AsgardeoRoot>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </AsgardeoRoot>
</template>
