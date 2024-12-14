// 전역 변수를 선언합니다.
let jsonData = [];
let markers = [];

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
window.initMap = function() {
    const map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 37.5665, lng: 126.9780 },  // 기본 위치: 서울
        zoom: 10,
    });

    const infowindow = new google.maps.InfoWindow();

    // 사용자의 현재 위치를 가져오기
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userLocation = {
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

                // 지도 중심을 현재 위치로 설정
                map.setCenter(userLocation);
                map.setZoom(14);
            },
            (error) => {
                console.error("위치 정보를 가져오는 중 오류 발생:", error);
                alert("현재 위치를 가져올 수 없습니다.");
            }
        );
    } else {
        alert("브라우저가 위치 정보를 지원하지 않습니다.");
    }

    // JSON 데이터를 기반으로 마커 추가 (초기에는 지도에 추가하지 않음)
    jsonData.forEach(location => {
        const markerIcon = markerColors[location.locType] || markerColors["store"];
        const marker = new google.maps.Marker({
            position: { lat: location.lat, lng: location.lng },
            map: null, // 초기에는 지도에 추가하지 않음
            title: location.locName,
            icon: markerIcon
        });

        marker.addListener("click", () => {
            fetchPlaceDetails(map, marker, location, infowindow);
        });

        markers.push({ marker, type: location.locType });
    });
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

// CSV 데이터를 JSON 형식으로 변환하는 함수
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

// 마커 필터링 함수
function filterMarkers(type) {
    markers.forEach(({ marker, type: markerType }) => {
        if (type === 'all' || markerType === type) {
            marker.setMap(map);
        } else {
            marker.setMap(null);
        }
    });
}

// CSV 파일을 불러와서 JSON 데이터로 변환 후 지도 초기화
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

        // CSV 데이터를 불러온 후 지도 초기화
        window.initMap();
    })
    .catch(error => console.error("CSV 파일을 불러오는 중 오류 발생:", error));
