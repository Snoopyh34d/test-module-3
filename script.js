const tbody = document.querySelector("tbody");
const searchBox = document.querySelector(".search-box");
const sortMktCap = document.querySelector(".mktCapSort");
const sortPercentage = document.querySelector(".percentSort");

// Fetch data using async function with await keyword
fetchCrypto();
async function fetchCrypto() {
    try {
        const responseBody = await fetch(
            "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false"
        );
        if (!responseBody.ok) {
            throw new Error("Network response was not ok");
        }
        const data = await responseBody.json();

        // Store data in localStorage
        localStorage.setItem("coinData", JSON.stringify(data));
        const capturedData = JSON.parse(localStorage.getItem("coinData"));
        // Create rows in the table
        loopObject(capturedData);
    } catch (error) {
        if (error.response && error.response.status === 429) {
            console.log("Rate limit exceeded. Waiting before retrying...");
            // Implement a backoff strategy, e.g., wait for 1 minute before retrying
            setTimeout(fetchCrypto, 60000); // Wait for 1 minute (60000 milliseconds) before retrying
        } else {
            console.error("Error fetching data:", error);
            // Retry after 1 minute in case of any error
            setTimeout(fetchCrypto, 60000); // Wait for 1 minute (60000 milliseconds) before retrying
        }
    }
}

// Loop for all given object array
function loopObject(obj) {
    tbody.innerHTML = "";
    obj.forEach(createRow);
}

// Row creating function
function createRow(obj) {
    const row = document.createElement("tr");
    row.id = `${obj.id}`;
    row.classList.add('row');
    row.innerHTML = `<td><img src="${obj.image}" alt="${obj.name}"/> ${obj.name}</td>
                     <td>${obj.symbol.toUpperCase()}</td>
                     <td class="text-right">$${obj.current_price}</td>
                     <td class="text-right">$${obj.total_volume}</td>
                     <td class="${obj.price_change_percentage_24h >= 0 ? 'td-green' : 'td-red'}">${obj.price_change_percentage_24h.toFixed(2)}%</td>
                     <td>Mkt Cap: ${obj.market_cap}</td>`;
    let elePer = row.childNodes[8];

    if (obj.price_change_percentage_24h < 0) {
        elePer.className = "td-red  text-center";
    } else {
        elePer.className = "td-green  text-center";
    }
    tbody.appendChild(row);
}

// Search box event
searchBox.addEventListener("input", (e) => {
    const enteredText = searchBox.value;
    const arr = JSON.parse(localStorage.getItem("coinData"));
    let val = arr.filter((ele, i) => {
        return (
            ele.name.toLowerCase().includes(enteredText.toLowerCase()) ||
            ele.symbol.toLowerCase().includes(enteredText.toLowerCase())
        );
    });
    loopObject(val);
});

// Sorting event for mktCap button
sortMktCap.addEventListener("click", (e) => {
    const arr = JSON.parse(localStorage.getItem("coinData"));
    const sorted = arr.sort((a, b) => a.market_cap - b.market_cap);
    loopObject(sorted);
});

// Sorting event for percentage button
sortPercentage.addEventListener("click", (e) => {
    const arr = JSON.parse(localStorage.getItem("coinData"));
    const sorted = arr.sort(
        (a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h
    );
    loopObject(sorted);
});
