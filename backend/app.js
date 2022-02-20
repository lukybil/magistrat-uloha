"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var express_1 = __importDefault(require("express"));
var crypto_1 = require("crypto");
var db_1 = __importDefault(require("./db"));
// turn logging on/off
db_1.default.withLogging = true;
var app = (0, express_1.default)();
app.use(express_1.default.json());
// logs each request
app.use(function (req, res, next) {
    console.log(req.body);
    next();
});
/* example ticket:
{
    ticketType: "single",
    venueId: "b62c982d-bc83-44ef-a9ca-87978ba01d01", <=== SNG
}
*/
app.get("/buy", function (req, res, next) {
    var ticketType;
    var venueId;
    if ((ticketType = req.body.ticketType) === undefined) {
        res.status(400).send();
        return;
    }
    if ((venueId = req.body.venueId) === undefined) {
        res.status(400).send();
        return;
    }
    if (ticketType !== "single" && ticketType !== "season") {
        res.status(400).send();
        return;
    }
    var ticketId = (0, crypto_1.randomUUID)();
    var boughtAt = new Date();
    var validUntil = new Date();
    // Valid for one year
    validUntil.setFullYear(validUntil.getFullYear() + 1);
    var ticket = { ticketId: ticketId, venueId: venueId, ticketType: ticketType, boughtAt: boughtAt, validUntil: validUntil };
    db_1.default.addTicket(ticket)
        .then(function (_a) {
        var httpCode = _a.httpCode, message = _a.message;
        if (httpCode === 201) {
            res.status(200).json({ ticketId: ticketId });
        }
        else {
            res.status(httpCode).send(message);
        }
    });
});
app.post("/reservation", function (req, res, next) {
    var reservation = req.body;
    if (reservation.ticketId === undefined || reservation.date === undefined) {
        res.status(400).send();
        return;
    }
    var date = new Date(reservation.date);
    if (date.toString() === "Invalid Date") {
        res.status(400).send('Invalid date.');
        return;
    }
    if (reservation.date < new Date()) {
        res.status(400).send('Invalid date. (in the past)');
        return;
    }
    db_1.default.makeReservation(reservation.ticketId.trim(), date)
        .then(function (_a) {
        var httpCode = _a.httpCode, message = _a.message;
        return res.status(httpCode).send(message);
    });
});
app.delete("/reservation/remove", function (req, res, next) {
    var ticketId;
    if ((ticketId = req.body.ticketId) === undefined) {
        res.status(400).send("Error");
        return;
    }
    db_1.default.removeReservation(ticketId, false, false)
        .then(function (httpCode) {
        if (httpCode === 200)
            res.status(httpCode).send('Success');
        else
            res.status(httpCode).send();
    });
});
module.exports = app;
