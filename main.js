// 캔버스에 월 숫자 표시
function drawMonth() {
    const canvas = document.getElementById("monthCanvas");
    const ctx = canvas.getContext("2d");

    // 캔버스 초기화
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 현재 월 가져오기
    const currentMonth = new Date().getMonth() + 1;

    // 텍스트 스타일 설정
    ctx.font = "bold 40px Arial"; // 글꼴 크기와 스타일
    ctx.fillStyle = "black"; // 텍스트 색상
    ctx.textAlign = "center"; // 텍스트 정렬
    ctx.textBaseline = "middle"; // 텍스트 기준선

    // 텍스트를 캔버스 중앙에 그리기
    ctx.fillText(`${currentMonth}`, canvas.width / 2, canvas.height / 2);
}

// 페이지 로드 후 실행
window.onload = drawMonth;
