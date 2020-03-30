var shopDB = (function() {
  var tDB = {};
  var datastore = null;

  /**
   * Open a connection to the datastore.
   */
  tDB.open = function(callback) {
    // Database version.
    var version = 1;

    // Open a connection to the datastore.
    var request = indexedDB.open('shops', version);

    // Handle datastore upgrades.
    request.onupgradeneeded = function(e) {
      var db = e.target.result;

      e.target.transaction.onerror = tDB.onerror;

      // Delete the old datastore.
      if (db.objectStoreNames.contains('shop')) {
        db.deleteObjectStore('shop');
      }

      // Create a new datastore.
      var store = db.createObjectStore('shop', {
        keyPath: 'timestamp'
      });
    };

    // Handle successful datastore access.
    request.onsuccess = function(e) {
      // Get a reference to the DB.
      datastore = e.target.result;
      
      // Execute the callback.
      callback();
    };

    // Handle errors when opening the datastore.
    request.onerror = tDB.onerror;
  };


  /**
   * Fetch all of the shop items in the datastore.
   * @param {function} callback A function that will be executed once the items
   *                            have been retrieved. Will be passed a param with
   *                            an array of the shop items.
   */
  tDB.fetchshops = function(callback) {
    var db = datastore;
    var transaction = db.transaction(['shop'], 'readwrite');
    var objStore = transaction.objectStore('shop');

    var keyRange = IDBKeyRange.lowerBound(0);
    var cursorRequest = objStore.openCursor(keyRange);

    var shops = [];

    transaction.oncomplete = function(e) {
      // Execute the callback function.
      callback(shops);
    };

    cursorRequest.onsuccess = function(e) {
      var result = e.target.result;
      
      if (!!result == false) {
        return;
      }
      
      shops.push(result.value);

      result.continue();
    };

    cursorRequest.onerror = tDB.onerror;
  };


  /**
 * Create a new shop item.
 */
tDB.createshop = function(text, callback) {
  // Get a reference to the db.
  var db = datastore;

  // Initiate a new transaction.
  var transaction = db.transaction(['shop'], 'readwrite');

  // Get the datastore.
  var objStore = transaction.objectStore('shop');

  // Create a timestamp for the shop item.
  var timestamp = new Date().getTime();

  // Create an object for the shop item.
  var shop = {
    'text': text,
    'timestamp': timestamp
  };

  // Create the datastore request.
  var request = objStore.put(shop);

  // Handle a successful datastore put.
  request.onsuccess = function(e) {
    // Execute the callback function.
    callback(shop);
  };

  // Handle errors.
  request.onerror = tDB.onerror;
};


  /**
   * Delete a shop item.
   * @param {int} id The timestamp (id) of the shop item to be deleted.
   * @param {function} callback A callback function that will be executed if the 
   *                            delete is successful.
   */
  tDB.deleteshop = function(id, callback) {
    var db = datastore;
    var transaction = db.transaction(['shop'], 'readwrite');
    var objStore = transaction.objectStore('shop');
    
    var request = objStore.delete(id);
    
    request.onsuccess = function(e) {
      callback();
    }
    
    request.onerror = function(e) {
      console.log(e);
    }
  };


  // Export the tDB object.
  return tDB;
}());
