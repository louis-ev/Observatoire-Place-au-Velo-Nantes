<template>
  <div class="w-full">
    <img
      src="~/assets/grandes_voies_velo.png"
      class="object-contain w-full h-screen"
      :alt="`plan officiel des ${getRevName()}`"
    />
  </div>
</template>

<script setup lang="ts">
const { getRevName } = useConfig();

const description = `Découvrez le plan officiel des ${getRevName()}.`;
const COVER_IMAGE_URL = 'https://cyclopolis.lavilleavelo.org/cyclopolis.png';

useHead({
  title: `Plan des ${getRevName()}`,
  meta: [
    // description
    { hid: 'description', name: 'description', content: description },
    { hid: 'og:description', property: 'og:description', content: description },
    { hid: 'twitter:description', name: 'twitter:description', content: description },
    // cover image
    { hid: 'og:image', property: 'og:image', content: COVER_IMAGE_URL },
    { hid: 'twitter:image', name: 'twitter:image', content: COVER_IMAGE_URL }
  ]
});
</script>
