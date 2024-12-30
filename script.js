// Personen en prijzen ophalen uit localStorage of standaardwaarden gebruiken
let people = JSON.parse(localStorage.getItem("people")) || [];
let drinkPrices = {
    beer: parseFloat(localStorage.getItem("beerPrice")) || 1,
    soda: parseFloat(localStorage.getItem("sodaPrice")) || 2,
};

// Data opslaan in localStorage
function saveData() {
    localStorage.setItem("people", JSON.stringify(people));
    localStorage.setItem("beerPrice", drinkPrices.beer);
    localStorage.setItem("sodaPrice", drinkPrices.soda);
}

// Navigeren tussen pagina's
function navigateToAdmin() {
    window.location.href = "admin.html";
}

function navigateToPerson(name) {
    localStorage.setItem("currentPerson", name);
    window.location.href = "person.html";
}

function navigateToHome() {
    window.location.href = "index.html";
}

// UI bijwerken op de hoofdpagina
function updateUI() {
    const container = document.getElementById("personButtons");
    if (container) {
        container.innerHTML = people
            .map(
                (person) =>
                    `<button onclick="navigateToPerson('${person.name}')">${person.name}</button>`
            )
            .join("");
    }
}

// UI bijwerken op de adminpagina
function updateAdminUI() {
    const list = document.getElementById("personList");
    if (list) {
        list.innerHTML = people
            .map(
                (person, index) =>
                    `<li>
                        ${person.name}
                        <button onclick="removePerson(${index})">Verwijderen</button>
                    </li>`
            )
            .join("");
    }

    const beerInput = document.getElementById("beerPrice");
    const sodaInput = document.getElementById("sodaPrice");

    if (beerInput && sodaInput) {
        beerInput.value = drinkPrices.beer;
        sodaInput.value = drinkPrices.soda;
    }
}

// Persoon toevoegen
function addPerson() {
    const nameInput = document.getElementById("nameInput");
    const name = nameInput.value.trim();
    if (!name) return;

    if (people.find((p) => p.name.toLowerCase() === name.toLowerCase())) {
        showMessage(`De naam "${name}" bestaat al!`, false);
        return;
    }

    people.push({ name, beer: 0, soda: 0 });
    saveData();
    updateUI();
    updateAdminUI();
    nameInput.value = "";
    showMessage(`De naam "${name}" is toegevoegd!`, true);
}

// Persoon verwijderen
function removePerson(index) {
    const removedPerson = people.splice(index, 1)[0];
    saveData();
    updateUI();
    updateAdminUI();
    showMessage(`De persoon "${removedPerson.name}" is verwijderd!`, false);
}

// Prijzen aanpassen
function updatePrices() {
    const beerInput = document.getElementById("beerPrice");
    const sodaInput = document.getElementById("sodaPrice");

    if (beerInput && sodaInput) {
        drinkPrices.beer = parseFloat(beerInput.value) || 0;
        drinkPrices.soda = parseFloat(sodaInput.value) || 0;
        saveData();
        showMessage("Prijzen zijn bijgewerkt!", true);
    }
}

// Reset alle gegevens
function resetAllData() {
    if (confirm("Weet je zeker dat je alle gegevens wilt resetten?")) {
        localStorage.clear();
        people = [];
        drinkPrices = { beer: 1, soda: 2 };
        saveData();
        updateUI();
        updateAdminUI();
        showMessage("Alle gegevens zijn gereset!", true);
    }
}

// Persoon-specifieke pagina: Kosten beheren
function updatePersonUI() {
    const currentPerson = localStorage.getItem("currentPerson");
    const person = people.find((p) => p.name === currentPerson);

    if (!person) {
        showMessage("Persoon niet gevonden!", false);
        return;
    }

    // Zet de naam van de persoon in de <span id="personName">
    document.getElementById("personName").textContent = person.name;
    document.getElementById("beerCount").textContent = person.beer;
    document.getElementById("sodaCount").textContent = person.soda;
    document.getElementById("totalCost").textContent = calculateTotalCost(person);
}

// Drankje toevoegen
function incrementDrink(type) {
    const currentPerson = localStorage.getItem("currentPerson");
    const person = people.find((p) => p.name === currentPerson);

    if (!person) return;

    person[type]++;
    saveData();
    updatePersonUI();

    // Toon melding voor het toevoegen van een drankje
    showMessage(`${type === 'beer' ? 'Bier' : 'Frisdrank'} is toegevoegd!`, true);
}

// Drankje verwijderen
function decrementDrink(type) {
    const currentPerson = localStorage.getItem("currentPerson");
    const person = people.find((p) => p.name === currentPerson);

    if (!person) return;

    if (person[type] > 0) {
        person[type]--;
        saveData();
        updatePersonUI();

        // Toon grote rode melding voor het verwijderen van een drankje
        showMessage(`${type === 'beer' ? 'Bier' : 'Frisdrank'} is verwijderd!`, false);
    }
}

// Totale kosten per persoon berekenen
function calculateTotalCost(person) {
    return (person.beer * drinkPrices.beer + person.soda * drinkPrices.soda).toFixed(2);
}

// Totaal van alle personen berekenen
function calculateOverallTotal() {
    return people
        .reduce(
            (total, person) =>
                total + person.beer * drinkPrices.beer + person.soda * drinkPrices.soda,
            0
        )
        .toFixed(2);
}

// Functie om het bericht te sluiten
function closeMessage() {
    document.getElementById("message").style.opacity = "0";
}

// Functie om het bericht weer te geven
function showMessage(text, success = true) {
    const messageDiv = document.getElementById("message");

    // Reset de styling voor het bericht
    messageDiv.classList.remove("success", "error");  // Verwijder beide classes
    messageDiv.textContent = text;  // Zet de tekst in de melding

    // Afhankelijk van de actie, succes of foutmelding
    if (success) {
        messageDiv.classList.add("success");  // Groene achtergrond voor succes
    } else {
        messageDiv.classList.add("error");   // Rode achtergrond voor foutmelding
    }

    // Toon de melding
    messageDiv.classList.add("show");

    // Verberg het bericht na 3 seconden
    setTimeout(() => {
        messageDiv.classList.remove("show");
    }, 3000);
}


// Bij het laden van de pagina's
document.addEventListener("DOMContentLoaded", () => {
    updateUI();
    updateAdminUI();

    // Dit zorgt ervoor dat de persoon-specifieke gegevens worden geladen op de person.html pagina
    if (document.getElementById("personName")) {
        updatePersonUI();
    }
});

// csv bestand
function convertToCSV(data, drinkPrices) {
    const header = ["Naam", "Bier", "Drank", "Kosten per Persoon"];
    const rows = data.map(person => {
        const totalCost = (person.beer * drinkPrices.beer + person.soda * drinkPrices.soda).toFixed(2);
        return [
            person.name,
            person.beer,
            person.soda,
            totalCost
        ];
    });

    const totalCost = data.reduce(
        (total, person) => total + (person.beer * drinkPrices.beer + person.soda * drinkPrices.soda),
        0
    ).toFixed(2);
    
    rows.push(["Totaal Kosten", "", "", totalCost]);

    // Verander de scheidingsteken naar puntkomma
    return [header.join(';'), ...rows.map(row => row.join(';'))].join('\r\n');
}



function exportToCSV() {
    const data = people; // De gegevens van de mensen
    const csv = convertToCSV(data, drinkPrices); // Verkrijg de CSV met de totale kosten
     
    // Maak een Blob object voor het CSV-bestand
    const blob = new Blob([csv], { type: 'text/csv' });
    
    // Maak een tijdelijke link aan om het bestand te downloaden
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'people_data.csv'; // Bestandsnaam
    
    // Trigger de download
    link.click();
}

