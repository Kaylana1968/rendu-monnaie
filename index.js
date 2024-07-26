const maxToPay = 100;
const cookieLifespan = 7; // in days
const penalityMalus = 200; // time lost when getting wrong

let toPay; // amount they had to pay
let paid; // amount they gave
let toReturn; // list of all coins and bills to give back
let hundredth; // hundredth of time gone since the start
let chrono; // variable that runs the timer
let penalities; // number of penalities received by the player

let chronoElement; // html element where the time is displayed
let penalityMalusElement; // html element where penality time is displayed
let gameMessageElement; // html element to display game messages
let returnedMoneyElement; // html element where taken money is displayed

function start() {
  toPay = (maxToPay * Math.random()).toFixed(2);

  const mode = Math.floor(Math.random() * 3);
  switch (mode) {
    case 0:
      paid = (Math.ceil(toPay / 50) * 50).toFixed(2);
      break;

    case 1:
      paid = (Math.ceil(toPay / 10) * 10).toFixed(2);
      break;

    case 2:
      paid = (Math.ceil(toPay / 10) * 10 + (toPay % 1)).toFixed(2);
  }

  toReturn = [];
  setToReturn();

  chronoElement = document.getElementById("chrono");
  penalityMalusElement = document.getElementById("penality-malus");
  gameMessageElement = document.getElementById("game-message");
  returnedMoneyElement = document.getElementById("returned-money");

  document.getElementById("to-pay").innerText = toPay + "€";
  document.getElementById("paid").innerText = paid + "€";
  returnedMoneyElement.innerHTML = "";
  document.getElementById("best-time").innerText = formatTime(getBestTime());
  document.getElementById("average-time").innerText = formatTime(
    getAverageTime()
  );
  penalityMalusElement.innerHTML = "";
  gameMessageElement.innerText = "";

  hundredth = 0;
  penalities = 0;
  chrono = window.setInterval(timer, 10); // start chrono
}

function addMoney(amount) {
  // If all smaller amount have been returned and amount is needed, remove the amount from toReturn
  if (amount === toReturn[0]) {
    gameMessageElement.innerHTML = "";
    showMoney(amount);
    toReturn.splice(0, 1);
  } else {
    penalities++;
    penalityMalusElement.innerText =
      "+ " + formatTime(penalities * penalityMalus);
    gameMessageElement.innerText = `Faux, + ${
      (penalities * penalityMalus) / 100
    }sec`;
    gameMessageElement.style.color = "red";
  }

  // If amount of toReturn have been returned, win!
  if (toReturn.length === 0) {
    window.clearTimeout(chrono); // stop chrono
    const penalizedTime = hundredth + penalityMalus * penalities;
    gameMessageElement.innerText =
      `Bravo, t'as mis ${formatTime(penalizedTime)} pour rendre la monnaie !` +
      (penalities
        ? ` Tu aurais mis ${formatTime(hundredth)} sans erreur.`
        : "");
    gameMessageElement.style.color = "green";
    toReturn = []; // set empty so that we can't add any more money
    updateBestTime(penalizedTime);
    updateAverageTime(penalizedTime);
  }
}

function showMoney(amount) {
  const image = document.createElement("img");
  if (amount < 100) {
    image.src = `images/${amount}centime.png`;
    image.alt = amount + (amount === 1 ? " centime" : " centimes");
    image.height = 500;
    image.width = 500;
  } else if (amount < 500) {
    image.src = `images/${amount / 100}euro.png`;
    image.alt = amount / 100 + (amount === 100 ? " euro" : " euros");
    image.height = 500;
    image.width = 500;
  } else {
    image.src = `images/${amount / 100}euro.png`;
    image.alt = `${amount / 100} euros`;
    image.height = 850;
    image.width = 1600;
  }

  returnedMoneyElement.appendChild(image);
}

function timer() {
  hundredth++;
  chronoElement.innerText = formatTime(hundredth);
}

function setToReturn() {
  /* paid and toPay have two decimals so multiply by additional 100
   * so that 1 cent is equivalent to 1 in code,
   * avoiding additions and substractions between floating numbers
   */
  let difference = Math.round(10000 * (paid - toPay)) / 100;

  while (difference >= 5000) {
    toReturn.unshift(5000);
    difference -= 5000;
  }

  while (difference >= 2000) {
    toReturn.unshift(2000);
    difference -= 2000;
  }

  if (difference >= 1000) {
    toReturn.unshift(1000);
    difference -= 1000;
  }

  if (difference >= 500) {
    toReturn.unshift(500);
    difference -= 500;
  }

  while (difference >= 200) {
    toReturn.unshift(200);
    difference -= 200;
  }

  if (difference >= 100) {
    toReturn.unshift(100);
    difference -= 100;
  }

  if (difference >= 50) {
    toReturn.unshift(50);
    difference -= 50;
  }

  while (difference >= 20) {
    toReturn.unshift(20);
    difference -= 20;
  }

  if (difference >= 10) {
    toReturn.unshift(10);
    difference -= 10;
  }

  if (difference >= 5) {
    toReturn.unshift(5);
    difference -= 5;
  }

  while (difference >= 2) {
    toReturn.unshift(2);
    difference -= 2;
  }

  if (difference === 1) {
    toReturn.unshift(1);
    difference -= 1;
  }
}
function formatTime(hundredth) {
  hundredth = Math.round(hundredth);
  const seconds = Math.floor(hundredth / 100);
  const remaining = hundredth % 100;
  return `${seconds < 10 ? "0" + seconds : seconds}:${
    remaining < 10 ? "0" + remaining : remaining
  }`;
}

function updateBestTime(time) {
  const date = new Date();
  date.setTime(date.getTime() + cookieLifespan * 86_400_000);
  const expire = "expires=" + date.toUTCString();
  const bestTime = getBestTime();

  if (time < bestTime || !bestTime) {
    document.cookie = "bestTime=" + time + ";" + expire + "; path=/;";
  }
}

function getBestTime() {
  const cookies = decodeURIComponent(document.cookie).split(";");
  const cookie = cookies.find((cookie) => cookie.includes("bestTime"));
  return cookie ? Number(cookie.substring(cookie.indexOf("=") + 1)) : 0;
}

function updateAverageTime(time) {
  const date = new Date();
  date.setTime(date.getTime() + 86_400_000);
  const expire = "expires=" + cookieLifespan * date.toUTCString();

  const cookies = decodeURIComponent(document.cookie).split(";");
  const attemptsCookie = cookies.find((cookie) => cookie.includes("attempts"));
  const attempts = attemptsCookie
    ? Number(attemptsCookie.substring(attemptsCookie.indexOf("=") + 1))
    : 0;

  const averageTimeCookie = cookies.find((cookie) =>
    cookie.includes("averageTime")
  );
  let averageTime = averageTimeCookie
    ? Number(averageTimeCookie.substring(averageTimeCookie.indexOf("=") + 1))
    : 0;

  averageTime = (averageTime * attempts + time) / (attempts + 1);

  document.cookie = "averageTime=" + averageTime + ";" + expire + "; path=/;";
  document.cookie = "attempts=" + (attempts + 1) + ";" + expire + "; path=/;";
}

function getAverageTime() {
  const cookies = decodeURIComponent(document.cookie).split(";");
  const cookie = cookies.find((cookie) => cookie.includes("averageTime"));
  return cookie ? Number(cookie.substring(cookie.indexOf("=") + 1)) : 0;
}
