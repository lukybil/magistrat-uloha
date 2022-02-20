import express, { NextFunction, Request, Response } from "express";
import { sign, randomInt, randomUUID } from 'crypto';
import db from './db';
// turn logging on/off
db.withLogging = true;
const app = express();

app.use(express.json());

// logs each request
app.use( (req: Request, res: Response, next: NextFunction) => {
    console.log(req.body);
    next();
});
/* example ticket:
{
    ticketType: "single",
    venueId: "b62c982d-bc83-44ef-a9ca-87978ba01d01", <=== SNG
}
*/
app.get("/buy", (req: Request, res: Response, next: NextFunction) => {
    let ticketType: string;
    let venueId: string;
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
    const ticketId = randomUUID();
    const boughtAt = new Date();
    const validUntil: Date = new Date();
    // Valid for one year
    validUntil.setFullYear(validUntil.getFullYear()+1);
    const ticket = {ticketId, venueId, ticketType, boughtAt, validUntil}
    db.addTicket(ticket)
        .then(({httpCode, message}) => {
            if (httpCode === 201) {
                res.status(200).json({ticketId});
            }
            else {
                res.status(httpCode).send(message);
            }
        });
});

app.post("/reservation", (req: Request, res: Response, next: NextFunction) => {
    const reservation = req.body;
    if (reservation.ticketId === undefined || reservation.date === undefined) {
        res.status(400).send();
        return;
    }
    const date = new Date(reservation.date);
    if (date.toString() === "Invalid Date") {
        res.status(400).send('Invalid date.');
        return;
    }
    if (reservation.date < new Date()) {
        res.status(400).send('Invalid date. (in the past)');
        return;
    }
    db.makeReservation((reservation.ticketId as string).trim(), date)
        .then(({httpCode, message}) => res.status(httpCode).send(message));
});

app.delete("/reservation/remove", (req: Request, res: Response, next: NextFunction) => {
    let ticketId: string;
    if ((ticketId = req.body.ticketId) === undefined) {
        res.status(400).send("Error");
        return;
    }
    db.removeReservation(ticketId, false, false)
        .then((httpCode: number) => {
            if (httpCode === 200)
                res.status(httpCode).send('Success');
            else
                res.status(httpCode).send();
        });
});

export = app;