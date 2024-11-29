"use strict";

const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const config = require("./config");
const userRoutes = require("./model/user-routes");
const nodemailer = require("nodemailer");

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

// Nodemailer 설정
const transporter = nodemailer.createTransport({
    service: "gmail", // gmail 사용
    auth: {
        user: "ossyyj@gmail.com", // 발신 이메일 주소
        pass: "yxwv vupw rzct drqz", // 앱 비밀번호
    },
});

// 아이디 전송 엔드포인트
app.post("/send-id", (req, res) => {
    const { email, userId } = req.body;

    const mailOptions = {
        from: "ossyyj@gmail.com",
        to: email,
        subject: "[요야정] 요청하신 아이디입니다.",
        text: `안녕하세요! 요청하신 아이디는 다음과 같습니다:\n\n아이디: ${userId}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error("Error sending email:", error);
            res.status(500).send("Email not sent");
        } else {
            console.log("Email sent:", info.response);
            res.status(200).send("Email sent");
        }
    });
});

// 비밀번호 전송 엔드포인트
app.post("/send-password", (req, res) => {
    const { email, password } = req.body;

    const mailOptions = {
        from: "your-email@gmail.com",
        to: email,
        subject: "[요야정] 요청하신 비밀번호입니다.",
        text: `안녕하세요! 요청하신 비밀번호는 다음과 같습니다:\n\n비밀번호: ${password}\n\n비밀번호는 외부에 유출되지 않도록 주의해주세요.`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error("Error sending email:", error);
            res.status(500).send("Failed to send email.");
        } else {
            console.log("Email sent successfully:", info.response);
            res.status(200).send("Email sent successfully.");
        }
    });
});

// 서버 시작
app.listen(config.port, () =>
    console.log("App is Listening on url http://localhost:" + config.port)
);