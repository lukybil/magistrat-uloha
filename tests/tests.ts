import { assert } from 'console';
import { randomUUID } from 'crypto';
import { exit } from 'process';
import db from '../backend/db';


const TICKET_TYPE = 'single';
const VENUE_ID = "b62c982d-bc83-44ef-a9ca-87978ba01d01";
const RESERVATION_DATE = new Date('2022-05-10')

const addTicketTest = (ticketType: string, venueId: string) => {
    const ticketId = randomUUID();
    const boughtAt = new Date();
    const validUntil: Date = new Date();
    validUntil.setMonth(validUntil.getMonth()+8);
    const preTicket = {ticketId, venueId, ticketType, boughtAt, validUntil}
    db.addTicket(preTicket)
        .then(({httpCode, message}) => {
            if (httpCode === 201) {
                console.log('Adding ticket successfull.');
                makeReservationTest(ticketId, RESERVATION_DATE);
            }
            else {
                throw new Error('Adding ticket failed.')
            }
        });
}

const makeReservationTest = (ticketId: string, date: Date) => {
    db.makeReservation(ticketId, date)
        .then(({httpCode, message}) => {
            if (httpCode >= 200 && httpCode < 300) {
                console.log('Reservation successfull.');
                forceRemoveReservation(ticketId);
                // testsFinishedSuccessfully();
            }
            else
                throw new Error(`Reservation failed. HttpCode: ${httpCode}; Message: ${message}`);
        });
}

const forceRemoveReservation = (ticketId: string) => {
    db.removeReservation(ticketId, true)
        .then((httpCode) => {
            if (httpCode >= 200 && httpCode < 300) {
                console.log('Reservation removed successfully.');
                testsFinishedSuccessfully();
            }
            else
                throw new Error(`Removing reservation failed. HttpCode: ${httpCode}`);
        });
}

const testsFinishedSuccessfully = () => {
    console.log("\x1b[32m", 'Tests finished successfully');
    console.log('\x1b[0m');
    exit(0);
}

addTicketTest(TICKET_TYPE, VENUE_ID);
