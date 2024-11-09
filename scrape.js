const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function scrapeSchedule() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    let fullSchedule = [];

    // 페이지 이동
    await page.goto('https://www.koreabaseball.com/Schedule/Schedule.aspx');

    // 스크래핑 함수
    async function scrapeData(series, months) {
        // 시즌 선택 (프리시즌 또는 정규시즌)
        await page.select('#ddlSeries', series);

        for (const month of months) {
            // 월 선택
            await page.select('#ddlMonth', month.toString().padStart(2, '0'));

            // getTableGridList() 호출
            await page.evaluate(() => {
                getTableGridList();
            });

            // 데이터 가져오기
            await page.waitForSelector('#tblScheduleList tbody');
            const schedule = await page.evaluate(() => {
                const rows = Array.from(document.querySelectorAll('#tblScheduleList tbody tr'));
                let lastDay = '';

                return rows.map(row => {
                    const dayCell = row.querySelector('.day');
                    const timeCell = row.querySelector('.time');
                    const gameContentCell = row.querySelector('.play');

                    // dayCell이 존재하는 경우와 존재하지 않는 경우에 따라 stadiumCell과 rainCell의 위치를 조정
                    const stadiumCell = dayCell ? row.querySelector('td:nth-child(8)') : row.querySelector('td:nth-child(7)');
                    const rainCell = dayCell ? row.querySelector('td:nth-child(9)') : row.querySelector('td:nth-child(8)');

                    let day = dayCell ? dayCell.innerText.trim() : lastDay;
                    if (dayCell) lastDay = day;

                    const time = timeCell ? timeCell.innerText.trim() : '-';
                    const gameContent = gameContentCell ? gameContentCell.innerText.trim() : '-';
                    const stadium = stadiumCell ? stadiumCell.innerText.trim() : '-';
                    const rain = rainCell && rainCell.innerText.includes("우천취소") ? 1 : 0;

                    return { day, time, gameContent, stadium, rain };
                });
            });

            // 해당 월 데이터 추가
            fullSchedule = fullSchedule.concat(schedule);
            console.log(`Scraped data for series ${series}, month ${month}.`);
        }
    }

    // 프리시즌(3월) 스크래핑
    await scrapeData('1', [3]);

    // 정규시즌(3월~10월) 스크래핑
    await scrapeData('0,9,6', [3, 4, 5, 6, 7, 8, 9, 10]);

    // JSON 파일로 저장
    fs.writeFileSync(path.join(__dirname, 'schedule.json'), JSON.stringify(fullSchedule, null, 2), 'utf-8');
    console.log("All scraped data (preseason and regular season) has been saved to schedule.json.");

    await browser.close();
}

scrapeSchedule().catch(console.error);
