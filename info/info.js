let groupedData = {};

async function loadLocationData() {
    const csvFilePath = '../main/locationData.csv';

    try {
        const response = await fetch(csvFilePath);
        const csvData = await response.text();

        const rows = csvData.trim().split("\n");
        const headers = rows[0].split(",");
        const data = rows.slice(1).map(row => {
            const values = row.split(",");
            return headers.reduce((obj, header, index) => {
                obj[header.trim()] = values[index].trim();
                return obj;
            }, {});
        });

        groupedData = groupLocationsByTitle(data);
        renderGroupedLocations(groupedData); 
    } catch (error) {
        console.error("CSV 데이터를 불러오는 중 오류가 발생했습니다:", error);
    }
}

function groupLocationsByTitle(data) {
    const grouped = {};

    data.forEach(location => {
        const title = location.title;
        if (!grouped[title]) {
            grouped[title] = {
                title,
                locations: [],
                posterUrl: location.posterUrl,
            };
        }
        grouped[title].locations.push(location);
    });

    return grouped;
}

function renderGroupedLocations(groupedData, searchQuery = "") {
    const container = document.getElementById("info-content");
    container.innerHTML = "";

    const filteredData = searchQuery
        ? Object.values(groupedData).filter(group =>
              group.title.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : Object.values(groupedData);

    if (filteredData.length === 0) {
        container.innerHTML = "<p>검색 결과가 없습니다.</p>";
        return;
    }

    filteredData.forEach(group => {
        const groupCard = document.createElement("div");
        groupCard.classList.add("group-card");

        const locationsHtml = group.locations.map(location => `
            <li>
                <strong>${location.locName}</strong> (${location.location}) - ${location.locType}
            </li>
        `).join("");
        
        groupCard.innerHTML = `
        <div class="group-header">
            <h3>${group.title}</h3>
        </div>
        <div class="details-container">
            <ul class="location-list">
                ${locationsHtml}
            </ul>
            <span class="expand-btn">펼치기</span>
        </div>
         `;
    
        container.appendChild(groupCard);

        const expandBtn = groupCard.querySelector(".expand-btn");
        const locationList = groupCard.querySelector(".location-list");

        expandBtn.addEventListener("click", () => {

            if (locationList.style.display === "none") {
                locationList.style.display = "block";
                expandBtn.textContent = "접기";
            } else {
                locationList.style.display = "none";
                expandBtn.textContent = "펼치기";
            }
        });
    });
}

document.addEventListener("DOMContentLoaded", () => {
    loadLocationData();

    const searchBtn = document.getElementById("search-btn");
    const searchInput = document.getElementById("search-input");
    const resetBtn = document.getElementById("reset-btn");

    searchBtn.addEventListener("click", () => {
        const searchQuery = searchInput.value.trim();
        renderGroupedLocations(groupedData, searchQuery);
    
        if (searchQuery) {
            resetBtn.style.display = "inline-block";
        }
    });

    resetBtn.addEventListener("click", () => {
        renderGroupedLocations(groupedData);
        searchInput.value = "";
        resetBtn.style.display = "none";
    });

    searchInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            const searchQuery = searchInput.value.trim();
            renderGroupedLocations(groupedData, searchQuery);
        
            if (searchQuery) {
                resetBtn.style.display = "inline-block";
            }
        }
    });
});
