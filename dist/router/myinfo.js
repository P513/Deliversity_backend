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
exports.myinfo = void 0;
/* eslint consistent-return: 0 */
const express_1 = require("express");
const crypto = __importStar(require("crypto"));
const dotenv_1 = __importDefault(require("dotenv"));
const axios_1 = __importDefault(require("axios"));
const db = __importStar(require("sequelize"));
const index_1 = require("../models/index");
const util = __importStar(require("../config/util"));
const classes_1 = require("../config/classes");
dotenv_1.default.config();
exports.myinfo = express_1.Router();
exports.myinfo.get('/', util.isLoggedin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // 본인 정보 반환
    const tokenData = req.decoded;
    try {
        const _user = yield index_1.userRep.findOne({ where: { id: tokenData.id } });
        if (!_user)
            return res.status(403).json(util.successFalse(null, '해당 하는 유저가 없습니다.', null));
        const user = new classes_1.MyInfo(_user);
        return res.json(util.successTrue('', user));
    }
    catch (err) {
        return res.status(403).json(util.successFalse(err, '', null));
    }
}));
exports.myinfo.put('/', util.isLoggedin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // 본인 정보 수정
    const tokenData = req.decoded;
    const reqBody = req.body;
    let salt = null;
    let hashedPw = null;
    try {
        let _user = yield index_1.userRep.findOne({ where: { id: tokenData.id } });
        if (!_user)
            return res.status(403).json(util.successFalse(null, '해당 하는 유저가 없습니다.', null));
        if (reqBody.pw) {
            const buffer = crypto.randomBytes(64);
            salt = buffer.toString('base64');
            const key = crypto.pbkdf2Sync(reqBody.pw, salt, 100000, 64, 'sha512');
            hashedPw = key.toString('base64');
        }
        if (reqBody.nickName) {
            const nickExist = yield index_1.userRep.findOne({ where: { nickName: reqBody.nickName } });
            if (nickExist)
                return res.status(403).json(util.successFalse(null, '닉네임이 중복되었습니다.', null));
        }
        _user = yield _user.update({
            password: hashedPw || _user.password,
            salt: salt || _user.salt,
            nickName: reqBody.nickName ? reqBody.nickName : _user.nickName,
        });
        const user = new classes_1.MyInfo(_user);
        return res.json(util.successTrue('', user));
    }
    catch (err) {
        return res.status(403).json(util.successFalse(err, '', null));
    }
}));
exports.myinfo.get('/address/list', util.isLoggedin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // 자기 주소 리스트 반환
    const tokenData = req.decoded;
    try {
        const addressList = yield index_1.addressRep.findAll({ where: { userId: tokenData.id } });
        return res.json(util.successTrue('', addressList));
    }
    catch (err) {
        return res.status(403).json(util.successFalse(err, '', null));
    }
}));
exports.myinfo.put('/address/set', util.isLoggedin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // 기본 주소 설정
    const tokenData = req.decoded;
    const reqBody = req.body;
    try {
        const user = yield index_1.userRep.findOne({ where: { id: tokenData.id } });
        if (!user)
            return res.status(403).json(util.successFalse(null, '해당 하는 유저가 없습니다.', null));
        const address = yield index_1.addressRep.findOne({
            where: {
                id: reqBody.addressId,
                userId: tokenData.id,
            },
        });
        if (!address)
            return res.status(403).json(util.successFalse(null, '해당 하는 주소가 없습니다.', null));
        yield user.update({
            addressId: reqBody.addressId,
        });
        return res.json(util.successTrue('', address));
    }
    catch (err) {
        return res.status(403).json(util.successFalse(err, '', null));
    }
}));
exports.myinfo.get('/address', util.isLoggedin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // 기본 주소 반환
    const tokenData = req.decoded;
    try {
        const user = yield index_1.userRep.findOne({ where: { id: tokenData.id } });
        if (!user)
            return res.status(403).json(util.successFalse(null, '해당 하는 유저가 없습니다.', null));
        const address = yield index_1.addressRep.findOne({
            where: {
                id: user.addressId,
                userId: tokenData.id,
            },
        });
        if (!address)
            return res.status(403).json(util.successFalse(null, '해당 하는 주소가 없습니다.', null));
        return res.json(util.successTrue('', address));
    }
    catch (err) {
        return res.status(403).json(util.successFalse(err, '', null));
    }
}));
exports.myinfo.post('/address', util.isLoggedin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // 주소 추가
    const tokenData = req.decoded;
    const reqBody = req.body;
    try {
        const coord = yield axios_1.default({
            url: `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(reqBody.address)}`,
            method: 'get',
            headers: { Authorization: `KakaoAK ${process.env.KAKAO_KEY}` },
        });
        const address = yield index_1.addressRep.create({
            userId: tokenData.id,
            address: reqBody.address,
            detailAddress: reqBody.detailAddress,
            locX: coord.data.documents[0].y,
            locY: coord.data.documents[0].x,
        });
        if (reqBody.setDefault === '1') { /// ///////////////////////////////
            yield index_1.userRep.update({
                addressId: address.id,
            }, {
                where: {
                    id: tokenData.id,
                },
            });
        }
        return res.json(util.successTrue('', address));
    }
    catch (err) {
        return res.status(403).json(util.successFalse(err, '', null));
    }
}));
exports.myinfo.put('/address', util.isLoggedin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // 주소 변경
    const tokenData = req.decoded;
    const reqBody = req.body;
    try {
        const old = yield index_1.addressRep.findOne({
            where: {
                userId: tokenData.id,
                id: reqBody.addressId,
            },
        });
        if (!old)
            return res.status(403).json(util.successFalse(null, '해당 하는 주소가 없습니다.', null));
        yield old.update({
            detailAddress: reqBody.detailAddress ? reqBody.detailAddress : old.detailAddress,
        });
        return res.json(util.successTrue('', old));
    }
    catch (err) {
        // console.log(err);
        return res.status(403).json(util.successFalse(err, '?', null));
    }
}));
exports.myinfo.delete('/address', util.isLoggedin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // 주소 삭제
    const tokenData = req.decoded;
    const reqBody = req.body;
    try {
        const address = yield index_1.addressRep.findOne({
            where: {
                userId: tokenData.id,
                id: reqBody.addressId,
            },
        });
        if (!address)
            return res.status(403).json(util.successFalse(null, '주소 삭제 실패', null));
        address.destroy()
            .then(() => res.json(util.successTrue('주소 삭제 성공', null)))
            .catch(() => res.status(403).json(util.successFalse(null, '주소 삭제 실패', null)));
    }
    catch (err) {
        return res.status(403).json(util.successFalse(err, '', null));
    }
}));
exports.myinfo.post('/report', util.isLoggedin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // 신고 접수(req: reportKind, orderId, content, chat포함여부)
    const tokenData = req.decoded;
    const reqBody = req.body;
    try {
        const order = yield index_1.orderRep.findOne({ where: { id: reqBody.orderId } });
        if (!order)
            return res.status(403).json(util.successFalse(null, '해당하는 주문이 없습니다.', null));
        const { userId } = order;
        const { riderId } = order;
        if (riderId !== parseInt(tokenData.id, 10) && userId !== parseInt(tokenData.id, 10))
            return res.status(403).json(util.successFalse(null, '해당 주문과 관련없는 사람은 신고할 수 없습니다.', null));
        const { chatId } = order;
        const report = yield index_1.reportRep.create({
            userId,
            riderId,
            reportKind: reqBody.reportKind,
            orderId: reqBody.orderId,
            fromId: tokenData.id,
            chatId: parseInt(reqBody.upload_chat, 10) === 1 ? chatId : null,
            content: reqBody.content,
        });
        return res.json(util.successTrue('', report));
    }
    catch (err) {
        return res.status(403).json(util.successFalse(err, '', null));
    }
}));
exports.myinfo.get('/reports', util.isLoggedin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // 질문 접수 (id, qnakind, userId, content, answer)
    const tokenData = req.decoded;
    try {
        const qna = yield index_1.reportRep.findAll({ where: { userId: tokenData.id } });
        return res.json(util.successTrue('', qna));
    }
    catch (err) {
        return res.status(403).json(util.successFalse(err, '', null));
    }
}));
exports.myinfo.post('/qna', util.isLoggedin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // 질문 접수 (id, qnakind, userId, content, answer)
    const tokenData = req.decoded;
    const reqBody = req.body;
    try {
        const qna = yield index_1.qnaRep.create({
            userId: tokenData.id,
            qnaKind: reqBody.qnaKind,
            content: reqBody.content,
        });
        return res.json(util.successTrue('', qna));
    }
    catch (err) {
        return res.status(403).json(util.successFalse(err, '', null));
    }
}));
exports.myinfo.get('/qnas', util.isLoggedin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // 질문 접수 (id, qnakind, userId, content, answer)
    const tokenData = req.decoded;
    try {
        const qna = yield index_1.qnaRep.findAll({ where: { userId: tokenData.id } });
        return res.json(util.successTrue('', qna));
    }
    catch (err) {
        return res.status(403).json(util.successFalse(err, '', null));
    }
}));
exports.myinfo.post('/upload', util.isLoggedin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const tokenData = req.decoded;
    const reqBody = req.body;
    try {
        const user = yield index_1.userRep.findOne({ where: { userId: tokenData.userId } });
        if (!user)
            return res.status(403).json(util.successFalse(null, '해당 하는 유저가 없습니다.', null));
        if (user.grade === 2)
            return res.status(403).json(util.successFalse(null, '이미 신분확인이 완료되었습니다.', null));
        if (user.grade === 1)
            return res.status(403).json(util.successFalse(null, '신분 확인 대기중입니다.', null));
        yield user.update({
            grade: 1,
            idCard: reqBody.idCard,
        });
        return res.json(util.successTrue('', { grade: user.grade, idCard: user.idCard }));
    }
    catch (err) {
        return res.status(403).json(util.successFalse(err, '', null));
    }
}));
exports.myinfo.post('/currentLocation', util.isLoggedin, util.isUser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const tokenData = req.decoded;
    const reqBody = req.body;
    try {
        const user = yield index_1.userRep.findOne({ where: { userId: tokenData.userId } });
        if (!user)
            return res.status(403).json(util.successFalse(null, '해당 하는 유저가 없습니다.', null));
        yield user.update({ lat: reqBody.coords.latitude, lng: reqBody.coords.longitude });
        return res.json(util.successTrue('', null));
    }
    catch (err) {
        return res.status(403).json(util.successFalse(err, '', null));
    }
}));
exports.myinfo.get('/review/written', util.isLoggedin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // 나에 대해 작성된 리뷰
    const tokenData = req.decoded;
    try {
        const reviews = yield index_1.reviewRep.findAll({
            where: {
                fromId: { [db.Op.ne]: tokenData.id },
                [db.Op.or]: [{ riderId: tokenData.id }, { userId: tokenData.id }],
            },
        });
        // console.log(reviews);
        return res.json(util.successTrue('', reviews));
    }
    catch (err) {
        return res.status(403).json(util.successFalse(err, '나에게 작성된 리뷰가 없습니다.', null));
    }
}));
exports.myinfo.get('/refunds', util.isLoggedin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // 환급 신청 리스트
    const tokenData = req.decoded;
    try {
        const refunds = yield index_1.refundRep.findAll({ where: { userId: tokenData.id } });
        if (!refunds) {
            return res.status(403).json(util.successFalse(null, '환급 신청 내역이 없습니다.', null));
        }
        return res.json(util.successTrue('', refunds));
    }
    catch (err) {
        return res.status(403).json(util.successFalse(err, '환급 신청 내역이 없습니다.', null));
    }
}));
exports.myinfo.get('/paids', util.isLoggedin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // 환급 신청 리스트
    const tokenData = req.decoded;
    try {
        const paids = yield index_1.paymentRep.findAll({ where: { userId: tokenData.id } });
        if (!paids) {
            return res.status(403).json(util.successFalse(null, '결제 내역이 없습니다.', null));
        }
        return res.json(util.successTrue('', paids));
    }
    catch (err) {
        return res.status(403).json(util.successFalse(err, '결제 내역이 없습니다.', null));
    }
}));
