import { NextFunction, Response, Router } from "express";
import * as util from "../config/util";

import dotenv from "dotenv";
dotenv.config();

export const order = Router();

order.post('/', util.isLoggedin, async function (req: any, res: Response, next: NextFunction) {
//주문 등록
  const tokenData = req.decoded;
  const reqBody = req.body;
  try{
    //작성
  }catch(err){
    return res.status(403).json(util.successFalse(err,"",null));
  }
});

order.get('/', util.isLoggedin, async function (req: any, res: Response, next: NextFunction) {
//주문 확인
  const tokenData = req.decoded;
  const reqBody = req.body;
  try{
    //작성
  }catch(err){
    return res.status(403).json(util.successFalse(err,"",null));
  }
});
    
order.get('/riders', util.isLoggedin, async function (req: any, res: Response, next: NextFunction) {
//신청 배달원 목록 반환
  const tokenData = req.decoded;
  const reqBody = req.body;
  try{
    //작성
  }catch(err){
    return res.status(403).json(util.successFalse(err,"",null));
  }
});

order.post('/rider', util.isLoggedin, async function (req: any, res: Response, next: NextFunction) {
//배달원 선택
  const tokenData = req.decoded;
  const reqBody = req.body;
  try{
    //작성
  }catch(err){
    return res.status(403).json(util.successFalse(err,"",null));
  }
});

order.get('/chat', util.isLoggedin, async function (req: any, res: Response, next: NextFunction) {
//주문에 대한 채팅을 위한 주소 반환
//필요없을 수도... 주문 등록 할때 반환해도 될 수도..
  const tokenData = req.decoded;
  const reqBody = req.body;
  try{
    //작성
  }catch(err){
    return res.status(403).json(util.successFalse(err,"",null));
  }
});

order.get('/price', util.isLoggedin, async function (req: any, res: Response, next: NextFunction) {
//최종 결제 금액 반환
  const tokenData = req.decoded;
  const reqBody = req.body;
  try{
    //작성
  }catch(err){
    return res.status(403).json(util.successFalse(err,"",null));
  }
});

order.post('/price', util.isLoggedin, async function (req: any, res: Response, next: NextFunction) {
//배달원이 최종 결제 금액 전송
  const tokenData = req.decoded;
  const reqBody = req.body;
  try{
    //작성
  }catch(err){
    return res.status(403).json(util.successFalse(err,"",null));
  }
});    

order.post('/review/user', util.isLoggedin, async function (req: any, res: Response, next: NextFunction) {
//유저에 대한 리뷰 작성
  const tokenData = req.decoded;
  const reqBody = req.body;
  try{
    //작성
  }catch(err){
    return res.status(403).json(util.successFalse(err,"",null));
  }
});

order.get('/review/user', util.isLoggedin, async function (req: any, res: Response, next: NextFunction) {
//유저에 대한 리뷰 확인
  const tokenData = req.decoded;
  const reqBody = req.body;
  try{
    //작성
  }catch(err){
    return res.status(403).json(util.successFalse(err,"",null));
  }
});

order.post('/review/rider', util.isLoggedin, async function (req: any, res: Response, next: NextFunction) {
//라이더에 대한 리뷰 작성
  const tokenData = req.decoded;
  const reqBody = req.body;
  try{
    //작성
  }catch(err){
    return res.status(403).json(util.successFalse(err,"",null));
  }
});

order.get('/review/rider', util.isLoggedin, async function (req: any, res: Response, next: NextFunction) {
//라이더에 대한 리뷰 확인
  const tokenData = req.decoded;
  const reqBody = req.body;
  try{
    //작성
  }catch(err){
    return res.status(403).json(util.successFalse(err,"",null));
  }
});

order.get('/orders', util.isLoggedin, async function (req: any, res: Response, next: NextFunction) {
//배달원이 찾을 배달거리 리스트 반환
  const tokenData = req.decoded;
  const reqBody = req.body;
  try{
    //작성
  }catch(err){
    return res.status(403).json(util.successFalse(err,"",null));
  }
});