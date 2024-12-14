let groupedData = {}; // 전역 변수로 그룹화된 데이터를 저장

// CSV 데이터를 읽어오는 함수
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
        renderGroupedLocations(groupedData); // 초기 화면에 모든 데이터를 렌더링
    } catch (error) {
        console.error("CSV 데이터를 불러오는 중 오류가 발생했습니다:", error);
    }
}

// 데이터를 title 기준으로 그룹화하는 함수
function groupLocationsByTitle(data) {
    const grouped = {};

    data.forEach(location => {
        const title = location.title; // title 필드 기준 그룹화
        if (!grouped[title]) {
            grouped[title] = {
                title,
                locations: [],
                posterUrl: location.posterUrl, // CSV에서 poster URL 정보 추가
            };
        }
        grouped[title].locations.push(location);
    });

    return grouped;
}

// 그룹화된 데이터를 HTML로 렌더링하는 함수
function renderGroupedLocations(groupedData, searchQuery = "") {
    const container = document.getElementById("info-content");
    container.innerHTML = ""; // 기존 콘텐츠 초기화

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

        // 그룹 카드의 HTML 구성
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

        // 펼치기 버튼 클릭 이벤트
        const expandBtn = groupCard.querySelector(".expand-btn");
        const locationList = groupCard.querySelector(".location-list");

        expandBtn.addEventListener("click", () => {
            // 세부사항 토글
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

// 검색 버튼 클릭 이벤트 추가
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
        renderGroupedLocations(groupedData); // 전체 데이터 다시 렌더링
        searchInput.value = ""; // 검색어 초기화
        resetBtn.style.display = "none"; // 버튼 숨기기
    });

    // Enter 키로 검색
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
