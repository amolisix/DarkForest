// Crawl Planets
//
// Capture unowned planets around you!
const {
  isMine,
  isUnowned,
  canHaveArtifact,
} = await import('https://plugins.zkga.me/utils/utils.js');

import { EMPTY_ADDRESS } from "https://cdn.skypack.dev/@darkforest_eth/constants";
import {
  PlanetType,
  PlanetTypeNames,
  PlanetLevel,
  PlanetLevelNames,
} from "https://cdn.skypack.dev/@darkforest_eth/types";


const planetTypes = {
  'Planet': 0,
  'Asteroid': 1,
  'Foundry': 2,
  'Spacetime_Rip': 3,
  'Quasar': 4,
};

const planetLevels = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

const players = [
  EMPTY_ADDRESS
];

const typeNames = Object.keys(planetTypes);

const checkTypes = [];

//point of interest
//let poi = new Map();

let poi = [];
class Plugin {
  constructor() {
    this.planetType =  PlanetType.SILVER_MINE;
    this.minimumEnergyAllowed = 15;
    this.minPlanetLevel = 3;
    this.maxEnergyPercent = 85;

    this.minPlantLevelToUse = 2;
    this.maxPlantLevelToUse = 5;

  }
  render(container) {
    container.style.width = '200px';

    let stepperLabel = document.createElement('label');
    stepperLabel.innerText = 'Max % energy to spend';
    stepperLabel.style.display = 'block';

    let stepper = document.createElement('input');
    stepper.type = 'range';
    stepper.min = '0';
    stepper.max = '100';
    stepper.step = '5';
    stepper.value = `${this.maxEnergyPercent}`;
    stepper.style.width = '80%';
    stepper.style.height = '24px';

    let percent = document.createElement('span');
    percent.innerText = `${stepper.value}%`;
    percent.style.float = 'right';

    stepper.onchange = (evt) => {
      percent.innerText = `${evt.target.value}%`;
      try {
        this.maxEnergyPercent = parseInt(evt.target.value, 10);
      } catch (e) {
        console.error('could not parse energy percent', e);
      }
    }


    let minimumEnergyAllowedLabel = document.createElement('label');
    minimumEnergyAllowedLabel.innerText = '% energy to fill after capture';
    minimumEnergyAllowedLabel.style.display = 'block';

    let minimumEnergyAllowedSelect = document.createElement('input');
    minimumEnergyAllowedSelect.type = 'range';
    minimumEnergyAllowedSelect.min = '0';
    minimumEnergyAllowedSelect.max = '100';
    minimumEnergyAllowedSelect.step = '1';
    minimumEnergyAllowedSelect.value = `${this.minimumEnergyAllowed}`;
    minimumEnergyAllowedSelect.style.width = '80%';
    minimumEnergyAllowedSelect.style.height = '24px';

    let percentminimumEnergyAllowed = document.createElement('span');
    percentminimumEnergyAllowed.innerText = `${minimumEnergyAllowedSelect.value}%`;
    percentminimumEnergyAllowed.style.float = 'right';

    minimumEnergyAllowedSelect.onchange = (evt) => {
      if (parseInt(evt.target.value, 10) === 0) percentminimumEnergyAllowed.innerText = `1 energy`;
      else
        percentminimumEnergyAllowed.innerText = `${evt.target.value}%`;
      try {
        this.minimumEnergyAllowed = parseInt(evt.target.value, 10);
      } catch (e) {
        console.error('could not parse minimum energy allowed percent', e);
      }
    }





    let levelLabel = document.createElement('label');
    levelLabel.innerText = 'Min. level to capture';
    levelLabel.style.display = 'block';

    let level = document.createElement('select');
    level.style.background = 'rgb(8,8,8)';
    level.style.width = '100%';
    level.style.marginTop = '10px';
    level.style.marginBottom = '10px';
    planetLevels.forEach(lvl => {
      let opt = document.createElement('option');
      opt.value = `${lvl}`;
      opt.innerText = `Level ${lvl}`;
      level.appendChild(opt);
    });
    level.value = `${this.minPlanetLevel}`;

    level.onchange = (evt) => {
      try {
        this.minPlanetLevel = parseInt(evt.target.value, 10);
      } catch (e) {
        console.error('could not parse planet level', e);
      }
    }

    // minimum plant level used to capture new plant
    let levelLabelMinUse = document.createElement('label');
    levelLabelMinUse.innerText = 'Min. level to Use';
    levelLabelMinUse.style.display = 'block';

    let levelMinUse = document.createElement('select');
    levelMinUse.style.background = 'rgb(8,8,8)';
    levelMinUse.style.width = '100%';
    levelMinUse.style.marginTop = '10px';
    levelMinUse.style.marginBottom = '10px';
    planetLevels.forEach(lvl => {
      let opt = document.createElement('option');
      opt.value = `${lvl}`;
      opt.innerText = `Level ${lvl}`;
      levelMinUse.appendChild(opt);
    });
    levelMinUse.value = `${this.minPlantLevelToUse}`;

    levelMinUse.onchange = (evt) => {
      try {
        this.minPlantLevelToUse = parseInt(evt.target.value, 10);
      } catch (e) {
        console.error('could not parse planet level', e);
      }
    }

    // maxmum plant level used to capture new plant
    let levelLabelMaxUse = document.createElement('label');
    levelLabelMaxUse.innerText = 'Max. level to Use';
    levelLabelMaxUse.style.display = 'block';

    let levelMaxUse = document.createElement('select');
    levelMaxUse.style.background = 'rgb(8,8,8)';
    levelMaxUse.style.width = '100%';
    levelMaxUse.style.marginTop = '10px';
    levelMaxUse.style.marginBottom = '10px';
    planetLevels.forEach(lvl => {
      let opt = document.createElement('option');
      opt.value = `${lvl}`;
      opt.innerText = `Level ${lvl}`;
      levelMaxUse.appendChild(opt);
    });
    levelMaxUse.value = `${this.maxPlantLevelToUse}`;

    levelMaxUse.onchange = (evt) => {
      try {
        this.maxPlantLevelToUse = parseInt(evt.target.value, 10);
      } catch (e) {
        console.error('could not parse planet level', e);
      }
    }


    let planetTypeLabel = document.createElement('label');
    planetTypeLabel.innerText = 'Select planetType: ';
    planetTypeLabel.style.display = 'block';
    planetTypeLabel.style.paddingBottom = "6px";

    // planet checkbox
    let planetLabel = document.createElement('label');
    planetLabel.innerHTML = 'Planet';
    planetLabel.style.paddingRight = "10px";

    let planetCheck = document.createElement('input');
    planetCheck.type = "checkbox";
    planetCheck.value = planetTypes.Planet;
    planetCheck.style.marginRight = "10px";
    planetCheck.checked = false;
    planetCheck.onchange = (evt) => {
      if (evt.target.checked) {
        // add to arr
        checkTypes.push(planetCheck.value);
      } else {
        // delete from arr
        let i = checkTypes.indexOf(planetCheck.value);
        checkTypes.splice(i, 1);
      }
    };

    // asteroid checkbox
    let asteroidLabel = document.createElement('label');
    asteroidLabel.innerHTML = 'Asteroid';
    asteroidLabel.style.paddingRight = "10px";

    let asteroidCheck = document.createElement('input');
    asteroidCheck.type = "checkbox";
    asteroidCheck.value = planetTypes.Asteroid;
    asteroidCheck.style.marginRight = "10px";
    asteroidCheck.checked = false;
    asteroidCheck.onchange = (evt) => {
      if (evt.target.checked) {
        checkTypes.push(asteroidCheck.value);
      } else {
        let i = checkTypes.indexOf(asteroidCheck.value);
        checkTypes.splice(i, 1);
      }
    };

    // Foundry checkbox
    let foundryLabel = document.createElement('label');
    foundryLabel.innerHTML = 'Foundry';
    foundryLabel.style.paddingRight = "10px";

    let foundryCheck = document.createElement('input');
    foundryCheck.type = "checkbox";
    foundryCheck.value = planetTypes.Foundry;
    foundryCheck.style.marginRight = "10px";
    foundryCheck.checked = false;
    foundryCheck.onchange = (evt) => {
      if (evt.target.checked) {
        checkTypes.push(foundryCheck.value);
      } else {
        let i = checkTypes.indexOf(foundryCheck.value);
        checkTypes.splice(i, 1);
      }
      console.log(checkTypes);
    };

    // Spacetime Rip checkbox
    let spaceRipLabel = document.createElement('label');
    spaceRipLabel.innerHTML = 'Spacetime Rip';
    spaceRipLabel.style.paddingRight = "10px";

    let spaceRipCheck = document.createElement('input');
    spaceRipCheck.type = "checkbox";
    spaceRipCheck.value = planetTypes.Spacetime_Rip;
    spaceRipCheck.style.marginRight = "10px";
    spaceRipCheck.checked = false;
    spaceRipCheck.onchange = (evt) => {
      if (evt.target.checked) {
        checkTypes.push(spaceRipCheck.value);
      } else {
        let i = checkTypes.indexOf(spaceRipCheck.value);
        checkTypes.splice(i, 1);
      }
      console.log(checkTypes);
    };

    // Quasar checkbox
    let quasarLabel = document.createElement('label');
    quasarLabel.innerHTML = 'Quasar';
    quasarLabel.style.paddingRight = "10px";

    let quasarCheck = document.createElement('input');
    quasarCheck.type = "checkbox";
    quasarCheck.value = planetTypes.Quasar;
    quasarCheck.style.marginRight = "10px";
    quasarCheck.checked = false;
    quasarCheck.onchange = (evt) => {
      if (evt.target.checked) {
        checkTypes.push(quasarCheck.value);
      } else {
        let i = checkTypes.indexOf(quasarCheck.value);
        checkTypes.splice(i, 1);
      }
      console.log(checkTypes);
    };



    let message = document.createElement('div');

    let button = document.createElement('button');
    button.style.width = '100%';
    button.style.marginTop = '10px';
    button.style.marginBottom = '10px';
    button.innerHTML = 'Crawl from selected!'
    button.onclick = () => {
      // let planet = ui.getSelectedPlanet();
      // if (planet) {
      //   // message.innerText = 'Please wait...';
      //   // let moves = capturePlanets(
      //   //   planet.locationId,
      //   //   this.minPlanetLevel,
      //   //   this.maxEnergyPercent,
      //   //   checkTypes,
      //   // );
      //   // message.innerText = `Crawling ${moves} ${typeNames[this.planetType]}s.`;

      //   calculatePoi(this.minPlanetLevel, checkTypes);
      //   crawlPlantForPoi(this.minPlanetLevel, this.maxEnergyPercent, this.minPlantLevelToUse, this.maxPlantLevelToUse);


      // } else {
      //   message.innerText = 'No planet selected.';
      // }

      calculatePoi(this.minPlanetLevel, checkTypes);
      crawlPlantForPoi(this.minPlanetLevel, this.maxEnergyPercent, this.minPlantLevelToUse, this.maxPlantLevelToUse,this.minimumEnergyAllowed);
    }



    container.appendChild(stepperLabel);
    container.appendChild(stepper);
    container.appendChild(percent);
    container.appendChild(minimumEnergyAllowedLabel);
    container.appendChild(minimumEnergyAllowedSelect);
    container.appendChild(percentminimumEnergyAllowed);
    container.appendChild(levelLabel);
    container.appendChild(level);
    container.appendChild(levelLabelMinUse);
    container.appendChild(levelMinUse);
    container.appendChild(levelLabelMaxUse);
    container.appendChild(levelMaxUse);

    container.appendChild(planetTypeLabel);

    // planet checkbox
    container.appendChild(planetLabel);
    container.appendChild(planetCheck);

    // asteroid checkbox
    container.appendChild(asteroidLabel);
    container.appendChild(asteroidCheck);

    // foundry checkbox
    container.appendChild(foundryLabel);
    container.appendChild(foundryCheck);

    // spacetime checkbox
    container.appendChild(spaceRipLabel);
    container.appendChild(spaceRipCheck);

    // quasar checkbox
    container.appendChild(quasarLabel);
    container.appendChild(quasarCheck);

    container.appendChild(button);
    container.appendChild(message);
  }
}

export default Plugin;


/* function capturePlanets(fromId, minCaptureLevel, maxDistributeEnergyPercent, checkTypes) {

  checkTypes = JSON.parse('[' + String(checkTypes) + ']')

  const planet = df.getPlanetWithId(fromId);
  const from = df.getPlanetWithId(fromId);

  const silverBudget = Math.floor(from.silver);

  // Rejected if has pending outbound moves
  const unconfirmed = df.getUnconfirmedMoves().filter(move => move.from === fromId)
  if (unconfirmed.length !== 0) {
    return 0;
  }

  const candidates_ = df.getPlanetsInRange(fromId, maxDistributeEnergyPercent)
    .filter(p => (
      p.owner !== df.account &&
      players.includes(p.owner) &&
      p.planetLevel >= minCaptureLevel &&
      checkTypes.includes(p.planetType)
    ))
    .map(to => {
      return [to, distance(from, to)]
    })
    .sort((a, b) => a[1] - b[1]);

  let i = 0;
  const energyBudget = Math.floor((maxDistributeEnergyPercent / 100) * planet.energy);

  let energySpent = 0;
  let moves = 0;
  let silverNeed = 0;
  let silverSpent = 0;
  while (energyBudget - energySpent > 0 && i < candidates_.length) {

    const energyLeft = energyBudget - energySpent;
    const silverLeft = silverBudget - silverSpent;

    // Remember its a tuple of candidates and their distance
    const candidate = candidates_[i++][0];

    // Rejected if has unconfirmed pending arrivals
    const unconfirmed = df.getUnconfirmedMoves().filter(move => move.to === candidate.locationId)
    if (unconfirmed.length !== 0) {
      continue;
    }

    // Rejected if has pending arrivals
    const arrivals = getArrivalsForPlanet(candidate.locationId);
    if (arrivals.length !== 0) {
      continue;
    }

    const energyArriving = (candidate.energyCap * 0.15) + (candidate.energy * (candidate.defense / 100));
    // needs to be a whole number for the contract
    const energyNeeded = Math.ceil(df.getEnergyNeededForMove(fromId, candidate.locationId, energyArriving));
    if (energyLeft - energyNeeded < 0) {
      continue;
    }

    if (from.planetType === 1 && candidate.planetType === 0) {
      silverNeed = candidate.silverCap > silverLeft ? silverLeft : candidate.silverCap;
      silverSpent += silverNeed;
    }

    df.move(fromId, candidate.locationId, energyNeeded, silverNeed);

    energySpent += energyNeeded;
    moves += 1;
  }

  return moves;
} */

function getArrivalsForPlanet(planetId) {
  return df.getAllVoyages().filter(arrival => arrival.toPlanet === planetId).filter(p => p.arrivalTime > Date.now() / 1000);
}

//returns tuples of [planet,distance]
function distance(from, to) {
  let fromloc = from.location;
  let toloc = to.location;
  return Math.sqrt((fromloc.coords.x - toloc.coords.x) ** 2 + (fromloc.coords.y - toloc.coords.y) ** 2);
}

function calculatePoi(minCaptureLevel, checkTypes) {
  debugger;
  checkTypes = JSON.parse('[' + String(checkTypes) + ']')

  const candidatesOri = df.getPlanetMap();
  let candidates = [];
  let keys = candidatesOri.keys()
  for (let key of keys) {
    candidates.push(candidatesOri.get(key));
  }


  poi = candidates.filter(p => (
    p.owner !== df.account &&
    players.includes(p.owner) &&
    p.planetLevel >= minCaptureLevel &&
    checkTypes.includes(p.planetType)
  ))
    .map(to => {
      return [to, priorityCalculate(to)]
    })
    .sort((a, b) => b[1] - a[1]);
  console.log("poi");
}

function priorityCalculate(planetObject) {
  let priority = 0;
  switch (planetObject.planetType) {
    //fountry
    case 2:
      priority = planetObject.planetLevel * 3;
      break;
    //Asteroid
    case 1:
      priority = planetObject.planetLevel * 2.1;
      break;
    //spacetimerip
    case 3:
      priority = planetObject.planetLevel * 2;
      break;
    //plant
    case 0:
      priority = planetObject.planetLevel * 1.5;
      break;
    //Quasar
    case 4:
      priority = 0;
      break;
    default:
      break;
  }

  return priority;

}

function crawlPlantForPoi(minPlanetLevel, maxEnergyPercent, minPlantLevelToUse, maxPlantLevelToUse,minimumEnergyAllowed) {

  //for each plant in poi
  for (let poiPlant in poi) {
    let candidates_Ori;
    try {
      candidates_Ori = df.getPlanetsInRange(poi[poiPlant][0].locationId, 95);
    } catch (error) {
      continue;
    }

    let candidates;
    candidates = candidates_Ori.filter(p => (
      p.owner === df.account &&
      p.planetLevel >= minPlantLevelToUse &&
      p.planetLevel <= maxPlantLevelToUse &&
      !canHaveArtifact(p)
    )).sort((a, b) => distance(poi[poiPlant][0], a) - distance(poi[poiPlant][0], b));

    for (let candidatePlant in candidates) {

      crawlPlantMy(minPlanetLevel, maxEnergyPercent, poi[poiPlant][0], candidates[candidatePlant], checkTypes,minimumEnergyAllowed);

    }
  }

}

function crawlPlantMy(minPlanetLevel, maxEnergyPercent, poiPlant, candidatePlant, checkTypes ,minimumEnergyAllowed = 0) {
  // let distancePoiMap = new map();
  // let typePoiMap = new map();
  // let comboMap = new map();
  checkTypes = JSON.parse('[' + String(checkTypes) + ']')

  let candidateCapturePlants;
  try {
    candidateCapturePlants = df.getPlanetsInRange(candidatePlant.locationId, maxEnergyPercent)
      .filter(p => (p.planetLevel >= minPlanetLevel &&
        p.owner !== df.account &&
        players.includes(p.owner) &&
        checkTypes.includes(p.planetType)
      ));
  } catch (error) {
    return;
  }

  let comboMap = candidateCapturePlants.map(p => {
    return [p, priorityCalculate(p) + distance(poiPlant, candidatePlant) / distance(poiPlant, p)]
  }).sort((a, b) => b[1] - a[1]);




  const planet = candidatePlant;
  const from = candidatePlant;

  const silverBudget = Math.floor(from.silver);

  // Rejected if has pending outbound moves
  const unconfirmed = df.getUnconfirmedMoves().filter(move => move.from === from.locationId)
  if (unconfirmed.length !== 0) {
    return 0;
  }


  let i = 0;
  const energyBudget = Math.floor((maxEnergyPercent / 100) * planet.energy);

  let energySpent = 0;
  let moves = 0;
  let silverNeed = 0;
  let silverSpent = 0;
  while (energyBudget - energySpent > 0 && i < comboMap.length) {

    const energyLeft = energyBudget - energySpent;
    const silverLeft = silverBudget - silverSpent;

    // Remember its a tuple of candidates and their distance
    const candidate = comboMap[i++][0];

    // Rejected if has unconfirmed pending arrivals
    const unconfirmed = df.getUnconfirmedMoves().filter(move => move.to === candidate.locationId)
    if (unconfirmed.length !== 0) {
      continue;
    }

    // Rejected if has pending arrivals
    const arrivals = getArrivalsForPlanet(candidate.locationId);
    if (arrivals.length !== 0) {
      continue;
    }

    // const energyArriving = (candidate.energyCap * 0.15) + (candidate.energy * (candidate.defense / 100));
    // // needs to be a whole number for the contract
    // const energyNeeded = Math.ceil(df.getEnergyNeededForMove(candidatePlant.locationId, candidate.locationId, energyArriving));
    // if (energyLeft - energyNeeded < candidatePlant.energyCap * (100 - maxEnergyPercent)*0.01) {
    //   continue;
    // }
    // //set minimum above energy to % or 1 (if 0%), depending on minimumEnergyAllowed value

    if (minimumEnergyAllowed === 0) minimumEnergyAllowed = 1
    else
      minimumEnergyAllowed = candidate.energyCap * minimumEnergyAllowed / 100
    const energyArriving = minimumEnergyAllowed + (candidate.energy * (candidate.defense / 100));
    // needs to be a whole number for the contract
    const energyNeeded = Math.ceil(df.getEnergyNeededForMove(candidatePlant.locationId, candidate.locationId, energyArriving));
    if (energyLeft - energyNeeded < candidatePlant.energyCap * (100 - maxEnergyPercent)*0.01) {
      continue;
    }


    if (from.planetType === 1 && candidate.planetType === 0) {
      silverNeed = candidate.silverCap > silverLeft ? silverLeft : candidate.silverCap;
      silverSpent += silverNeed;
    }

    df.move(candidatePlant.locationId, candidate.locationId, energyNeeded, silverNeed);

    energySpent += energyNeeded;
    moves += 1;
  }

  return moves;
}

