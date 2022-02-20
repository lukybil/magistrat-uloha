"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = __importDefault(require("mongoose"));
// my mongodb cluster
mongoose_1.default.connect("mongodb+srv://backend:YyLA1b1dHrxYxIii@cluster0.dshee.mongodb.net/myFirstDatabase?retryWrites=true&w=majority");
var ticketSchema = new mongoose_1.default.Schema({
    _id: String,
    venue_id: String,
    validUntil: Date,
    ticketType: String,
    boughtAt: Date,
    reservations: [{ date: Date, active: Boolean, madeAt: Date, rebooked: Boolean }]
});
var Ticket = mongoose_1.default.model('Ticket', ticketSchema);
var OldTicket = mongoose_1.default.model('OldTicket', ticketSchema);
var venueSchema = new mongoose_1.default.Schema({
    _id: String,
    name: {
        type: String,
        required: true,
        unique: true
    },
    adress: {
        street: String,
        city: String,
        zip: Number
    },
    visitorLimit: {
        limitType: String,
        count: Number
    }
});
var Venue = mongoose_1.default.model('Venue', venueSchema); // example venue
var gallery = new Venue({
    _id: "b62c982d-bc83-44ef-a9ca-87978ba01d01",
    name: "Slovenská Národná Galéria",
    adress: {
        street: "Námestie Ľudovíta Štúra",
        city: "Bratislava",
        zip: 81102
    },
    visitorLimit: {
        limitType: "daily",
        count: 2
    }
});
gallery.save()
    .then(function () { return console.log('SNG Saved'); })
    .catch(function (err) {
    console.log('SNG already exists.' + err);
});
/**
 * Database object, for communication with the MongoDB Database
 */
var DB = /** @class */ (function () {
    function DB() {
        /**
         * If true, will log all steps for any action /
         * If false, will log only errors
         */
        this.withLogging = true;
    }
    /**
     * Adds a ticket to the databse
     * @param t - ticket to be added to the database
     * @returns {Promise<{httpCode: number, message?: string}>} httpCode and a message informing about the outcome of the function
     */
    DB.prototype.addTicket = function (t) {
        return __awaiter(this, void 0, void 0, function () {
            var ticket, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.withLogging)
                            console.log("Adding ticket.");
                        ticket = new Ticket({
                            _id: t.ticketId,
                            venue_id: t.venueId,
                            ticketType: t.ticketType,
                            boughtAt: t.boughtAt,
                            validUntil: t.validUntil,
                            reservation: {
                                date: null
                            }
                        });
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, ticket.save()];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        err_1 = _a.sent();
                        if (this.withLogging)
                            console.log('Ticket adding error: ' + err_1.message);
                        return [2 /*return*/, { httpCode: 500 }];
                    case 4: return [2 /*return*/, { httpCode: 201 }];
                }
            });
        });
    };
    /**
     * @summary Removes a reservation and when the ticket is single-use only, will also remove the ticket and add it to OldTickets
     * @param ticketId _id of the ticket
     * @param forceRemove  false by default. If true, will remove the ticket even though the normal removal conditions are not met, these conditions are:
     * - No reservation exists but the ticket is still valid
     * - A reservation exists but is not for the current date
     * @param sameDayOnly true by default. If true, reservation can only be invalidated on the day of the reservation.
     * @returns Httpcode to be sent back to the client
     */
    DB.prototype.removeReservation = function (ticketId, forceRemove, sameDayOnly) {
        if (forceRemove === void 0) { forceRemove = false; }
        if (sameDayOnly === void 0) { sameDayOnly = true; }
        return __awaiter(this, void 0, void 0, function () {
            var queryTicket, ticket, err_2, lastActiveReservation, err_3, oldTicket, err_4, err_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        queryTicket = Ticket.where({ _id: ticketId });
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, queryTicket.findOne().exec()];
                    case 2:
                        ticket = _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        err_2 = _a.sent();
                        return [2 /*return*/, 500];
                    case 4:
                        if (ticket === undefined || ticket === null)
                            return [2 /*return*/, 404];
                        if (this.withLogging)
                            console.log('Ticket found: ' + JSON.stringify(ticket));
                        lastActiveReservation = this.getLastActiveReservation(ticket);
                        if (!forceRemove) {
                            if (lastActiveReservation === null) {
                                if (ticket.validUntil > new Date()) {
                                    return [2 /*return*/, 400];
                                }
                            }
                            else if (sameDayOnly) {
                                if (this.formatDateOnly(lastActiveReservation === null || lastActiveReservation === void 0 ? void 0 : lastActiveReservation.date) !== this.formatDateOnly(new Date())) {
                                    return [2 /*return*/, 409];
                                }
                            }
                        }
                        if (lastActiveReservation !== null)
                            lastActiveReservation.active = false;
                        if (!(ticket.ticketType === "season" && ticket.validUntil > new Date())) return [3 /*break*/, 8];
                        _a.label = 5;
                    case 5:
                        _a.trys.push([5, 7, , 8]);
                        return [4 /*yield*/, ticket.save()];
                    case 6:
                        _a.sent();
                        return [2 /*return*/, 200];
                    case 7:
                        err_3 = _a.sent();
                        console.error('Ticket saving error: ' + err_3);
                        return [2 /*return*/, 500];
                    case 8:
                        oldTicket = new OldTicket({
                            _id: ticket._id,
                            venue_id: ticket.venue_id,
                            boughtAt: ticket.boughtAt,
                            validUntil: ticket.validUntil,
                            ticketType: ticket.ticketType,
                            reservations: ticket.reservations
                        });
                        _a.label = 9;
                    case 9:
                        _a.trys.push([9, 11, , 12]);
                        return [4 /*yield*/, ticket.deleteOne()];
                    case 10:
                        _a.sent();
                        return [3 /*break*/, 12];
                    case 11:
                        err_4 = _a.sent();
                        console.error('Ticket deleting error: ' + err_4);
                        return [2 /*return*/, 500];
                    case 12:
                        if (this.withLogging)
                            console.log('Deleted ticket ' + JSON.stringify(ticket));
                        _a.label = 13;
                    case 13:
                        _a.trys.push([13, 15, , 16]);
                        return [4 /*yield*/, oldTicket.save()];
                    case 14:
                        _a.sent();
                        return [3 /*break*/, 16];
                    case 15:
                        err_5 = _a.sent();
                        console.error('OldTicket adding error: ' + err_5);
                        return [2 /*return*/, 500];
                    case 16:
                        if (this.withLogging)
                            console.log('Saved oldTicket ' + JSON.stringify(ticket));
                        return [2 /*return*/, 200];
                }
            });
        });
    };
    /**
     * @summary Makes a reservation, puhses it to the reservations array of the corresponding Ticket in the database
     * @param ticketId _id of the ticket
     * @param date Date of the planned reservation
     * @returns httpCode and error/success message
     */
    DB.prototype.makeReservation = function (ticketId, date) {
        return __awaiter(this, void 0, void 0, function () {
            var queryTicket, ticket, err_6, queryVenue, venue, err_7, count, err_8, lastActiveReservation, err_9;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.withLogging)
                            console.log('Preparing reservation.');
                        queryTicket = Ticket.where({ _id: ticketId });
                        ticket = null;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, queryTicket.findOne().exec()];
                    case 2:
                        ticket = _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        err_6 = _a.sent();
                        console.error(err_6.message);
                        return [2 /*return*/, { httpCode: 500 }];
                    case 4:
                        if (!ticket) return [3 /*break*/, 19];
                        if (this.withLogging)
                            console.log('Ticket found: ' + JSON.stringify(ticket));
                        if (ticket.validUntil < date)
                            return [2 /*return*/, { httpCode: 400, message: 'Date after ticket validity end.' }];
                        queryVenue = Venue.where({ _id: ticket.venue_id });
                        venue = null;
                        _a.label = 5;
                    case 5:
                        _a.trys.push([5, 7, , 8]);
                        return [4 /*yield*/, queryVenue.findOne().exec()];
                    case 6:
                        venue = _a.sent();
                        return [3 /*break*/, 8];
                    case 7:
                        err_7 = _a.sent();
                        console.error(err_7.message);
                        return [2 /*return*/, { httpCode: 500 }];
                    case 8:
                        if (!venue) return [3 /*break*/, 18];
                        if (this.withLogging)
                            console.log('Venue found: ' + JSON.stringify(venue));
                        count = 0;
                        _a.label = 9;
                    case 9:
                        _a.trys.push([9, 11, , 12]);
                        return [4 /*yield*/, this.countReservations(venue, date)];
                    case 10:
                        count = _a.sent();
                        return [3 /*break*/, 12];
                    case 11:
                        err_8 = _a.sent();
                        console.error(err_8.message);
                        return [2 /*return*/, { httpCode: 500 }];
                    case 12:
                        if (!(count < venue.visitorLimit.count)) return [3 /*break*/, 17];
                        lastActiveReservation = this.getLastActiveReservation(ticket);
                        if (lastActiveReservation !== null) {
                            lastActiveReservation.active = false;
                            lastActiveReservation.rebooked = true;
                        }
                        ticket.reservations.push({ date: date, active: true, madeAt: new Date(), rebooked: false });
                        _a.label = 13;
                    case 13:
                        _a.trys.push([13, 15, , 16]);
                        return [4 /*yield*/, ticket.save()];
                    case 14:
                        _a.sent();
                        return [3 /*break*/, 16];
                    case 15:
                        err_9 = _a.sent();
                        console.error(err_9.message);
                        return [2 /*return*/, { httpCode: 500 }];
                    case 16:
                        if (this.withLogging)
                            console.log("Reservation for ticket ".concat(ticket._id, ", venue ").concat(ticket.venue_id, " made for ").concat(this.formatDateOnly(date)));
                        return [2 /*return*/, { httpCode: 200, message: 'Success' }];
                    case 17: return [2 /*return*/, { httpCode: 409, message: 'The venue is already fully booked for this date.' }];
                    case 18: return [3 /*break*/, 20];
                    case 19: return [2 /*return*/, { httpCode: 404 }];
                    case 20: return [2 /*return*/, { httpCode: 500 }];
                }
            });
        });
    };
    /**
     * @summary Utility function used by makeReservations for counting already booked reservation at a specific venue for a specific date
     * @param venue IVenue bject
     * @param date Date object
     * @returns number of reservations for the input venue and date
     */
    DB.prototype.countReservations = function (venue, date) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, startDate, endDate, query, count, err_10;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (this.withLogging)
                            console.log("Counting reservation for ".concat(venue.name, " on ").concat(this.formatDateTime(date)));
                        if (!venue) return [3 /*break*/, 8];
                        _a = venue.visitorLimit.limitType;
                        switch (_a) {
                            case ("daily"): return [3 /*break*/, 1];
                            case ("hourly"): return [3 /*break*/, 6];
                        }
                        return [3 /*break*/, 7];
                    case 1:
                        startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
                        endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);
                        if (this.withLogging)
                            console.log(startDate + ' --> ' + endDate);
                        query = Ticket.find({
                            'venue_id': venue._id,
                            'reservations': {
                                '$elemMatch': {
                                    'active': true,
                                    'date': {
                                        '$gte': startDate,
                                        '$lte': endDate
                                    }
                                }
                            }
                        });
                        count = 0;
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, query.count().exec()];
                    case 3:
                        count = _b.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        err_10 = _b.sent();
                        if (err_10) {
                            throw (err_10);
                        }
                        return [3 /*break*/, 5];
                    case 5:
                        if (this.withLogging)
                            console.log('Reservation count: ' + count);
                        return [2 /*return*/, count];
                    case 6: throw (new Error('Hourly reservations not implemented'));
                    case 7: throw (new Error('Other types of reservations not implemented'));
                    case 8: throw new Error('Venue no found');
                }
            });
        });
    };
    /**
     * @summary Gets last active reservation from an ITicket object or null
     * @param ticket ITicket object
     * @returns last active reservation or null
     */
    DB.prototype.getLastActiveReservation = function (ticket) {
        for (var i = ticket.reservations.length - 1; i >= 0; i--) {
            if (ticket.reservations[i].active === true) {
                return ticket.reservations[i];
            }
        }
        return null;
    };
    DB.prototype.formatDateOnly = function (date) {
        var month, day;
        var formatted = "".concat(date.getFullYear(), "-").concat((month = date.getMonth() + 1) < 10 ? '0' + month : month, "-").concat((day = date.getDate()) < 10 ? '0' + day : day);
        return formatted;
    };
    DB.prototype.formatDateTime = function (date) {
        var hours, minutes;
        var formatted = "".concat(this.formatDateOnly(date), " ").concat((hours = date.getHours()) < 10 ? '0' + hours : hours, ":").concat((minutes = date.getMinutes()) < 10 ? '0' + minutes : minutes);
        return formatted;
    };
    return DB;
}());
exports.default = new DB();
