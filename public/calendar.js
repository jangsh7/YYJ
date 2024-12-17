// Firestore 초기화
const firebaseConfig = {
    apiKey: "AIzaSyAx3iFpiJFVA_UTyHSKw0m1Ke2GEns1TJA",
    authDomain: "yyjdb-1e121.firebaseapp.com",
    projectId: "yyjdb-1e121",
    storageBucket: "gs://yyjdb-1e121.firebasestorage.app",
    messagingSenderId: "455353963754",
    appId: "1:455353963754:web:2a64f5411a4061e9143393"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const storage = firebase.storage();
console.log("Firebase initialized.");

// 로그인된 사용자 ID 가져오기
const loggedInUser = sessionStorage.getItem("userID")|| "익명";
console.log("Logged-in user ID:", loggedInUser);

// 승률 계산 함수
async function calculateWinRate() {
    try {
        if (!loggedInUser) {
            console.error("로그인한 사용자 정보가 없습니다.");
            return;
        }

        // Diaries 컬렉션에서 로그인한 사용자(author)가 작성한 다이어리 가져오기
        const diariesSnapshot = await db.collection("Diaries").where("author", "==", loggedInUser).get();

        console.log("Diaries Query Result:", diariesSnapshot); // 결과 확인
        console.log("Number of documents:", diariesSnapshot.size); // 문서 개수 확인

        if (diariesSnapshot.empty) {
            console.warn("해당 사용자의 다이어리가 존재하지 않습니다.");
            document.getElementById("winRate").value = "0.0%";
            document.getElementById("winsInput").value = 0;
            document.getElementById("lossesInput").value = 0;
            document.getElementById("drawsInput").value = 0;
            return;
        }

        let wins = 0;
        let losses = 0;
        let draws = 0;

        // result 필드를 기반으로 승/패/무 계산
        diariesSnapshot.forEach((doc) => {
            const data = doc.data();
            console.log("다이어리 데이터:", data);
            if (data.diaryData.result === "win") wins++;
            else if (data.diaryData.result === "lose") losses++;
            else if (data.diaryData.result === "draw") draws++;
        });
        
        const totalGames = wins + losses + draws;
        const winRate = totalGames > 0 ? ((wins / totalGames) * 100).toFixed(1) : 0.0;

        console.log(`승: ${wins}, 패: ${losses}, 무: ${draws}, 승률: ${winRate}%`);

        // 각 입력 필드에 값 출력
        document.getElementById("winsInput").value = wins;
        document.getElementById("lossesInput").value = losses;
        document.getElementById("drawsInput").value = draws;
        document.getElementById("winRate").value = `${winRate}%`;

    } catch (error) {
        console.error("승률 계산 중 오류 발생:", error);
    }
}

// 페이지 로드 시 승률 계산 실행
window.addEventListener('load', calculateWinRate);

function checkForAlert() {
    const urlParams = new URLSearchParams(window.location.search);
    const alertMessage = urlParams.get('alert'); // 'alert' 키 값 확인

    if (alertMessage) {
        alert(decodeURIComponent(alertMessage));
        history.replaceState({}, document.title, window.location.pathname);
    }
}
window.addEventListener('load', checkForAlert);

// 특정 날짜의 경기를 select로 표시
async function showGameOptions(date, event) {
    try {
        // schedule.json 데이터 로드
        const response = await fetch("schedule.json");
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const schedule = await response.json();

        // 날짜를 "09.19(목)" 형식으로 변환
        const dateObj = new Date(date);
        const formattedDate = `${String(dateObj.getMonth() + 1).padStart(2, '0')}.${String(dateObj.getDate()).padStart(2, '0')}(${['일', '월', '화', '수', '목', '금', '토'][dateObj.getDay()]})`;

        // 해당 날짜의 경기 필터링
        const gamesOnDate = schedule.filter(game => game.day === formattedDate);

        if (gamesOnDate.length === 0) {
            alert("해당 날짜에 경기가 없습니다.");
            return;
        }

        // 기존 select 제거
        const existingSelect = document.getElementById("dynamicGameSelect");
        if (existingSelect) existingSelect.remove();

        // select 엘리먼트 생성
        const select = document.createElement("select");
        select.id = "dynamicGameSelect"; // id 추가
        select.classList.add("form-select", "form-select-sm");
        select.setAttribute("aria-label", "Small select example");

        const defaultOption = document.createElement("option");
        defaultOption.selected = true;
        defaultOption.textContent = "경기 선택";
        select.appendChild(defaultOption);

        // 경기 옵션 추가 (점수 제거)
        gamesOnDate.forEach((game, index) => {
            const option = document.createElement("option");

            // 점수 제거하고 팀명만 추출 (정규식 사용)
            const gameContentRegex = /([가-힣a-zA-Z]+)\d*vs\d*([가-힣a-zA-Z]+)/;
            const match = gameContentRegex.exec(game.gameContent);

            if (match) {
                option.value = index;
                option.textContent = `${match[1]} vs ${match[2]}`;
            } else {
                option.value = index;
                option.textContent = game.gameContent; // 기본 텍스트
            }

            select.appendChild(option);
        });

        // 선택 시 diary.html로 이동
        select.addEventListener("change", () => {
            const selectedIndex = select.value;
            if (selectedIndex) {
                const selectedGame = gamesOnDate[selectedIndex];
                window.location.href = `diary.html?date=${date}&game=${encodeURIComponent(selectedGame.gameContent)}`;
            }
        });

        // 동적으로 select 위치 설정
        select.style.position = "absolute";
        select.style.left = `${event.pageX}px`;
        select.style.top = `${event.pageY}px`;
        select.style.zIndex = "1000";

        document.body.appendChild(select);

        // select가 포커스를 잃으면 제거
        select.addEventListener("blur", () => {
            select.remove();
        });

        // select 표시 후 포커스
        select.focus();
    } catch (error) {
        console.error("Error loading game data:", error);
    }
}