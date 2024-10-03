import { expect } from 'chai';
import request from "supertest";
import { app, decorate, server } from '../app.mjs';

describe('App', function () {
    let contacts;

    before(function () {
        contacts = [
            {
                phoneNumbers: ["123-456-7890", "800-123-4567"],
                email: "johndoe@example.com",
                name: "John Doe"
            },
            {
                phoneNumbers: ["000-000-0000"],
                email: "janedoe@example.com",
                name: "Jane Doe"
            },
            {
                phoneNumbers: ["666-666-6666", "999-999-9999"],
                email: "ronswanson@example.com",
                name: "Ron Swanson"
            },
            {
                phoneNumbers: ["555-555-5555"],
                email: "bob@example.com",
                name: "Bob"
            },
            {
                phoneNumbers: ["123-555-0156", "123-555-0800"],
                email: "alice@example.com",
                name: "Alice"
            }
        ];
    });

    describe('GET /', function () {
        it('should redirect to editor page', async function () {
            const response = await request(app).get('/');
            expect(response.redirect).to.eql(true);
            expect(response.status).to.eql(302);
            expect(response.headers.location).to.eql('/editor');
        });
    });

    describe('GET /img/logo.png', function () {
        it('should display image file from the static folder', async function () {
            const response = await request(app).get('/img/logo.png');
            expect(response.status).to.be.eql(200);
            expect(response.headers['content-type']).to.eql('image/png');
        });
    });

    describe('GET /editor', function () {
        it('should render editor page', async function () {
            const response = await request(app).get('/editor');
            expect(response.status).to.eql(200);
        });
    });

    describe('POST /editor', function () {
        it('should render editor page with given text', async function () {
            const originalText = `I am going out with John Doe and Ron Swanson.`;
            const response = await request(app)
                .post('/editor')
                .send(`formText=${originalText}`);
            expect(response.status).to.eql(200);
            expect(response.text).to.include(originalText);
        });

        it('should render editor page with the modified text', async function () {
            const originalText = `I am going out with John Doe and Ron Swanson.`;
            const jd = {
                phoneNumbers: ["123-456-7890", "800-123-4567"],
                email: "johndoe@example.com",
                name: "John Doe"
            };
            const rs = {
                phoneNumbers: ["666-666-6666", "999-999-9999"],
                email: "ronswanson@example.com",
                name: "Ron Swanson"
            };
            const modifiedText = `I am going out with ${decorate(jd)} and ${decorate(rs)}`;

            const response = await request(app)
                .post('/editor')
                .send(`formText=${originalText}`);
            expect(response.status).to.eql(200);
            expect(response.text).to.include(modifiedText);
        });
    });

    describe('GET /phonebook', function () {
        it('should render phonebook page and display all the contacts', async function () {
            const response = await request(app).get('/phonebook');
            expect(response.status).to.eql(200);
            contacts.forEach(contact => {
                expect(response.text).to.include(contact.name);
                expect(response.text).to.include(contact.email);
                expect(response.text).to.include(contact.phoneNumbers.join(', '));
            });
        });

        it('should display all the contacts where the search string matches part of the name', async function () {
            const filteredContacts = contacts.slice(0, 2);
            const removedContacts = contacts.slice(2);

            const response = await request(app)
                .get('/phonebook')
                .query({ contact: 'Doe' });

            expect(response.status).to.be.eql(200);
            filteredContacts.forEach(contact => {
                expect(response.text).to.include(contact.name);
                expect(response.text).to.include(contact.email);
                expect(response.text).to.include(contact.phoneNumbers.join(', '));
            });
            removedContacts.forEach(contact => {
                expect(response.text).to.not.include(contact.name);
                expect(response.text).to.not.include(contact.email);
                expect(response.text).to.not.include(contact.phoneNumbers.join(', '));
            });
        });

        it('should display all the contacts where the search string matches part of the email', async function () {
            const filteredContacts = contacts.slice(0, 2);
            const removedContacts = contacts.slice(2);

            const response = await request(app)
                .get('/phonebook')
                .query({ contact: 'doe@example.com' });

            expect(response.status).to.be.eql(200);
            filteredContacts.forEach(contact => {
                expect(response.text).to.include(contact.name);
                expect(response.text).to.include(contact.email);
                expect(response.text).to.include(contact.phoneNumbers.join(', '));
            });
            removedContacts.forEach(contact => {
                expect(response.text).to.not.include(contact.name);
                expect(response.text).to.not.include(contact.email);
                expect(response.text).to.not.include(contact.phoneNumbers.join(', '));
            });
        });

        it('should display all the contacts where the search string matches part of the phone number', async function () {
            const filteredContacts = contacts.slice(3);
            const removedContacts = contacts.slice(0, 3);

            const response = await request(app)
                .get('/phonebook')
                .query({ contact: '555' });

            expect(response.status).to.be.eql(200);
            filteredContacts.forEach(contact => {
                expect(response.text).to.include(contact.name);
                expect(response.text).to.include(contact.email);
                expect(response.text).to.include(contact.phoneNumbers.join(', '));
            });
            removedContacts.forEach(contact => {
                expect(response.text).to.not.include(contact.name);
                expect(response.text).to.not.include(contact.email);
                expect(response.text).to.not.include(contact.phoneNumbers.join(', '));
            });
        });
    });

    describe('POST /phonebook', function () {
        it('should render phonebook page and display all the existing contacts and the new contact', async function () {
            const newContact = {
                name: "Tobias Funke",
                email: "tobias.funke@example.com",
                phoneNumbers: "233-555-3456,561-555-2311"
            };
            const response = await request(app)
                .post('/phonebook')
                .type('form')
                .send(newContact);
            expect(response.status).to.eql(200);
            contacts.forEach(contact => {
                expect(response.text).to.include(contact.name);
                expect(response.text).to.include(contact.email);
                expect(response.text).to.include(contact.phoneNumbers.join(', '));
            });
            expect(response.text).to.include(newContact.name);
            expect(response.text).to.include(newContact.email);
            expect(response.text).to.include(newContact.phoneNumbers.split(',').join(', '));
        });
    });

    after(function () {
        server.close(() => { });
    });
});