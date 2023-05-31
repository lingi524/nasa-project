const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse');

const planets = require('./planets.mongo');

const isHabitableplanet = (planet) => {
  return planet['koi_disposition'] === 'CONFIRMED'&& planet['koi_insol'] > 0.36 && planet['koi_insol'] < 1.11 && planet['koi_prad'] < 1.6;
}

function loadPlanetsData() {
  return new Promise((resolve, reject) => { 
    fs.createReadStream(path.join(__dirname, '..', '..', 'data', 'kepler_data.csv'))
    //This is always how the pipe/parse function looks: readable.pipe(writeable)
    .pipe(parse({
      comment: "#",
      columns: true,  
    }
    ))
    .on('data', async (data) => {
      if(isHabitableplanet(data)){
        await savePlanet(data);
      }
    })
    .on('error', (error) =>{
      console.log(error);
      reject(error);
    })
    .on('end', async () => {
      const countPlanetsFound = (await getAllPlanets()).length;
      console.log(`${countPlanetsFound} habitable planets found!`);
      resolve();
    })
  });
}

//Find uses a filter as the first arugment. Empty object = all objects will be returned
//In the second argument, execute you can list which fields to include/exclude
async function getAllPlanets() {
  return await planets.find({}, {
    '__v': 0,
    '_id': 0 
  });
}

async function savePlanet(planet) {
  try {
    await planets.updateOne({
      keplerName: planet.kepler_name,
    }, {
      keplerName: planet.kepler_name,
    }, {
      //upsert = insert + update
      upsert: true,
    });
  } catch(error) {
    console.error(`Could not save planet ${error}`)
  }
}

module.exports = {
  loadPlanetsData,
  getAllPlanets,
}