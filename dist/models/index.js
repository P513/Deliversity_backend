"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reviewRep = exports.reportRep = exports.qnaRep = exports.pointcategoryRep = exports.pointRep = exports.paymentRep = exports.orderRep = exports.addressRep = exports.emailVeriRep = exports.veriRep = exports.userRep = exports.db = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const user_1 = __importDefault(require("./user"));
const verification_1 = __importDefault(require("./verification"));
const email_verification_1 = __importDefault(require("./email-verification"));
const address_1 = __importDefault(require("./address"));
const order_1 = __importDefault(require("./order"));
const payment_1 = __importDefault(require("./payment"));
const point_1 = __importDefault(require("./point"));
const pointCategory_1 = __importDefault(require("./pointCategory"));
const qna_1 = __importDefault(require("./qna"));
const report_1 = __importDefault(require("./report"));
const review_1 = __importDefault(require("./review"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.db = new sequelize_typescript_1.Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
    host: process.env.DB_HOST,
    port: Number.parseInt(process.env.DB_PORT),
    dialect: "mysql",
    dialectOptions: {
        charset: "utf8mb4",
        dateStrings: true,
        typeCast: true,
    },
    timezone: "+09:00",
    models: [__dirname + '/models'],
});
exports.db.addModels([user_1.default]);
exports.db.addModels([verification_1.default]);
exports.db.addModels([email_verification_1.default]);
exports.db.addModels([address_1.default]);
exports.db.addModels([order_1.default]);
exports.db.addModels([payment_1.default]);
exports.db.addModels([point_1.default]);
exports.db.addModels([pointCategory_1.default]);
exports.db.addModels([qna_1.default]);
exports.db.addModels([report_1.default]);
exports.db.addModels([review_1.default]);
//https://stackoverflow.com/questions/60014874/how-to-use-typescript-with-sequelize
exports.userRep = exports.db.getRepository(user_1.default);
exports.veriRep = exports.db.getRepository(verification_1.default);
exports.emailVeriRep = exports.db.getRepository(email_verification_1.default);
exports.addressRep = exports.db.getRepository(address_1.default);
exports.orderRep = exports.db.getRepository(order_1.default);
exports.paymentRep = exports.db.getRepository(payment_1.default);
exports.pointRep = exports.db.getRepository(point_1.default);
exports.pointcategoryRep = exports.db.getRepository(pointCategory_1.default);
exports.qnaRep = exports.db.getRepository(qna_1.default);
exports.reportRep = exports.db.getRepository(report_1.default);
exports.reviewRep = exports.db.getRepository(review_1.default);