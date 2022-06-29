/*
 * Created on Mon Jun 27 2022 12:05:12
 *
 * Copyright (c) 2022 Simon Vander Linden
 */

const displayResult = document.getElementById("displayResult");
const formQuery = document.forms["formQuery"];

const URL_BASE = "https://api.irail.be/";

const btnRefreshEl = document.getElementById("refresh");

const displayInfo = document.getElementById("info");

let refresh = null;
let id = 0;

//! Event Form
formQuery.addEventListener("submit", (event) => {
  const InputStation = formQuery["station"];
  const station = InputStation.value;

  refresh = station;
  event.preventDefault();

  sendRequestData(station);

  formQuery.reset();
  InputStation.focus();
});

btnRefreshEl.addEventListener("click", () => {
  if (refresh != null) {
    sendRequestData(refresh);
    id = 0;
    console.clear();
  }
});

// /composition/?format=json&id='S51507'&data=''&lang=en
//! Request AJAX
const sendGetRequest = async (url) => {
  try {
    const res = await fetch(url);
    const data = await res.json();
    // console.log(data);
    return data;
  } catch (error) {
    console.log(error);
    return error;
  }
};

//! Request Info
const sendRequestInfo = async () => {
  const URL = `${URL_BASE}disturbances/?format=json&lineBreakCharacter=''&lang=fr`;
  try {
    const data = await sendGetRequest(URL);
    printInfo(data);
  } catch (error) {
    console.warn(error);
  }
};
sendRequestInfo();

//! Request Composition train
const sendRequestComposition = async (train) => {
  const URL = `${URL_BASE}composition/?format=json&id=${train}&data=''&lang=fr`;
  try {
    const data = await sendGetRequest(URL);
    // console.log(data);
    printComposition(data);
  } catch (error) {
    console.warn(error);
  }
};

//! Request Station Form
const sendRequestData = async (station) => {
  const URL = `${URL_BASE}liveboard/?station=${station}&alerts=true&format=json`;
  try {
    const data = await sendGetRequest(URL);
    // console.log(data);
    printResult(data);
  } catch (error) {
    console.log(error);
    displayResult.textContent = error;
  }
};
//! Request train
const sendRequestTrain = async (train, station) => {
  const URL = `${URL_BASE}vehicle/?id=${train}&format=json`;
  try {
    const data = await sendGetRequest(URL);
    // console.log(URL);
    // console.log(data);
    printStop(data, station);
  } catch (error) {
    console.log(error);
    displayResult.textContent = error;
  }
};

//! Display station
const printResult = (station) => {
  const titleEl = document.createElement("h3");

  displayResult.textContent = "";

  titleEl.textContent = station.station;
  displayResult.appendChild(titleEl);

  for (let i = 0; i < 10; i++) {
    const articleEl = document.createElement("article");
    articleEl.classList.add("mt-2");
    articleEl.id = station.departures.departure[i].station + i;

    const divEl = document.createElement("div");

    const titleEl = document.createElement("h4");
    titleEl.textContent = station.departures.departure[i].station;

    const spanEl = document.createElement("span");
    if (station.departures.departure[i].delay != 0) {
      spanEl.textContent =
        convertTimestamp(station.departures.departure[i].time) +
        " (+" +
        station.departures.departure[i].delay / 60 +
        ") " +
        " - quai :" +
        station.departures.departure[i].platform +
        " - train :" +
        station.departures.departure[i].vehicleinfo.shortname;
      spanEl.style.color = "red";
    } else
      spanEl.textContent =
        convertTimestamp(station.departures.departure[i].time) +
        " - quai :" +
        station.departures.departure[i].platform +
        " - train :" +
        station.departures.departure[i].vehicleinfo.shortname;

    sendRequestTrain(station.departures.departure[i].vehicle, station.station);

    const divStopEl = document.createElement("div");
    divStopEl.classList.add("row");
    divStopEl.id = station.departures.departure[i].vehicle;

    const smallEl = document.createElement("small");
    smallEl.classList.add("mr-1");
    smallEl.textContent = "Arrêt:";

    const divCompostion = document.createElement("div");
    divCompostion.classList.add("row");
    divCompostion.id = i;

    const divPlaces = document.createElement("div");
    divPlaces.classList.add("row");
    divPlaces.id = i + "s";

    divStopEl.appendChild(smallEl);

    divEl.appendChild(titleEl);
    divEl.appendChild(spanEl);
    divEl.appendChild(divStopEl);
    divEl.appendChild(divCompostion);
    divEl.appendChild(divPlaces);

    articleEl.appendChild(divEl);
    displayResult.appendChild(articleEl);
  }
};

//! Display Stops
const printStop = (train, gare) => {
  // console.log(train);

  const divEl = document.getElementById(train.vehicle);
  indexOf = 0;

  indexOf = train.stops.stop.findIndex((el) => el.station === gare);

  for (let i = indexOf; i < train.stops.stop.length; i++) {
    const smallEl = document.createElement("small");
    smallEl.classList.add("mr-1");
    if (i + 1 == train.stops.stop.length) {
      smallEl.textContent = " " + train.stops.stop[i].station;
    } else smallEl.textContent = " " + train.stops.stop[i].station + " -";
    divEl.appendChild(smallEl);
  }

  sendRequestComposition(train.vehicleinfo.shortname);
};

//! Display Composition
const printComposition = (train) => {
  if (train.error == 404) {
    console.warn("train not found");
    id++;
  } else {
    // console.log(train);

    const divCompositionEl = document.getElementById(id);
    const divPlaceEl = document.getElementById(id + "s");

    for (
      let indexSegments = 0;
      indexSegments < train.composition.segments.segment.length;
      indexSegments++
    ) {
      // console.log('segment :'+indexSegments);
      for (
        let indexUnits = 0;
        indexUnits <
        train.composition.segments.segment[0].composition.units.unit.length;
        indexUnits++
      ) {
        // console.log('Unit :'+indexUnits);
        const divWagonEl = document.createElement("div");
        const divWagonPlaceEl = document.createElement("div");
        divWagonEl.classList.add("col");
        divWagonPlaceEl.classList.add("col");

        const imgEl = document.createElement("img");

        const pEl = document.createElement("p");
        pEl.style.color = "white";
        pEl.style.textShadow = "1px 1px 2px red, 0 0 1em blue, 0 0 0.2em blue";

        let firstClassSeats =
          train.composition.segments.segment[indexSegments].composition.units
            .unit[indexUnits].seatsFirstClass;
        let firstClassStanding =
          train.composition.segments.segment[indexSegments].composition.units
            .unit[indexUnits].standingPlacesFirstClass;

        let secondClassSeats =
          train.composition.segments.segment[indexSegments].composition.units
            .unit[indexUnits].seatsSecondClass;
        let secondClassStanding =
          train.composition.segments.segment[indexSegments].composition.units
            .unit[indexUnits].standingPlacesSecondClass;

        //** First Class */
        if (firstClassSeats > 0 || firstClassStanding > 0) {
          imgEl.src = "../img/wagon01.png";
          imgEl.width = "50";
          imgEl.height = "20";

          let temp = Number(firstClassSeats) + Number(firstClassStanding);
          pEl.textContent = temp;

          divWagonEl.style.maxWidth = "60px";

          divWagonPlaceEl.style.maxWidth = "60px";
          divWagonPlaceEl.style.background = "url(../img/seat.png)";
          divWagonPlaceEl.style.backgroundSize = "cover";

          divWagonEl.appendChild(imgEl);
          divWagonPlaceEl.appendChild(pEl);
          divCompositionEl.appendChild(divWagonEl);
          divPlaceEl.appendChild(divWagonPlaceEl);
        }

        //** Second Class */
        if (secondClassSeats > 0 || secondClassStanding > 0) {
          imgEl.src = "../img/wagon02.png";
          imgEl.width = "50";
          imgEl.height = "20";

          temp = Number(secondClassSeats) + Number(secondClassStanding);
          pEl.textContent = temp;

          divWagonEl.style.maxWidth = "60px";

          divWagonPlaceEl.style.maxWidth = "60px";
          divWagonPlaceEl.style.background = "url(../img/seat.png)";
          divWagonPlaceEl.style.backgroundSize = "cover";

          divWagonEl.appendChild(imgEl);
          divWagonPlaceEl.appendChild(pEl);
          divCompositionEl.appendChild(divWagonEl);
          divPlaceEl.appendChild(divWagonPlaceEl);
        }
      }
    }

    id++;
  }
};

//! Display Info
const printInfo = (info) => {
  for (let indexInfo = 0; indexInfo < info.disturbance.length; indexInfo++) {
    const divEl = document.createElement("div");
    const h4El = document.createElement("h4");
    const pEl = document.createElement("p");

    divEl.classList.add("p-4");

    h4El.textContent = info.disturbance[indexInfo].title;
    pEl.innerHTML = info.disturbance[indexInfo].richtext;

    divEl.appendChild(h4El);
    divEl.appendChild(pEl);

    displayInfo.appendChild(divEl);
  }
};

//! Function convert timestamp
function convertTimestamp(timestamp) {
  let date = new Date(timestamp * 1000);
  let hours = date.getHours();
  let minutes = date.getMinutes();
  let formattedTime = hours + ":" + minutes;
  return formattedTime;
}
