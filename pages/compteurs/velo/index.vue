<template>
  <div class="relative bg-gray-50 pt-16 pb-20 px-4 sm:px-6 lg:pt-24 lg:pb-28 lg:px-8">
    <div class="absolute inset-0">
      <div class="bg-white h-1/3 sm:h-2/3" />
    </div>
    <div class="relative max-w-7xl mx-auto">
      <div class="text-center">
        <h2 class="text-3xl tracking-tight font-extrabold text-gray-900 sm:text-4xl">
          Suivi des compteurs vélo de l'agglomération nantaise
        </h2>
        <p class="mt-8 text-xl text-gray-500 leading-8">
          Chaque début de mois, nous remontons les données de {{ counters.length }} compteurs à vélo de l'agglomération nantaise.
        </p>
        <p class="mt-1 text-xl text-gray-500 leading-8 prose max-w-none">
          N'apparaisent pas ici, les comptages organisés par Place au vélo dont les données sont disponibles ici :<br/><a href="https://data.nantesmetropole.fr/explore/dataset/424590313_lieux-de-comptage-de-place-au-velo-nantes/map/?location=14,47.22102,-1.55685&basemap=jawg.streets" target="_blank" cla>lieux de comptage</a> | <a href="https://data.nantesmetropole.fr/explore/dataset/424590313_comptages-velo-place-au-velo-historique/information/" target="_blank"> comptages depuis 1998</a> | <a href="https://data.nantesmetropole.fr/explore/dataset/424590313_comptages-vae-bicloo-place-au-velo-historique/information/" target="_blank">comptages VAE et bicloo depuis 2010</a>
        </p>
        <ClientOnly>
          <Map :features="features" :options="{ legend: false, filter: false }" class="mt-12" style="height: 40vh" />
        </ClientOnly>
      </div>

      <!-- search bar -->
      <div class="mt-4">
        <label for="compteur" class="sr-only">Compteur</label>
        <div class="mt-1 relative rounded-md shadow-sm">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon name="mdi:magnify" class="h-6 w-6 text-gray-400" aria-hidden="true" />
          </div>
          <input id="compteur" v-model="searchText" type="text" class="py-4 pl-10 pr-4 text-lg shadow-md focus:ring-lvv-blue-600 focus:border-lvv-blue-600 block w-full border-gray-900 text-gray-900 rounded-md" placeholder="Chercher un compteur...">
        </div>
      </div>

      <!-- liste des compteurs -->
      <div class="mt-4 max-w-7xl mx-auto grid gap-5 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:max-w-none">
        <CounterCard v-for="counter of counters" :key="counter.name" :counter="counter" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { removeDiacritics } from '~/helpers/helpers';
import type { CompteurFeature } from '~/types';

const { getCompteursFeatures } = useMap();

const { data: allCounters } = await useAsyncData(() => {
  return queryCollection('compteurs')
    .where('path', 'LIKE', '/compteurs/velo%')
    .all();
});

const searchText = ref('');

const counters = computed(() => {
  if (!allCounters.value) { return []; }
  return [...allCounters.value]
    .sort((counter1, counter2) => {
      const count1 = counter1.counts.at(-1)?.count ?? 0;
      const count2 = counter2.counts.at(-1)?.count ?? 0;
      return count2 - count1;
    })
    .filter(counter => removeDiacritics(`${counter.arrondissement} ${counter.name}`).includes(removeDiacritics(searchText.value)))
    .map(counter => ({
      ...counter,
      counts: counter.counts.map(count => ({
        month: count.month,
        veloCount: count.count,
      })),
    }));
});

const features: CompteurFeature[] = getCompteursFeatures({ counters: allCounters.value, type: 'compteur-velo' });
</script>
