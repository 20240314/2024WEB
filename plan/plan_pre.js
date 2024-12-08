let jsonData = [];
let markers = [];
let userLocation = null; // 사용자 위치 저장

// locType별 아이콘 색상 설정
const markerColors = {
    cafe: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
    playground: "https://maps.google.com/mapfiles/ms/icons/yellow-dot.png",
    restaurant: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
    station: "https://maps.google.com/mapfiles/ms/icons/purple-dot.png",
    stay: "https://maps.google.com/mapfiles/ms/icons/orange-dot.png",
    store: "https://maps.google.com/mapfiles/ms/icons/pink-dot.png"
};

// window.initMap을 글로벌 함수로 정의 (Google Maps API에서 호출 가능하도록)
// window.initMap을 글로벌 함수로 정의 (Google Maps API에서 호출 가능하도록)
window.initMap = function() {
    const map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 37.5665, lng: 126.9780 }, // 기본 위치: 서울
        zoom: 10,
    });

    const infowindow = new google.maps.InfoWindow();

    // 사용자 위치 가져오기
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            userLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            console.log("사용자 위치:", userLocation);

            // 사용자의 위치를 지도 중심으로 설정
            map.setCenter(userLocation);
            
            // 사용자 위치 마커 추가 (검정색으로 변경)
            new google.maps.Marker({
                position: userLocation,
                map: map,
                title: "당신의 위치",
                icon: "https://maps.google.com/mapfiles/ms/icons/black-dot.png"  // 검정색 마커 아이콘 사용
            });

            // JSON 데이터를 기반으로 마커 추가
            jsonData.forEach(location => {
                const markerIcon = markerColors[location.locType] || markerColors["store"];
                const marker = new google.maps.Marker({
                    position: { lat: location.lat, lng: location.lng },
                    map,
                    title: location.locName,
                    icon: markerIcon
                });

                marker.addListener("click", () => {
                    fetchPlaceDetails(map, marker, location, infowindow);
                });

                markers.push({ marker, type: location.locType });
            });
        }, () => {
            alert("위치 정보를 가져오는 데 실패했습니다. 위치 권한을 확인해주세요.");
        });
    } else {
        alert("Geolocation을 지원하지 않는 브라우저입니다.");
    }
};


// Google Places API를 통해 장소 세부 정보를 가져오는 함수
function fetchPlaceDetails(map, marker, location, infowindow) {
    const service = new google.maps.places.PlacesService(map);
    const request = {
        query: `${location.locName}, ${location.address}`, // 장소 이름과 주소를 함께 사용하여 검색
        fields: ["rating", "photos"] // 평점 및 사진 정보 가져오기
    };

    service.findPlaceFromQuery(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results.length > 0) {
            const place = results[0];
            const starRating = place.rating ? `⭐ ${place.rating}` : "별점 없음";
            const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location.locName)}+${encodeURIComponent(location.address)}`;
            const photoUrl = place.photos && place.photos.length > 0 ? place.photos[0].getUrl({ maxWidth: 400, maxHeight: 350 }) : "";

            infowindow.setContent(`
                <div style="font-size: 12px; overflow-y: auto; width: 400px; height: 250px;">
                    ${photoUrl ? `<img src="${photoUrl}" alt="${location.locName} 대표 사진" style="width: 100%; margin-bottom: 8px; border-radius: 6px;">` : ""}
                    <h3><a href="${googleMapsUrl}" target="_blank">${location.locName}</a></h3>
                    <p><strong>주소:</strong> ${location.address}</p>
                    <p><strong>설명:</strong> ${location.description}</p>
                    <p><strong>별점:</strong> ${starRating}</p>
                </div>
            `);
            infowindow.open(map, marker);
        } else {
            console.log("Google Places API 요청 실패 또는 장소를 찾을 수 없음:", status);
            const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location.locName)}+${encodeURIComponent(location.address)}`;

            infowindow.setContent(`
                <div style="font-size: 12px; overflow-y: auto; width: 300px; height: 200px;">
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

// 여행 코스 생성 함수
function generateRoute() {
    console.log("여행 코스 생성 버튼 클릭됨");

    if (!userLocation) {
        alert("사용자 위치를 확인할 수 없습니다. 위치 권한을 확인해주세요.");
        return;
    }

    // 사용자가 입력한 값을 읽어옵니다
    const cafeCount = parseInt(document.getElementById("cafe-count").value) || 0;
    const playgroundCount = parseInt(document.getElementById("playground-count").value) || 0;
    const restaurantCount = parseInt(document.getElementById("restaurant-count").value) || 0;
    const stationCount = parseInt(document.getElementById("station-count").value) || 0;
    const stayCount = parseInt(document.getElementById("stay-count").value) || 0;
    const storeCount = parseInt(document.getElementById("store-count").value) || 0;

    // 30km 이내 장소 필터링
    const nearbyPlaces = jsonData.filter(location => {
        const distance = calculateDistance(userLocation.lat, userLocation.lng, location.lat, location.lng);
        return distance <= 30; // 30km 이내의 장소만 필터링
    });

    console.log("30km 이내 장소:", nearbyPlaces);

    // 장소 유형별 필터링
    filterMarkersByUserInput("cafe", cafeCount, nearbyPlaces);
    filterMarkersByUserInput("playground", playgroundCount, nearbyPlaces);
    filterMarkersByUserInput("restaurant", restaurantCount, nearbyPlaces);
    filterMarkersByUserInput("station", stationCount, nearbyPlaces);
    filterMarkersByUserInput("stay", stayCount, nearbyPlaces);
    filterMarkersByUserInput("store", storeCount, nearbyPlaces);
}

// 두 좌표 간의 거리(킬로미터)를 계산하는 함수 (Haversine Formula)
function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // 결과값: km
}

// 버튼 클릭 이벤트 추가
document.getElementById("generate-route-button").addEventListener("click", generateRoute);
