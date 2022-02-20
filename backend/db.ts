import mongoose, {Document} from 'mongoose';

// my mongodb cluster
mongoose.connect("mongodb+srv://backend:YyLA1b1dHrxYxIii@cluster0.dshee.mongodb.net/myFirstDatabase?retryWrites=true&w=majority");
interface ITicket extends Document {
    _id: string,
    venue_id: number,
    validUntil: Date,
    ticketType: string, // "single", "season"
    boughtAt: Date,
    reservations: [{date: Date, active: boolean, madeAt: Date, rebooked: boolean}]
}
const ticketSchema = new mongoose.Schema({
    _id: String,
    venue_id: String,
    validUntil: Date,
    ticketType: String,
    boughtAt: Date,
    reservations: [{date: Date, active: Boolean, madeAt: Date, rebooked: Boolean}]
});
const Ticket = mongoose.model('Ticket', ticketSchema);
const OldTicket = mongoose.model('OldTicket', ticketSchema);
interface IVenue extends Document {
    _id: string,
    name: string,
    adress: {
        street: string,
        city: string,
        zip: number
    },
    visitorLimit: {
        limitType: string, // "daily" || "hourly"
        count: number
    }
}
const venueSchema = new mongoose.Schema({
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
        limitType: String, // "daily" || "hourly"
        count: Number
    }
});
const Venue = mongoose.model('Venue', venueSchema); // example venue
const gallery = new Venue({
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
    .then(() => console.log('SNG Saved'))
    .catch( (err: string) => {
        console.log('SNG already exists.' + err);
    });

/**
 * Database object, for communication with the MongoDB Database
 */
class DB {
    /**
     * If true, will log all steps for any action /
     * If false, will log only errors
     */
    public withLogging: boolean = true;

    /**
     * Adds a ticket to the databse
     * @param t - ticket to be added to the database
     * @returns {Promise<{httpCode: number, message?: string}>} httpCode and a message informing about the outcome of the function
     */
    async addTicket(t: {ticketId: string, venueId: string, ticketType: string, boughtAt: Date, validUntil: Date})
        : Promise<{httpCode: number, message?: string}> {
        if (this.withLogging) console.log("Adding ticket.");
        const ticket = new Ticket({
            _id: t.ticketId,
            venue_id: t.venueId,
            ticketType: t.ticketType,
            boughtAt: t.boughtAt,
            validUntil: t.validUntil,
            reservation: {
                date: null
            }
        });
        try {
            await ticket.save();
        }
        catch (err: any) {
            if (this.withLogging) console.log('Ticket adding error: ' + err.message);
            return {httpCode: 500};
        }
        return {httpCode: 201};
    }

    /**
     * @summary Removes a reservation and when the ticket is single-use only, will also remove the ticket and add it to OldTickets
     * @param ticketId _id of the ticket
     * @param forceRemove  false by default. If true, will remove the ticket even though the normal removal conditions are not met, these conditions are:
     * - No reservation exists but the ticket is still valid
     * - A reservation exists but is not for the current date
     * @param sameDayOnly true by default. If true, reservation can only be invalidated on the day of the reservation.
     * @returns Httpcode to be sent back to the client
     */
    async removeReservation(ticketId: string, forceRemove: boolean = false, sameDayOnly: boolean = true) : Promise<number> {
        const queryTicket  = Ticket.where({ _id: ticketId });
        let ticket: ITicket;
        try {
            ticket = await queryTicket.findOne().exec();
        }
        catch (err) {
            return 500;
        }
        if (ticket === undefined || ticket === null)
            return 404;
        if (this.withLogging) console.log('Ticket found: ' + JSON.stringify(ticket));
        const lastActiveReservation = this.getLastActiveReservation(ticket);
        if (!forceRemove) {
            if (lastActiveReservation === null) {
                if (ticket.validUntil > new Date()) {
                    return 400;
                }
            }
            else if (sameDayOnly) {
                if (this.formatDateOnly(lastActiveReservation?.date) !== this.formatDateOnly(new Date())) {
                    return 409;
                }
            }
        }
        if (lastActiveReservation !== null)
            lastActiveReservation.active = false;
        if (ticket.ticketType === "season" && ticket.validUntil > new Date()) {
            try {
                await ticket.save();
                return 200;
            }
            catch (err: any) {
                console.error('Ticket saving error: ' + err);
                return 500;
            }
        }
        const oldTicket = new OldTicket({
            _id: ticket._id,
            venue_id: ticket.venue_id,
            boughtAt: ticket.boughtAt,
            validUntil: ticket.validUntil,
            ticketType: ticket.ticketType,
            reservations: ticket.reservations
        })
        try {
            await ticket.deleteOne();
        }
        catch (err) {
            console.error('Ticket deleting error: ' + err);
            return 500;
        }
        if (this.withLogging) console.log('Deleted ticket ' + JSON.stringify(ticket));
        try {
            await oldTicket.save();
        }
        catch (err) {
            console.error('OldTicket adding error: ' + err);
            return 500;
        }
        if (this.withLogging) console.log('Saved oldTicket ' + JSON.stringify(ticket));
        return 200;
    }

    /**
     * @summary Makes a reservation, puhses it to the reservations array of the corresponding Ticket in the database
     * @param ticketId _id of the ticket
     * @param date Date of the planned reservation
     * @returns httpCode and error/success message
     */
    async makeReservation(ticketId: string, date: Date) : Promise<{httpCode: number, message?: string}> {
        if (this.withLogging) console.log('Preparing reservation.');
        const queryTicket  = Ticket.where({ _id: ticketId });
        let ticket: ITicket | null = null;
        try {
            ticket = await queryTicket.findOne().exec();
        }
        catch (err: any) {
            console.error(err.message);
            return {httpCode: 500};
        }
        if (ticket) {
            if (this.withLogging) console.log('Ticket found: ' + JSON.stringify(ticket));
            if (ticket.validUntil < date)
                return {httpCode: 400, message: 'Date after ticket validity end.'}
            const queryVenue = Venue.where({_id: ticket.venue_id});
            let venue: IVenue | null = null;
            try {
                venue = await queryVenue.findOne().exec();
            }
            catch (err: any) {
                console.error(err.message);
                return {httpCode: 500};
            }
            if (venue) {
                if (this.withLogging) console.log('Venue found: ' + JSON.stringify(venue));
                let count = 0;
                try {
                    count = await this.countReservations(venue, date);
                }
                catch (err: any) {
                    console.error(err.message);
                    return {httpCode: 500};
                }
                if (count < venue.visitorLimit.count) {
                    const lastActiveReservation = this.getLastActiveReservation(ticket);
                    if (lastActiveReservation !== null) {
                        lastActiveReservation.active = false;
                        lastActiveReservation.rebooked = true;
                    }
                    ticket.reservations.push({date, active: true, madeAt: new Date(), rebooked: false});
                    try {
                        await ticket.save();
                    }
                    catch (err: any) {
                        console.error(err.message);
                        return {httpCode: 500};
                    }
                    if (this.withLogging) console.log(`Reservation for ticket ${ticket._id}, venue ${ticket.venue_id} made for ${this.formatDateOnly(date)}`);
                    return {httpCode: 200, message: 'Success'};
                }
                else {
                    return {httpCode: 409, message: 'The venue is already fully booked for this date.'};
                }
            }
        }
        else {
            return {httpCode: 404};
        }
        return {httpCode: 500};
    }

    /**
     * @summary Utility function used by makeReservations for counting already booked reservation at a specific venue for a specific date
     * @param venue IVenue bject
     * @param date Date object
     * @returns number of reservations for the input venue and date
     */
    async countReservations(venue: IVenue, date: Date) : Promise<number> {
        if (this.withLogging) console.log(`Counting reservation for ${venue.name} on ${this.formatDateTime(date)}`);
        if (venue) {
            switch (venue.visitorLimit.limitType) {
                case ("daily"):
                    const startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0,0,0);
                    const endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23,59,59);
                    if (this.withLogging) console.log(startDate + ' --> ' + endDate);
                    const query = Ticket.find({
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
                    let count: number = 0;
                    try {
                        count = await query.count().exec();
                    }
                    catch (err: any) {
                        if (err) {
                            throw(err);
                        }
                    }
                    if (this.withLogging) console.log('Reservation count: ' + count);
                    return count;
                case ("hourly"):
                    throw(new Error('Hourly reservations not implemented'))
                default:
                    throw(new Error('Other types of reservations not implemented'));
            }
        }
        throw new Error('Venue no found');
    }
    /**
     * @summary Gets last active reservation from an ITicket object or null
     * @param ticket ITicket object
     * @returns last active reservation or null
     */
    getLastActiveReservation(ticket: ITicket) {
        for (let i = ticket.reservations.length - 1; i >= 0; i-- ) {
            if (ticket.reservations[i].active === true) {
                return ticket.reservations[i];
            }
        }
        return null;
    }
    formatDateOnly(date: Date) {
        let month, day;
        const formatted = `${date.getFullYear()}-${(month = date.getMonth()+1) < 10 ? '0'+month : month}-${(day = date.getDate()) < 10 ? '0'+day : day}`;
        return formatted;
    }
    formatDateTime(date: Date) {
        let hours, minutes;
        const formatted = `${this.formatDateOnly(date)} ${(hours = date.getHours()) < 10 ? '0'+hours : hours}:${ (minutes = date.getMinutes()) < 10 ? '0'+minutes : minutes}`;
        return formatted;
    }
}

export default new DB();
