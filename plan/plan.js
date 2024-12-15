let jsonData = [];
let markers = [];
let selectedPlaces = [];
let userLocation = null; // 사용자 위치 저장
let currentUserMarker = null; // 현재 사용자 위치 마커 저장

// locType별 아이콘 색상 설정
const markerColors = {
    cafe: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
    playground: "https://maps.google.com/mapfiles/ms/icons/yellow-dot.png",
    restaurant: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
    station: "https://maps.google.com/mapfiles/ms/icons/purple-dot.png",
    stay: "https://maps.google.com/mapfiles/ms/icons/orange-dot.png",
    store: "https://maps.google.com/mapfiles/ms/icons/pink-dot.png"
};

function updateUserMarker(location, map, title) {
    if (currentUserMarker) {
        currentUserMarker.setMap(null);
    }
    currentUserMarker = new google.maps.Marker({
        position: location,
        map,
        title: title,
        icon: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
    });
    map.setCenter(location);
    map.setZoom(14);
}

// 공통 함수: 결과 초기화
function clearResults() {
    document.getElementById("result-list").innerHTML = "";
    document.getElementById("travel-time-list").innerHTML = "";
}

// window.initMap을 글로벌 함수로 정의
window.initMap = function() {
    const map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 37.5665, lng: 126.9780 }, // 초기 위치 (서울)
        zoom: 10,
    });

    const infowindow = new google.maps.InfoWindow();

    // 사용자 현재 위치 가져오기
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };

                // 현재 위치에 마커 추가
                const userMarker = new google.maps.Marker({
                    position: userLocation,
                    map,
                    title: "현재 위치",
                    icon: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
                });

                map.setCenter(userLocation);
                map.setZoom(14);

                // 추천 버튼 활성화
                document.getElementById("recommend-button").addEventListener("click", () => {
                    recommendCourse(userLocation, map);
                });

                // 위치 변경 버튼 활성화
                document.getElementById("set-location-button").addEventListener("click", () => {
                    setSearchLocation(map);
                });
            },
            (error) => {
                console.error("위치 정보를 가져오는 중 오류 발생:", error);
                alert("현재 위치를 가져올 수 없습니다. 검색 위치를 입력해주세요.");
            }
        );
    } else {
        alert("브라우저가 위치 정보를 지원하지 않습니다. 검색 위치를 입력해주세요.");
    }

    // JSON 데이터를 기반으로 마커 추가
    jsonData.forEach((location) => {
        const markerIcon = markerColors[location.locType] || markerColors["store"];
        const marker = new google.maps.Marker({
            position: { lat: location.lat, lng: location.lng },
            map: null, // 초기에는 지도에 표시하지 않음
            title: location.locName,
            icon: markerIcon,
        });

        marker.addListener("click", () => {
            fetchPlaceDetails(map, marker, location, infowindow);
        });

        markers.push({ marker, type: location.locType, location });
    });
};


// 두 지점 간의 거리를 계산하는 함수 (Haversine Formula)
function calculateDistance(loc1, loc2) {
    const R = 6371; // 지구 반경 (km)
    const dLat = ((loc2.lat - loc1.lat) * Math.PI) / 180;
    const dLng = ((loc2.lng - loc1.lng) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((loc1.lat * Math.PI) / 180) *
            Math.cos((loc2.lat * Math.PI) / 180) *
            Math.sin(dLng / 2) *
            Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // 거리 (km)
}


// 여행 코스를 추천하는 함수
function recommendCourse(userLocation, map) {
    clearResults();
    const categoryCounts = {
        cafe: Math.min(parseInt(document.getElementById("cafe-count").value) || 0, 3),
        playground: Math.min(parseInt(document.getElementById("playground-count").value) || 0, 3),
        restaurant: Math.min(parseInt(document.getElementById("restaurant-count").value) || 0, 3),
        station: Math.min(parseInt(document.getElementById("station-count").value) || 0, 3),
        stay: Math.min(parseInt(document.getElementById("stay-count").value) || 0, 3),
        store: Math.min(parseInt(document.getElementById("store-count").value) || 0, 3),
    };

    selectedPlaces = [];
    const resultList = document.getElementById("result-list");
    const travelTimeList = document.getElementById("travel-time-list"); // 거리 정보 표시 영역
    resultList.innerHTML = ""; // 이전 결과 초기화
    travelTimeList.innerHTML = ""; // 이전 거리 정보 초기화
    const alreadySelectedNames = new Set();

    for (const [category, count] of Object.entries(categoryCounts)) {
        if (count === 0) continue;

        const filteredMarkers = markers.filter(({ type, location }) => {
            const normalizedName = location.locName.trim().toLowerCase();
            const isUnique = !alreadySelectedNames.has(normalizedName);
            const isWithinDistance = calculateDistance(userLocation, { lat: location.lat, lng: location.lng }) <= 25;
            return type === category && isUnique && isWithinDistance;
        });

        filteredMarkers.sort((a, b) => {
            const distA = calculateDistance(userLocation, a.location);
            const distB = calculateDistance(userLocation, b.location);
            return distA - distB;
        });

        const selectedForCategory = filteredMarkers.slice(0, count).map(({ marker, location }) => {
            alreadySelectedNames.add(location.locName.trim().toLowerCase());
            marker.setMap(map);
            return { marker, location };
        });
        selectedPlaces.push(...selectedForCategory);
    }

    selectedPlaces.forEach(({ location }) => {
        const listItem = document.createElement("li");
        listItem.textContent = `${location.locName} (${location.address || "주소 정보 없음"})`;
        resultList.appendChild(listItem);

        const distance = calculateDistance(userLocation, { lat: location.lat, lng: location.lng });
        const distanceItem = document.createElement("p");
        distanceItem.textContent = `장소: ${location.locName}, 거리: ${distance.toFixed(2)} km`;
        travelTimeList.appendChild(distanceItem);
    });

    if (selectedPlaces.length > 0) {
        alert("추천된 여행 코스가 지도 아래에 표시되었습니다.");
    } else {
        alert("추천할 장소가 없습니다.");
    }
}


function calculateTravelTimes(userLocation, places) {
    const resultList = document.getElementById("result-list");
    const service = new google.maps.DistanceMatrixService();

    const destinations = places.map(({ location }) => `${location.lat},${location.lng}`);
    const origin = `${userLocation.lat},${userLocation.lng}`;

    service.getDistanceMatrix(
        {
            origins: [origin],
            destinations: destinations,
            travelMode: google.maps.TravelMode.DRIVING,
        },
        (response, status) => {
            if (status === google.maps.DistanceMatrixStatus.OK) {
                const results = response.rows[0].elements;
                places.forEach((place, index) => {
                    const distanceInfo = results[index];
                    const travelTime = distanceInfo.duration ? distanceInfo.duration.text : "정보 없음";
                    const distance = distanceInfo.distance ? distanceInfo.distance.text : "정보 없음";

                    const listItem = document.createElement("li");
                    listItem.textContent = `${place.location.locName} (${place.location.address}), 거리: ${distance}, 시간: ${travelTime}`;
                    resultList.appendChild(listItem);
                });

                alert("추천된 장소와 이동 정보가 표시되었습니다.");
            } else {
                console.error("Distance Matrix API 호출 실패:", status);
                alert("이동 시간 정보를 가져오지 못했습니다.");
            }
        }
    );
}


function setSearchLocation(map) {
    const geocoder = new google.maps.Geocoder();
    const input = document.getElementById("search-location-input").value;

    if (!input) {
        alert("검색할 위치를 입력해주세요.");
        return;
    }

    // Geocoding API를 사용해 입력된 주소를 좌표로 변환
    geocoder.geocode({ address: input }, (results, status) => {
        if (status === google.maps.GeocoderStatus.OK) {
            const location = results[0].geometry.location;
            userLocation = { lat: location.lat(), lng: location.lng() };
            updateUserMarker(userLocation, map, "검색 위치");
            alert(`위치가 설정되었습니다: ${results[0].formatted_address}`);
        } else {
            alert("위치를 찾을 수 없습니다. 정확한 주소를 입력해주세요.");
        }
    });
}

// Google Places API를 통해 장소 세부 정보를 가져오는 함수
function fetchPlaceDetails(map, marker, location, infowindow) {
    const service = new google.maps.places.PlacesService(map);
    const queryString = `${location.locName}, ${location.address}`;
    console.log("Google Places API 요청 query:", queryString);

    const request = {
        query: queryString, // 장소 이름과 주소를 함께 사용하여 검색
        fields: ["name", "rating", "formatted_address", "photos", "place_id"] // 필드 확장
    };

    service.findPlaceFromQuery(request, (results, status) => {
        console.log("Google Places API 응답 상태:", status);
        console.log("검색 결과:", results);

        if (status === google.maps.places.PlacesServiceStatus.OK && results.length > 0) {
            const place = results[0];
            const starRating = place.rating ? `⭐ ${place.rating}` : "별점 없음";
            const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(queryString)}`;
            const photoUrl = place.photos && place.photos.length > 0
                ? place.photos[0].getUrl({ maxWidth: 400, maxHeight: 350 })
                : "";

            infowindow.setContent(`
                <div style="font-size: 12px; overflow-y: auto; width: 400px; height: 250px;">
                    ${photoUrl ? `<img src="${photoUrl}" alt="${place.name} 대표 사진" style="width: 100%; margin-bottom: 8px; border-radius: 6px;">` : ""}
                    <h3><a href="${googleMapsUrl}" target="_blank">${place.name}</a></h3>
                    <p><strong>주소:</strong> ${place.formatted_address || location.address}</p>
                    <p><strong>설명:</strong> ${location.description || "설명 없음"}</p>
                    <p><strong>별점:</strong> ${starRating}</p>
                </div>
            `);
            infowindow.open(map, marker);
        } else {
            console.error("Google Places API 요청 실패 또는 장소를 찾을 수 없음:", status);

            const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(queryString)}`;
            infowindow.setContent(`
                <div style="font-size: 12px; overflow-y: auto; width: 300px; height: 200px;">
                    <h3><a href="${googleMapsUrl}" target="_blank">${location.locName}</a></h3>
                    <p><strong>주소:</strong> ${location.address}</p>
                    <p><strong>설명:</strong> ${location.description || "설명 없음"}</p>
                    <p>Google 리뷰 정보를 찾을 수 없습니다.</p>
                </div>
            `);
            infowindow.open(map, marker);
        }
    });
}

// CSV 데이터를 JSON 형식으로 변환
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

// CSV 파일을 불러와 JSON 데이터로 변환 후 지도 초기화
fetch("../main/locationData.csv")
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

        // 지도 초기화
        window.initMap();
    })
    .catch(error => console.error("CSV 파일을 불러오는 중 오류 발생:", error));
