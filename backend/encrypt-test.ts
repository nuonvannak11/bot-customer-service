import HashData from "./src/helper/hash_data";

const hash = new HashData();

const phone = "85512345678";
const password = "password123";

console.log("Encrypted phone:", hash.encryptData(phone));
console.log("Encrypted password:", hash.encryptData(password));
