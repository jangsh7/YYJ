const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function scrapeSchedule() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // 페이지 이동
    await page.goto('https://www.koreabaseball.com/Schedule/Schedule.aspx');

    // 'KBO 시범경기 일정' 선택 및 3월로 선택
    await page.select('#ddlSeries', '1'); // 'KBO 시범경기 일정' 값이 1인 경우
    await page.select('#ddlMonth', '03'); // 3월

    // getTableGridList() 호출
    await page.evaluate(() => {
        getTableGridList();
    });

    // 일정 정보 가져오기
    await page.waitForSelector('#tblScheduleList tbody');
    const schedule = await page.evaluate(() => {
        const rows = Array.from(document.querySelectorAll('#tblScheduleList tbody tr'));
        let lastDay = ''; // 이전 경기의 날짜를 저장할 변수

        return rows.map(row => {
            const dayCell = row.querySelector('.day');
            const timeCell = row.querySelector('.time');
            const gameContentCell = row.querySelector('.play');
            const stadiumCell = row.querySelector('td:nth-child(7)'); // 7번째 열: 구장
            const rainCell = row.querySelector('td:nth-child(8)'); // 8번째 열: 우천취소 여부

            // 날짜가 있는 경우 저장, 없는 경우 이전 날짜 사용
            let day = dayCell ? dayCell.innerText.trim() : lastDay;
            if (dayCell) lastDay = day; // 날짜가 새로 있으면 업데이트

            // 시간, 경기 내용, 구장, 우천취소 여부
            const time = timeCell ? timeCell.innerText.trim() : '-';
            const gameContent = gameContentCell ? gameContentCell.innerText.trim() : '-';
            let stadium = stadiumCell ? stadiumCell.innerText.trim() : '-';
            let rain = rainCell && rainCell.innerText.includes("우천취소") ? 1 : 0;

            return { day, time, gameContent, stadium, rain };
        });
    });

    // JSON 파일로 저장
    fs.writeFileSync(path.join(__dirname, 'schedule.json'), JSON.stringify(schedule, null, 2), 'utf-8');
    console.log("스크래핑된 데이터가 schedule.json에 저장되었습니다.");

    await browser.close();
}

scrapeSchedule().catch(console.error);
