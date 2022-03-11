// create the db variable
let db;
// open the budget-this database
const request = indexedDB.open('budget-this', 1);

// on error
request.onerror = event => {
    console.log("Oops, something went wrong" + event.target.errorCode);
};

// on success 
request.onsuccess = event => {
    db = event.target.result;
    
    if (navigator.online) {
        checkDB();
    }
};

request.onupgradeneeded = function (event) {
    const db = event.target.result;
    db.createObjectStore("new_item", { autoInrement: true });
};

function checkDB() {
    // create transaction in db
    const transaction = db.transaction(["new_item"], 'readwrite');
    // access the object store
    const store = transaction.objectStore(["new_item"]);
    // get all records from the store and assign variable
    const getAll = store.getAll();

    getAll.onsuccess = function () {
        if (getAll.result.length > 0) {
            fetch("/api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json"
                }
            })
                .then(response => response.json())
                .then(() => {
                    // if successful, open a transaction on your pending db
                    const transaction = db.transaction(["pending"], "readwrite");
                    // access your pending object store
                    const store = transaction.objectStore("pending");
                    // clear all items in your store
                    store.clear();
                });
        }
    };
};

function offlineSave(record) {
    // create transaction in db
    const transaction = db.transaction(['new_item'], 'readwrite');
    // access the object store
    const store = transaction.objectStore("new_item");
    // add the record to the store
    store.add(record);
};

// listen for online connection reestablish
window.addEventListener("online", checkDB);