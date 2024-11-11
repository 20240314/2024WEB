// 지도 초기화 함수
function initMap(locations) {  // locations 매개변수를 사용해 전달된 데이터를 마커로 표시
    const map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 37.5665, lng: 126.9780 }, // 서울 시청을 기준으로 초기 위치 설정
        zoom: 10,
    });

    // 전달받은 locations 데이터로 마커 추가
    locations.forEach(location => {
        new google.maps.Marker({
            position: { lat: location.lat, lng: location.lng }, // 마커의 위치 설정
            map,
            title: location.title, // 마커에 마우스를 올릴 때 나타날 텍스트
        });
    });
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

// CSV 파일 불러오기 및 JSON 변환
fetch("locationData.csv")
    .then(response => response.text())
    .then(csv => {
        const json = csvToJson(csv);
        console.log("CSV 파일이 JSON으로 변환되었습니다:", json);

        // JSON 데이터를 기반으로 locations 배열 생성
        const locations = json.map(data => ({
            lat: parseFloat(data.lat),       // 'lat' 열 이름에 맞게 수정
            lng: parseFloat(data.lng),       // 'lng' 열 이름에 맞게 수정
            title: data.title                // 'title' 열 이름에 맞게 수정
        }));
        
        initMap(locations);  // 생성된 locations 배열을 initMap 함수에 전달하여 마커 추가
    })
    .catch(error => console.error("CSV 파일을 불러오는 중 오류 발생:", error));

// 검색 기능 추가 함수
function searchLocation(query) {
    const results = jsonData.filter(location => location.title.includes(query));  // 'title'로 검색
    console.log("검색 결과:", results);
}
