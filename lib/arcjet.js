import arcjet, { tokenBucket } from "@arcjet/next";

const aj= arcjet({
    key: process.env.ARCJET_KEY,
    characteristics: ["userId"],  //track using userId (it may be using IP)
    rules:[
       tokenBucket({
        mode:"LIVE",
        refillRate:10,
        interval: 3600,
        capacity: 10,

       }),
    ],
});

export default aj;