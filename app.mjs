// app.mjs
import path from 'path';
import url from 'url';
import express from 'express';
import hbs from 'hbs';
const app = express();
import {Contact} from "./contact.mjs";
import fs from 'fs';


hbs.registerHelper("join", function (array, separator) {
    return array.join(separator);
});

function decorate(contact){ //underline strings
    return `<span class="contact-info" >${contact.name}</span>`;
}

function getModifiedText(originalText, contacts) {
    if (!originalText) {return "";}

    return contacts.reduce((modifiedText, contact) => {
            if (!contact.name) {return modifiedText;}
            return modifiedText.split(contact.name).join(decorate(contact));
        }, originalText);
}


app.set('view engine', 'hbs'); 
app.set('views', './views'); 

const basePath = path.dirname(url.fileURLToPath(import.meta.url));
const publicPath = path.resolve(basePath, "public");

app.use(express.static(publicPath));
app.use(express.urlencoded({ extended: true }));

app.use((req,res, next)=>{
    console.log("Method: ", req.method);
    console.log("Path: ", req.path);
    console.log("Query: ", JSON.stringify(req.query));
    next();
});

app.get('/', (req, res) => {
    res.redirect('/editor');
    });

app.get('/editor', (req, res) => {
    res.render("editor", {});
});

app.post('/editor', (req, res) => {
    const names = new Array();
    const contacts = new Array();
    fs.readFile("./code-samples/phonebook.json", "utf8", (err, data) =>{
        if (err){
            console.log("Error !");
        }
        else{
            const contactInfo = JSON.parse(data);
            const editorText = req.body.formText;
            if (editorText !== ""){
                for (const info of contactInfo){
                    names.push(info.name);     
                    const contactPerson = new Contact(info.name, info.email, info.phoneNumbers);
                    contacts.push(contactPerson);       
                }

                const responseHTML = getModifiedText(editorText, contacts);

                res.render("editor",{submit: true, newString: responseHTML, original:editorText});
            }
        }
    });
});

app.get('/phonebook', (req,res) =>{
    const contacts = new Array();
    fs.readFile("./code-samples/phonebook.json", "utf8", (err, data) =>{
        if (err){
            console.log("Error !");
        }
        else{
            const contactInfo = JSON.parse(data);

            if (Object.keys(req.query).length === 0 ){ //no search found    
                for (const info of contactInfo){
                    const contactPerson = new Contact(info.name, info.email, info.phoneNumbers);
                    contacts.push(contactPerson);
                }
                console.log(contacts);
                res.render("phonebook",{"contacts": contacts});
            }
            else{ //start searching
                for (const info of contactInfo){
                    if (info.name.toLowerCase().includes(req.query.contact.toLowerCase()) || info.email.toLowerCase().includes(req.query.contact.toLowerCase())){
                        const contactPerson = new Contact(info.name, info.email, info.phoneNumbers);
                        contacts.push(contactPerson);
                    }
                    else {
                        for (const number of info.phoneNumbers){
                            if (number.includes(req.query.contact)){
                                const contactPerson = new Contact(info.name, info.email, info.phoneNumbers);
                                contacts.push(contactPerson);
                                break;
                            }
                        }
                    }
                }
                res.render("phonebook",{"contacts": contacts});
            }
        }

    });
});

app.post('/phonebook', (req,res) =>{
    fs.readFile("./code-samples/phonebook.json", "utf8", (err, data) =>{
        if (err){
            console.log("Error !");
        }
        else{
            const contactInfo = JSON.parse(data);//no search found    
            const name = req.body.name.trim();
            const email = req.body.email.trim();
            const contact = req.body.phoneNumbers.trim();

            if (name !== "" && email !== "" && contact !== ""){
                const newData = {
                    "phoneNumbers": contact.split(',').map(number => number.trim()),
                    "email": email,
                    "name": name
                };

                contactInfo.push(newData);

                fs.writeFile("./code-samples/phonebook.json", JSON.stringify(contactInfo, null, 4), (err) => {
                    if (err) {
                        console.error("Error writing file:", err);
                    } 
                    else{
                        res.redirect(303, "/phonebook");
                    }
                });
            }
            else {
                res.redirect(303, "/phonebook");
            }
            }
        });    
});

const server = app.listen(3000, () => {
    console.log("Server started; type CTRL+C to shut down ");
});

export {app, decorate, server};