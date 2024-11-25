document.querySelectorAll('.calendar-day').forEach(day => {
    day.addEventListener('click', () => {
        const selectedDate = day.textContent.trim(); // 날짜 값 추출
        const year = currentDate.getFullYear();
        const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
        const fullDate = `${year}.${month}.${selectedDate.padStart(2, '0')}`; // yyyy.MM.dd 형식으로 변환

        // `diary.html`로 이동하며 날짜 전달
        window.location.href = `diary.html?date=${fullDate}`;
    });
});

function checkForAlert() {
    const urlParams = new URLSearchParams(window.location.search);
    const alertMessage = urlParams.get('alert'); // 'alert' 키 값 확인

    if (alertMessage) {
        alert(decodeURIComponent(alertMessage));
        history.replaceState({}, document.title, window.location.pathname);
    }
}
window.onload = checkForAlert;