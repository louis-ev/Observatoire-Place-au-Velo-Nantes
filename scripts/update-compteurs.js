// Pour récupérer les données de comptage à partir de 2020
// Source : https://data.nantesmetropole.fr/explore/dataset/244400404_comptages-velo-nantes-metropole/information/

const fs = require('fs').promises;
const path = require('path');
const fetch = require('node-fetch');

// Dossier contenant les fichiers JSON des boucles de comptage
const directoryPath = path.join(__dirname, '../content/compteurs/velo');

// Fonction pour calculer la date de début et de fin d'un mois donné
function getMonthDateRange(month, year) {
  const startDate = new Date(year, month - 1, 1, 2);
  const endDate = new Date(year, month, 0, 2);

  const formatDate = date => date.toISOString().slice(0, 10).replace(/-/g, '');
  return {
    startDate: formatDate(startDate),
    endDate: formatDate(endDate)
  };
}

// Fonction pour construire l'URL API
function buildApiUrl(boucleNum, startDate, endDate) {
  return `https://data.nantesmetropole.fr/api/explore/v2.1/catalog/datasets/244400404_comptages-velo-nantes-metropole/records?select=sum(total)%20as%20total&where=boucle_num%3D%22${boucleNum.toString().padStart(4, '0')}%22%20and%20jour%3E%3D${startDate}%20and%20jour%3C%3D${endDate}&limit=40`;
  //Select sum(total) as total where boucle_num="boucleNum" and jour>=startDate and jour<=endDate
}

// Fonction pour récupérer les données de l'API
async function fetchBikeCounts(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erreur lors de la récupération des données:', error);
    return null;
  }
}

// Fonction pour calculer le total des passages
function calculateTotalCounts(data) {
  if (!data || !data.results || data.results.length === 0 || !data.results[0].total) {
    return 0;
  }
  return data.results[0].total;
}

// Fonction pour mettre à jour un fichier JSON
async function updateJsonFile(filePath, month, year, totalCounts) {
  const data = JSON.parse(await fs.readFile(filePath, 'utf8'));
  data.counts.push({
    month: `${year}-${month.toString().padStart(2, '0')}-01`,
    count: totalCounts
  });
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

async function processFiles(month, year) {
  // Obtenir la plage de dates pour le mois spécifié
  const { startDate, endDate } = getMonthDateRange(month, year);

  try {
    const files = await fs.readdir(directoryPath);

    // Traiter chaque fichier JSON séquentiellement
    for (const file of files) {
      if (file.endsWith('.json')) {
        const filePath = path.join(directoryPath, file);
        const fileData = JSON.parse(await fs.readFile(filePath, 'utf8'));
        const boucleNum = fileData.idPdc;

        // Construire l'URL API pour la boucle actuelle
        const apiUrl = buildApiUrl(boucleNum, startDate, endDate);

        // Récupérer et traiter les données
        const data = await fetchBikeCounts(apiUrl);
        if (data) {
          const totalCounts = calculateTotalCounts(data);
          await updateJsonFile(filePath, month, year, totalCounts);
        }
      }
    }
  } catch (err) {
    console.error('Erreur lors de la lecture du dossier:', err);
  }
}

async function iterateMonths(startMonth, startYear, endMonth, endYear) {
  for (let year = startYear; year <= endYear; year++) {
    // Déterminer le nombre de mois à parcourir pour la dernière année
    let endMonthOfYear = 11;
    let startMonthOdYear = 0;
    if (year === endYear) {
      endMonthOfYear = endMonth - 1;
    }
    if (year === startYear) {
      startMonthOdYear = startMonth - 1;
    }

    // Itérer sur chaque mois de l'année
    for (let month = startMonthOdYear; month <= endMonthOfYear; month++) {
      // Convertir le mois de 0-11 à 1-12 pour l'affichage ou l'utilisation dans processFiles
      const monthForProcessFiles = month + 1;
      console.log(`Traitement de ${monthForProcessFiles}/${year}`);
      await processFiles(monthForProcessFiles, year);
    }
  }
}

// pour demander sur 1 mois avec le numéro du mois et l'année
//processFiles(3, 2025);

// Appeler la fonction pour itérer de janvier 2020 à juin 2025
iterateMonths(1, 2020, 6, 2025).catch(console.error);
