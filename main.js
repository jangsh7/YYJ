<<<<<<< HEAD
"use strict";

const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const config = require("./config");
const userRoutes = require("./model/user-routes");



app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

// 정적 파일 제공 (public 디렉토리)
//app.use(express.static(path.join(__dirname, "public")));
// 정적 파일 제공 설정
app.use(express.static('public'));


// 기본 경로로 요청 시 login.html 제공
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "login.html"));
});

// API 라우트
app.use("/api", userRoutes.routes);

// 서버 시작
app.listen(config.port, () =>
  console.log("App is Listening on url http://localhost:" + config.port)
);
=======
function checkForAlert() {
    const urlParams = new URLSearchParams(window.location.search);
    const alertMessage = urlParams.get('alert'); // 'alert' 키 값 확인

    if (alertMessage) {
        alert(decodeURIComponent(alertMessage));
        history.replaceState({}, document.title, window.location.pathname);
    }
}
window.onload = checkForAlert;

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
>>>>>>> 6b7a8f57e464eb65ea3ebbfaa1aa78a978195254
