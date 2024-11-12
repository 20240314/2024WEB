// 전역 변수를 선언합니다.
let jsonData = [];
let markers = [];
// locType별 아이콘 색상 설정
const markerColors = {
    cafe: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
    playground: "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png",
    restaurant: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
    shop: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
    station: "http://maps.google.com/mapfiles/ms/icons/purple-dot.png",
    stay: "http://maps.google.com/mapfiles/ms/icons/orange-dot.png",
    store: "http://maps.google.com/mapfiles/ms/icons/pink-dot.png"
};

// Google Places API에서 장소 정보를 가져오는 함수
// Google Places API에서 장소 정보를 가져오는 함수
// Google Places API에서 장소 정보를 가져오는 함수 (평점만 표시)
// Google Places API에서 장소 정보를 가져오는 함수 (평점만 표시하고 locName 클릭 시 Google 지도 링크 추가)
// Google Places API에서 장소 정보를 가져오는 함수 (평점, 대표 사진, 지도 링크 추가)
// Google Places API에서 장소 정보를 가져오는 함수 (평점, 고해상도 대표 사진, 지도 링크 추가)
function fetchPlaceDetails(map, marker, location, infowindow) {
    const service = new google.maps.places.PlacesService(map);
    const request = {
        query: `${location.locName}, ${location.address}`, // 장소 이름과 주소를 함께 사용하여 검색
        fields: ["rating", "photos"] // 평점 및 사진 정보 가져오기
    };

    service.findPlaceFromQuery(request, (results, status) => {
        console.log("검색 결과:", results);
        console.log("상태 코드:", status);

        if (status === google.maps.places.PlacesServiceStatus.OK && results.length > 0) {
            // 가장 적합한 결과 가져오기
            const place = results[0];
            const starRating = place.rating ? `⭐ ${place.rating}` : "별점 없음";

            // Google 지도 검색 링크 생성
            const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location.locName)}+${encodeURIComponent(location.address)}`;

            // 대표 사진 URL 생성 (고해상도 최대 크기 설정)
            const photoUrl = place.photos && place.photos.length > 0 ? place.photos[0].getUrl({ maxWidth: 800, maxHeight: 800 }) : "";

            // infowindow에 고해상도 대표 사진, 장소 이름(클릭 시 Google 지도 링크), 주소, 설명 및 평점 표시
            infowindow.setContent(`
                <div style="font-size: 14px;">
                    ${photoUrl ? `<img src="${photoUrl}" alt="${location.locName} 대표 사진" style="width: 100%; height: auto; margin-bottom: 10px; border-radius: 8px;">` : ""}
                    <h3><a href="${googleMapsUrl}" target="_blank">${location.locName}</a></h3>
                    <p><strong>주소:</strong> ${location.address}</p>
                    <p><strong>설명:</strong> ${location.description}</p>
                    <p><strong>별점:</strong> ${starRating}</p>
                </div>
            `);
            infowindow.open(map, marker);
        } else {
            console.log("Google Places API 요청 실패 또는 장소를 찾을 수 없음:", status);

            // Google 지도 검색 링크 생성
            const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location.locName)}+${encodeURIComponent(location.address)}`;

            // 장소 정보를 찾지 못한 경우 기본 정보만 표시하고 Google 지도 링크 추가
            infowindow.setContent(`
                <div style="font-size: 14px;">
                    <h3><a href="${googleMapsUrl}" target="_blank">${location.locName}</a></h3>
                    <p><strong>주소:</strong> ${location.address}</p>
                    <p><strong>설명:</strong> ${location.description}</p>
                    <p>Google 리뷰 정보를 찾을 수 없습니다.</p>
                </div>
            `);
            infowindow.open(map, marker);
        }
    });
}





// 지도 초기화 함수
function initMap() {
    const map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 37.5665, lng: 126.9780 },
        zoom: 10,
    });

    const infowindow = new google.maps.InfoWindow();

    // JSON 데이터를 기반으로 마커 추가
    jsonData.forEach(location => {
        const markerIcon = markerColors[location.locType] || markerColors["store"];
        const marker = new google.maps.Marker({
            position: { lat: location.lat, lng: location.lng },
            map,
            title: location.locName,
            icon: markerIcon
        });

        // 마커 클릭 시 Google Places API 호출
        marker.addListener("click", () => {
            fetchPlaceDetails(map, marker, location, infowindow);
        });

        // 모든 마커를 markers 배열에 추가
        markers.push({ marker, type: location.locType });
    });

    // 버튼 이벤트 리스너 추가
    document.getElementById("all-btn").addEventListener("click", () => filterMarkers("all"));
    document.getElementById("cafe-btn").addEventListener("click", () => filterMarkers("cafe"));
    document.getElementById("playground-btn").addEventListener("click", () => filterMarkers("playground"));
    document.getElementById("restaurant-btn").addEventListener("click", () => filterMarkers("restaurant"));
    document.getElementById("shop-btn").addEventListener("click", () => filterMarkers("shop"));
    document.getElementById("station-btn").addEventListener("click", () => filterMarkers("station"));
    document.getElementById("stay-btn").addEventListener("click", () => filterMarkers("stay"));
    document.getElementById("store-btn").addEventListener("click", () => filterMarkers("store"));
}

// CSV 파일을 JSON으로 변환하는 함수
function csvToJson(csv) {
    const lines = csv.trim().split("\n");
    const headers = lines[0].split(",");
    const jsonData = [];

    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",");
        const jsonObject = {};
        headers.forEach((header, index) => {
            jsonObject[header] = values[index];
        });
        jsonData.push(jsonObject);
    }

    return jsonData;
}

// 필터링 함수
function filterMarkers(type) {
    markers.forEach(({ marker, type: markerType }) => {
        if (type === 'all' || markerType === type) {
            marker.setVisible(true);
        } else {
            marker.setVisible(false);
        }
    });
}

// CSV 파일 불러오기 및 JSON 변환 후 지도 초기화 호출
fetch("locationData.csv")
    .then(response => response.text())
    .then(csv => {
        jsonData = csvToJson(csv).map(data => ({
            lat: parseFloat(data.lat),
            lng: parseFloat(data.lng),
            locName: data.locName,
            locType: data.locType,
            address: data.location,
            description: data.locDes
        }));
        console.log("CSV 파일이 JSON으로 변환되었습니다:", jsonData);

        initMap(); // 지도 초기화
    })
    .catch(error => console.error("CSV 파일을 불러오는 중 오류 발생:", error));
