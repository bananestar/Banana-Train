/*
 * Created on Mon Jun 27 2022 12:05:12
 *
 * Copyright (c) 2022 Simon Vander Linden
 */

const displayResult = document.getElementById("displayResult");
const formQuery = document.forms["formQuery"];

//! Event Form
formQuery.addEventListener("submit", (event) => {
  const InputStation = formQuery["station"];
  const station = InputStation.value;

  event.preventDefault();

  // console.log(namePK);
  sendRequestData(station);

  formQuery.reset();
  InputStation.focus();
});

//! Request AJAX
const sendGetRequest = (url) => {
  // console.log(url);
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.addEventListener("readystatechange", (event) => {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status === 200) {
          try {
            const data = JSON.parse(xhr.responseText);
            // console.warn(data);
            resolve(data);
          } catch (error) {
            reject(error);
          }
        } else {
          reject(`Request error ${xhr.status}`);
        }
      }
    });
    xhr.open("GET", url, true);
    xhr.send();
  });
};

//! Request Station Form
const sendRequestData = async (station) => {
  const URL = `https://api.irail.be/liveboard/?station=${station}&format=json`;
  try {
    const data = await sendGetRequest(URL);
    console.log(data);
    printResult(data);
    // displayResult.textContent = data.station
  } catch (error) {
    console.log(error);
    displayResult.textContent = error;
  }
};
//! Request train
const sendRequestTrain = async (train,station) => {
  const URL = `https://api.irail.be/vehicle/?id=${train}&format=json`;
  try {
    const data = await sendGetRequest(URL);
    printStop(data,station);
    // displayResult.textContent = data.station
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
        " quai :" +
        station.departures.departure[i].platform;
    } else
      spanEl.textContent =
        convertTimestamp(station.departures.departure[i].time) +
        " quai :" +
        station.departures.departure[i].platform;

        console.log(station.station);
    sendRequestTrain(station.departures.departure[i].vehicle, station.station);

    const divStopEl = document.createElement("div");
    divStopEl.classList.add("row");
    divStopEl.id = station.departures.departure[i].vehicle;

    const smallEl = document.createElement("small");
    smallEl.classList.add('mr-1')
    smallEl.textContent = 'Arrêt:'

    divStopEl.appendChild(smallEl)

    divEl.appendChild(titleEl);
    divEl.appendChild(spanEl);
    divEl.appendChild(divStopEl);

    articleEl.appendChild(divEl);
    displayResult.appendChild(articleEl);
  }
};

//! Display Stops
const printStop = (train,gare) => {
  console.log(train);

  const divEl = document.getElementById(train.vehicle);
  indexOf = 0

  indexOf = train.stops.stop.findIndex(el => el.station === gare)

  for (let i = indexOf; i < train.stops.stop.length; i++) {

    const smallEl = document.createElement("small");
    smallEl.classList.add('mr-1')
    if (i+1 == train.stops.stop.length) {
        smallEl.textContent = ' '+train.stops.stop[i].station;
    }else smallEl.textContent = ' '+train.stops.stop[i].station + " -";
    divEl.appendChild(smallEl);
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
