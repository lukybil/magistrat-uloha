"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var crypto_1 = require("crypto");
var process_1 = require("process");
var db_1 = __importDefault(require("../backend/db"));
var TICKET_TYPE = 'single';
var VENUE_ID = "b62c982d-bc83-44ef-a9ca-87978ba01d01";
var RESERVATION_DATE = new Date('2022-05-10');
var addTicketTest = function (ticketType, venueId) {
    var ticketId = (0, crypto_1.randomUUID)();
    var boughtAt = new Date();
    var validUntil = new Date();
    validUntil.setMonth(validUntil.getMonth() + 8);
    var preTicket = { ticketId: ticketId, venueId: venueId, ticketType: ticketType, boughtAt: boughtAt, validUntil: validUntil };
    db_1.default.addTicket(preTicket)
        .then(function (_a) {
        var httpCode = _a.httpCode, message = _a.message;
        if (httpCode === 201) {
            console.log('Adding ticket successfull.');
            makeReservationTest(ticketId, RESERVATION_DATE);
        }
        else {
            throw new Error('Adding ticket failed.');
        }
    });
};
var makeReservationTest = function (ticketId, date) {
    db_1.default.makeReservation(ticketId, date)
        .then(function (_a) {
        var httpCode = _a.httpCode, message = _a.message;
        if (httpCode >= 200 && httpCode < 300) {
            console.log('Reservation successfull.');
            forceRemoveReservation(ticketId);
            // testsFinishedSuccessfully();
        }
        else
            throw new Error("Reservation failed. HttpCode: ".concat(httpCode, "; Message: ").concat(message));
    });
};
var forceRemoveReservation = function (ticketId) {
    db_1.default.removeReservation(ticketId, true)
        .then(function (httpCode) {
        if (httpCode >= 200 && httpCode < 300) {
            console.log('Reservation removed successfully.');
            testsFinishedSuccessfully();
        }
        else
            throw new Error("Removing reservation failed. HttpCode: ".concat(httpCode));
    });
};
var testsFinishedSuccessfully = function () {
    console.log("\x1b[32m", 'Tests finished successfully');
    console.log('\x1b[0m');
    (0, process_1.exit)(0);
};
addTicketTest(TICKET_TYPE, VENUE_ID);
