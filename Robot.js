const roads = [
  "Alice's House-Bob's House",
  "Alice's House-Cabin",
  "Alice's House-Post Office",
  "Bob's House-Town Hall",
  "Daria's House-Ernie's House",
  "Daria's House-Town Hall",
  "Ernie's House-Grete's House",
  "Grete's House-Farm",
  "Grete's House-Shop",
  'Marketplace-Farm',
  'Marketplace-Post Office',
  'Marketplace-Shop',
  'Marketplace-Town Hall',
  'Shop-Town Hall',
];
//The destination that we can reach from a given place
// A function that returns a data structure of what can be reached from a given place

const buildGraph = (roadArray) => {
  //create an object without it's prototype
  let graph = Object.create(null);
  const addEdge = (from, to) => {
    if (!graph[from]) {
      graph[from] = [to];
    } else {
      graph[from].push(to);
    }
  };
  for (let [from, to] of roadArray.map((r) => r.split('-'))) {
    addEdge(from, to);
    addEdge(to, from);
  }
  return graph;
};
const roadMaps = buildGraph(roads);
//Delivering the parcells

class VillageState {
  constructor(place, parcels) {
    this.place = place;
    this.parcels = parcels;
  }

  move(destination) {
    //if the curent location of the robot does not include any way to the giving destination return current state
    if (!roadMaps[this.place].includes(destination)) {
      return this;
    } else {
      let updatedParcellsState = this.parcels
        .map((p) => {
          if (this.place !== p.place) {
            return p;
          } else {
            return { place: destination, address: p.address };
          }
        })
        .filter((el) => el.place !== el.address);
      return new VillageState(destination, updatedParcellsState);
    }
  }
}
const first = new VillageState('Post Office', [
  { place: 'Post Office', address: "Alice's House" },
]);
let next = first.move("Alice's House");
console.log(next.place);

//* _________SIMULATION________________

//*choosing random direction
const RandomPick = (array) => {
  let choice = Math.floor(Math.random() * array.length);
  return array[choice];
};
//*based on current place
const randomRobot = (state) => {
  return { direction: RandomPick(roadMaps[state.place]) };
};
//*how many turn does it take to finish all parcells
const runRobot = (state, robot, memory) => {
  for (let turn = 0; ; turn++) {
    if (state.parcels.length === 0) {
      console.log(`Done in ${turn}`);
      break;
    }

    let action = robot(state, memory);
    state = state.move(action.direction);
    memory = action.memory;
    console.log(`Moving to ${action.direction}`);
  }
};
//* Generating new parcels by creating a static method and add it to the Villagestate

VillageState.random = function (parcelCount = 5) {
  let parcels = [];
  for (let i = 0; i < parcelCount; i++) {
    let address = RandomPick(Object.keys(roadMaps));
    let place;
    do {
      place = RandomPick(Object.keys(roadMaps));
    } while (place === address);
    parcels.push({ place, address });
  }
  return new VillageState('Post Office', parcels);
};

let mailRoute = [
  "Alice's House",
  'Cabin',
  "Alice's House",
  "Bob's House",
  'Town Hall',
  "Daria's House",
  "Ernie's House",
  "Grete's House",
  'Shop',
  "Grete's House",
  'Farm',
  'Marketplace',
  'Post Office',
];

const routeRobot = (state, memory) => {
  if (memory.length === 0) {
    memory = mailRoute;
  }
  return { direction: memory[0], memory: memory.slice(1) };
};
// runRobot(VillageState.random(), routeRobot, []);

//* Know instead of taking a hard coded route array we'll create an optimized one based on the shortest way

const findRoute = (graph, from, to) => {
  //an array of places to be discoverd next
  let work = [{ to: from, route: [] }];
  for (let i = 0; i < work.length; i++) {
    let { at, route } = work[i];
    for (let place of graph[at]) {
      if (place == to) return route.concat(place);
      // a place that we hav not been yet
      if (!work.some((w) => w.at == place)) {
        work.push({ at: place, route: route.concat(place) });
      }
    }
  }
};
//*Find routes for delivered / undelivered parcels

const goalOrientedRobot = ({ place, parcels }, route) => {
  //if there is no more works => the robot has to know what to do next
  if (route.length === 0) {
    let parcel = parcels[0];
    //checking for the first parcel if it has been picked up or not
    if (parcel.place !== place) {
      route = findRoute(roadMaps, place, parcel.place);
    } else {
      route = findRoute(roadMaps, place, parcel.address);
    }
  }
  return { direction: route[0], memory: route.slice(1) };
};
// runRobot(VillageState.random(), goalOrientedRobot, []);

//*________________EXERCICES_______________*//

//*____________Measuring a robot_________*//

const countSteps = (state, robot, memory) => {
  for (let steps = 0; ; steps++) {
    if (state.parcels.length === 0) return steps;

    let action = robot(state, memory);
    state = state.move(action.direction);
    memory = action.memory;
  }
};
function compareRobots(robot1, memory1, robot2, memory2) {
  // Your code here
  let total1, total2;
  for (let i = 0; i <= 100; i++) {
    total1 += countSteps(VillageState.random, robot1, memory1);
    total2 += countSteps(VillageState.random, robot2, memory2);
  }
  console.log(`ROBOT1 took ${total1 / 100}`);
  console.log(`ROBOT2 took ${total2 / 100}`);
}

compareRobots(routeRobot, [], goalOrientedRobot, []);

//*____________Robot efficiency_________*//
