import passport from "passport";
import passportLocal from "passport-local";
import passportJwt from "passport-jwt";
import {userRep} from "../models/index";
import * as crypto from "crypto";
import {myCache} from "../router/auth";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const LocalStrategy = passportLocal.Strategy;
const JwtStrategy = passportJwt.Strategy;
const ExtractJwt = passportJwt.ExtractJwt;


async function phoneVerify(phone:string){
  try{
    const veri = myCache.take(phone) as any;
    if(!veri||veri.verify!==1) return 0;
    const now = Number.parseInt(Date.now().toString());
    const updatedAt = Number.parseInt(veri.updatedAt);
    const remainingTime = (now-updatedAt)/60000;
    if(remainingTime>15){ //15분
      myCache.del(phone);
      return 0;
    }
    else {
      myCache.del(phone);
      return 1;
    }
  }
  catch(e){
    return 0;
  }
};

async function emailVerify(email:string){
  try{
    const veri = myCache.take(email) as any;
    if(!veri || veri.verify!==1) return 0;
    const now = Number.parseInt(Date.now().toString());
    const updatedAt = Number.parseInt(veri.updatedAt);
    const remainingTime = (now-updatedAt)/60000;
    if(remainingTime>15){ //15분
      myCache.del(email);
      return 0;
    }
    else {
      myCache.del(email);
      return 1;
    }
  }
  catch(e){
    return 0;
  }
};

export function passportConfig(){
  passport.use(
    'signup',
    new LocalStrategy({
      usernameField: 'id',
      passwordField: 'pw',
      session: false,
      passReqToCallback: true
    },
    async function (req, userId, password, done) {
      try {
        const reqBody = req.body;
        const userExist = await userRep.findOne({
          where: {
            userId: userId
          }
        });
        if(userExist) return done(null, false, { message: 'User already exist.' });
        const emailExist = await userRep.findOne({
          where: {
            email: reqBody.email
          }
        });
        if (emailExist) return done(null, false, { message: 'E-mail duplicated.' });
        const phoneExist = await userRep.findOne({
          where: {
            phone: reqBody.phone
          }
        });
        if(phoneExist) return done(null, false, { message: 'phone number duplicated.' });
        const nickExist = await userRep.findOne({
          where: {
            nickName: reqBody.nickName
          }
        });
        if(nickExist) return done(null, false, { message: 'nickName duplicated.' });
        const buffer = crypto.randomBytes(64);
        const salt = buffer.toString('base64');
        const key = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512');
        const hashedPw = key.toString('base64');
        const phoneVeri=await phoneVerify(reqBody.phone);
        if(phoneVeri==0) return done(null, false, { message: 'SMS Verification is required.' });
        const emailVeri=await emailVerify(reqBody.email);
        if(emailVeri==0) return done(null, false, { message: 'E-mail Verification is required.' });
        const idToken = req.body.idToken;
        let token=null;
        //토큰 검증
        if(idToken){
          const ret = await axios({
            url:'https://www.googleapis.com/oauth2/v3/tokeninfo',
            method: "GET",
            params:{
              id_token:idToken
            }
          });
          token = ret.data.sub;
          const d_user = await userRep.findOne({where:{googleOAuth:token}});
          if(d_user) done(null, false, { message: 'Firebase email duplicated.' });
        }
        const user = await userRep.create({
          userId: userId,
          password: hashedPw,
          salt: salt,
          name: reqBody.name,
          nickName: reqBody.nickName,
          age: Number.parseInt(reqBody.age),
          email: reqBody.email,
          phone: reqBody.phone,
          createdAt: new Date(),
          updatedAt: null,
          googleOAuth:token || null,
          kakaoOAuth:reqBody.kakaoOAuth || null
        });
        done(null,user);
      }catch(err){
        done(err);
      };
    }
    ));

  passport.use(
    'login',
    new LocalStrategy({
      usernameField: 'id',
      passwordField: 'pw',
      session: false,
      passReqToCallback: true
    },
    async function (req,id, password, done) {
      try {
        const user = await userRep.findOne({
          where: {
            userId: id
          }
        });
        if (!user) return done(null, false, { message: 'ID do not match' });
        if(user.googleOAuth == null && req.body.idToken){
          const idToken = req.body.idToken;
          //토큰 검증
          const ret = await axios({
            url:'https://www.googleapis.com/oauth2/v3/tokeninfo',
            method: "GET",
            params:{
              id_token:idToken
            }
          });
          user.update({
            googleOAuth:ret.data.sub
          });
        }
        crypto.pbkdf2(password, user.salt, 100000, 64, 'sha512', function (err:Error | null, key:Buffer) {
          if (err) {
            done(null, false, { message: 'error' });
          }
          if (user.password === key.toString('base64')) {
            return done(null, user);
          } else {
            return done(null, false, { message: 'Password do not match.' });
          }
        });
      } catch (err) {
        done(err);
      }
    })
  );

  passport.use(new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET
    }, function (jwtToken, done) {
      userRep.findOne({where:{ userId: jwtToken.userId }}).then((user: any) =>{
        if (user) {
          return done(undefined, user , jwtToken);
        } else {
          return done(undefined, false);
        }
      });
    }));
};