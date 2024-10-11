// contact.mjs
class Contact {
    constructor(name, email, phoneNumbers) {
        this.name = name;
        this.email = email;
        this.phoneNumbers = phoneNumbers;
      }
}
const contact = new Contact("Tony Montana", "tony.m@example.com", ["222-555-0120", "444-555-9981"]);

console.log(contact.name); // Tony Montana
console.log(contact.email); // tony.m@example.com
console.log(contact.phoneNumbers); // ["222-555-0120", "444-555-9981"]

export {Contact};