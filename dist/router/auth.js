"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = void 0;
/* eslint consistent-return: 0 */
const express_1 = require("express");
const admin = __importStar(require("firebase-admin"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const passport_1 = __importDefault(require("passport"));
const crypto = __importStar(require("crypto"));
const dotenv_1 = __importDefault(require("dotenv"));
const functions = __importStar(require("../config/functions"));
const util = __importStar(require("../config/util"));
const classes = __importStar(require("../config/classes"));
const index_1 = require("../models/index");
dotenv_1.default.config();
exports.auth = express_1.Router();
exports.auth.post('/signup', (req, res, next) => {
    passport_1.default.authenticate('signup', (err, _user, info) => __awaiter(void 0, void 0, void 0, function* () {
        if (err) {
            return res.status(403).json(util.successFalse(err, '', null));
        }
        if (info) {
            return res.status(403).json(util.successFalse(null, info, null));
        }
        if (_user) {
            const user = new classes.MyInfo(_user);
            return res.json(util.successTrue('', user));
        }
    }))(req, res, next);
});
exports.auth.post('/login', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    passport_1.default.authenticate('login', { session: false }, (err, user, info) => {
        if (info)
            return res.status(403).json(util.successFalse(null, 'ID or PW is not valid', null));
        if (err || !user) {
            return res.status(403).json(util.successFalse(null, err, null));
        }
        req.logIn(user, { session: false }, (error) => __awaiter(void 0, void 0, void 0, function* () {
            if (error)
                return res.status(403).json(util.successFalse(error, '로그인을 실패했습니다.', null));
            const result = yield functions.getAuthToken(user);
            return res.json(util.successTrue('', { firebaseToken: result.firebaseToken, token: result.authToken, grade: user.grade }));
        }));
    })(req, res, next);
}));
exports.auth.get('/login', util.isLoggedin, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        req.body.id = req.decoded.userId;
        passport_1.default.authenticate('silent_login', { session: false }, (err, user, info) => {
            if (info)
                return res.status(403).json(util.successFalse(null, '로그인을 실패했습니다.', null));
            if (err || !user) {
                return res.status(403).json(util.successFalse(null, err, null));
            }
            req.logIn(user, { session: false }, (error) => __awaiter(void 0, void 0, void 0, function* () {
                if (error)
                    return res.status(403).json(util.successFalse(error, '로그인을 실패했습니다.', null));
                const result = yield functions.getAuthToken(user);
                return res.json(util.successTrue('', { firebaseToken: result.firebaseToken, token: result.authToken, grade: user.grade }));
            }));
        })(req, res, next);
    }
    catch (e) {
        // console.log(e);
        return res.status(403).json(util.successFalse(null, '에러.', null));
    }
}));
exports.auth.post('/login/fcm', util.isLoggedin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const tokenData = req.decoded;
    const reqBody = req.body;
    try {
        const user = yield index_1.userRep.findOne({ where: { id: tokenData.id } });
        if (!user)
            return res.status(403).json(util.successFalse(null, '회원이 없습니다.', null));
        yield user.update({ firebaseFCM: reqBody.fcmToken });
        return res.json(util.successTrue('', null));
    }
    catch (e) {
        // console.log(e);
        return res.status(403).json(util.successFalse(null, '에러.', null));
    }
}));
exports.auth.post('/login/google', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const reqBody = req.body;
    try {
        const { idToken } = reqBody;
        const user = yield functions.getUserFromGoogleInfo(idToken);
        if (!user)
            return res.status(403).json(util.successFalse(null, '회원이 없습니다.', null));
        if (!user.user)
            return res.status(403).json(util.successFalse(null, '회원이 없습니다.', null));
        yield user.user.update({ firebaseFCM: req.body.fcmToken });
        const result = yield functions.getAuthToken(user.user);
        return res.json(util.successTrue('', { firebaseToken: result.firebaseToken, token: result.authToken, grade: user.user.grade }));
    }
    catch (e) {
        // console.log(e);
        return res.status(403).json(util.successFalse(null, 'Retry.', null));
    }
}));
exports.auth.post('/login/kakao', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const reqBody = req.body;
    try {
        const { accessToken } = reqBody;
        const user = yield functions.getUserFromKakaoInfo(accessToken);
        if (!user)
            return res.status(403).json(util.successFalse(null, '회원이 없습니다.', null));
        if (!user.user)
            return res.status(403).json(util.successFalse(null, '회원이 없습니다.', null));
        yield user.user.update({ firebaseFCM: req.body.fcmToken });
        const result = yield functions.getAuthToken(user.user);
        return res.json(util.successTrue('', { firebaseToken: result.firebaseToken, token: result.authToken, grade: user.user.grade }));
    }
    catch (e) {
        // console.log('Error at login/kakao');
        return res.status(403).json(util.successFalse(null, 'Retry.', null));
    }
}));
exports.auth.get('/refresh', util.isLoggedin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield index_1.userRep.findOne({ where: { userId: req.decoded.userId } });
    if (!user) {
        return res.status(403).json(util.successFalse(null, "Can't refresh the token", { user }));
    }
    const authToken = jsonwebtoken_1.default.sign(Object.assign({}, new classes.payLoad(user)), process.env.JWT_SECRET, {
        expiresIn: '7d',
    });
    return res.json(util.successTrue('', { token: authToken, grade: user.grade }));
}));
exports.auth.post('/sms', /* util.isLoggedin, */ (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const reqBody = req.body;
    const { phone } = reqBody;
    const result = yield functions.sendSMS(phone, 0);
    if (result == null)
        return res.json(util.successTrue('문자 전송 성공', null));
    return res.status(403).json(util.successFalse(null, result, null));
}));
exports.auth.post('/sms/verification', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const reqBody = req.body;
    const { verify } = reqBody;
    const { phone } = reqBody;
    const result = yield functions.smsVerify(phone, verify);
    if (result == null)
        return res.json(util.successTrue('전화번호 인증 성공', null));
    return res.status(403).json(util.successFalse(null, result, null));
}));
exports.auth.post('/email', /* util.isLoggedin, */ (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const reqBody = req.body;
    const { email } = reqBody;
    const result = yield functions.sendEmail(email, req.get('host'), 0);
    if (result == null)
        return res.json(util.successTrue('이메일 전송 성공', null));
    return res.status(403).json(util.successFalse('', result, ''));
}));
exports.auth.get('/email/verification', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const reqQuery = req.query;
    const email_number = reqQuery.email_number;
    const result = yield functions.emailVerify(email_number);
    if (result == null)
        return res.json(util.successTrue('이메일 인증 성공', null));
    return res.status(403).json(util.successFalse(null, result, null));
}));
exports.auth.delete('/release', util.isLoggedin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const tokenData = req.decoded;
    const user = yield index_1.userRep.findOne({ where: { id: tokenData.id } });
    if (!user)
        return res.status(403).json(util.successFalse(null, '회원이 없습니다.', null));
    yield admin.auth().deleteUser(user.firebaseUid);
    yield user.destroy({ force: true });
    return res.json(util.successTrue('사용자 삭제 완료', null));
}));
exports.auth.post('/find/sms', /* util.isLoggedin, */ (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const reqBody = req.body;
    const { phone } = reqBody;
    const result = yield functions.sendSMS(phone, 1);
    if (result == null)
        return res.json(util.successTrue('문자 전송 성공', null));
    return res.status(403).json(util.successFalse(null, result, null));
}));
exports.auth.post('/findid', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const reqBody = req.body;
    const reqQuery = req.query;
    // 인증 절차 거치고 success로 return
    const success = parseInt(reqBody.success, 10);
    if (!success)
        return res.status(403).json(util.successFalse(null, '인증에 실패하였습니다.', null));
    // 이메일로 찾기
    if (reqQuery.status === '1') {
        if (!reqBody.email)
            return res.status(403).json(util.successFalse(null, '이메일을 입력해주세요.', null));
        const user = yield index_1.userRep.findOne({ where: { email: reqBody.email }, attributes: ['userId'] });
        if (!user)
            return res.status(403).json(util.successFalse(null, '해당 이메일로 가입한 유저가 없습니다', null));
        return res.json(util.successTrue('사용자 아이디입니다.', user));
    }
    // 폰 인증으로 찾기
    if (reqQuery.status === '2') {
        if (!reqBody.phone)
            return res.status(403).json(util.successFalse(null, '번호를 입력해주세요.', null));
        const user = yield index_1.userRep.findOne({ where: { phone: reqBody.phone }, attributes: ['userId'] });
        if (!user)
            return res.status(403).json(util.successFalse(null, '해당 번호로 가입한 유저가 없습니다.', null));
        return res.json(util.successTrue('사용자 아이디입니다.', user));
    }
    return res.status(403).json(util.successFalse(null, '입력을 확인해주세요.', null));
}));
exports.auth.post('/findpw', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const reqBody = req.body;
    // 인증 절차 거치고 success로 return
    const success = parseInt(reqBody.success, 10);
    if (!success)
        return res.status(403).json(util.successFalse(null, '인증에 실패하였습니다.', null));
    const { userId } = reqBody;
    let randomString = '';
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz';
    const string_length = 8;
    for (let i = 0; i < string_length; i += 1) {
        const rnum = Math.floor(Math.random() * chars.length);
        randomString += chars.substring(rnum, rnum + 1);
    }
    let salt = null;
    let hashedPw = null;
    const buffer = crypto.randomBytes(64);
    salt = buffer.toString('base64');
    const key = crypto.pbkdf2Sync(randomString, salt, 100000, 64, 'sha512');
    hashedPw = key.toString('base64');
    const user = yield index_1.userRep.findOne({ where: { userId } });
    if (!user)
        return res.status(403).json(util.successFalse(null, '해당 아이디의 유저가 존재하지 않습니다.', null));
    const result = yield functions.pwEmail(user.email, randomString);
    yield user.update({ password: hashedPw, salt });
    if (result == null)
        return res.json(util.successTrue('임시 비밀번호가 전송되었습니다. 이메일을 확인해주세요.', null));
    return res.status(403).json(util.successFalse(null, '비밀번호 변경에 실패하였습니다.', null));
}));
exports.auth.get('/dupid', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const reqQuery = req.query;
    const userId = reqQuery.userId;
    const user = yield index_1.userRep.findOne({ where: { userId } });
    if (!user)
        return res.status(403).json(util.successFalse(null, '해당 아이디의 유저가 존재하지 않습니다.', null));
    return res.json(util.successTrue('아이디가 존재합니다.', user));
}));
exports.auth.post('/find/emailVeri', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const reqBody = req.body;
    const { email, verify } = reqBody;
    const result = yield functions.findemailVerify(email, verify);
    if (result == null)
        return res.json(util.successTrue('이메일 인증 성공', null));
    return res.status(403).json(util.successFalse(null, result, null));
}));
exports.auth.post('/find/email', /* util.isLoggedin, */ (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const reqBody = req.body;
    const { email } = reqBody;
    const result = yield functions.findEmail(email);
    if (result == null)
        return res.json(util.successTrue('이메일 전송 성공', null));
    return res.status(403).json(util.successFalse('', result, ''));
}));
