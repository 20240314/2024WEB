    // 처음부터 다시 해야할 듯.

    let userLocation = { lat: 37.5665, lng: 126.9780 }; // 서울의 기본 위치
    let jsonData = [];
    let markers = [];
    let map;

    // Haversine 공식을 이용한 거리 계산 (단위: km)
    function getDistance(lat1, lng1, lat2, lng2) {
        const R = 6371; // 지구 반경 (단위: km)
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLng = (lng2 - lng1) * (Math.PI / 180);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; // km 단위 반환
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

    // 사용자 위치를 가져오는 함수
    function getUserLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                console.log("사용자 위치:", userLocation);
                map.setCenter(userLocation);  // 지도 중심을 사용자 위치로 설정
                addUserMarker();  // 사용자 위치 마커 추가
            }, () => {
                alert("위치 정보를 가져오는 데 실패했습니다. 위치 권한을 확인해주세요.");
            });
        } else {
            alert("Geolocation을 지원하지 않는 브라우저입니다.");
        }
    }

    // 사용자 위치에 마커를 추가하는 함수
    function addUserMarker() {
        new google.maps.Marker({
            position: userLocation,
            map: map,
            title: "당신의 위치",
            icon: "https://maps.google.com/mapfiles/ms/icons/black-dot.png"
        });
    }

    // 30km 이내의 장소만 필터링하는 함수
    function filterLocationsByDistance(locations, maxDistance) {
        return locations.filter(location => {
            const distance = getDistance(userLocation.lat, userLocation.lng, location.lat, location.lng);
            return distance <= maxDistance;  // 30km 이내인 장소만 필터링
        });
    }

    // 여행 코스를 생성하는 함수
    function generateRoute() {
        const cafeCount = document.getElementById('cafe-count').value;
        const playgroundCount = document.getElementById('playground-count').value;
        const restaurantCount = document.getElementById('restaurant-count').value;
        const stationCount = document.getElementById('station-count').value;
        const stayCount = document.getElementById('stay-count').value;
        const storeCount = document.getElementById('store-count').value;

        const locationCounts = {
            cafe: parseInt(cafeCount),
            playground: parseInt(playgroundCount),
            restaurant: parseInt(restaurantCount),
            station: parseInt(stationCount),
            stay: parseInt(stayCount),
            store: parseInt(storeCount)
        };

        const selectedLocations = [];
        jsonData.forEach(location => {
            // 사용자가 설정한 카테고리별 장소 개수만큼 선택
            if (locationCounts[location.locType] > 0 && selectedLocations.length < locationCounts[location.locType]) {
                selectedLocations.push(location);
                locationCounts[location.locType]--;
            }
        });

        // 30km 이내의 장소만 필터링
        const nearbyLocations = filterLocationsByDistance(selectedLocations, 30);
        
        // 지도에 마커 추가
        nearbyLocations.forEach(location => {
            const marker = new google.maps.Marker({
                position: { lat: location.lat, lng: location.lng },
                map: map,
                title: location.locName,
                icon: markerColors[location.locType]
            });
            markers.push(marker);
        });
    }

    // initMap 함수 정의
    function initMap() {
        map = new google.maps.Map(document.getElementById("map"), {
            center: { lat: 37.5665, lng: 126.9780 }, // 서울
            zoom: 12
        });

        // 사용자 위치 가져오기
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };

                // 사용자 위치 마커 추가
                new google.maps.Marker({
                    position: userLocation,
                    map: map,
                    title: "당신의 위치",
                    icon: "https://maps.google.com/mapfiles/ms/icons/black-dot.png"
                });

                // 지도 중심을 사용자 위치로 설정
                map.setCenter(userLocation);
            }, () => {
                alert("위치 정보를 가져오는 데 실패했습니다.");
            });
        }
    }
