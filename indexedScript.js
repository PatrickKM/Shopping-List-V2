window.onload = function() {
  
  // Display the shop items.
  shopDB.open(refreshshops);
  
  
  // Get references to the form elements.
  var newshopForm = document.getElementById('new-shop-form');
  var newshopInput = document.getElementById('new-shop');
  
  
  // Handle new shop item form submissions.
  newshopForm.onsubmit = function() {
    // Get the shop text.
    var text = newshopInput.value;
    
    // Check to make sure the text is not blank (or just spaces).
    if (text.replace(/ /g,'') != '') {
      // Create the shop item.
      shopDB.createshop(text, function(shop) {
        refreshshops();
      });
    }
    
    // Reset the input field.
    newshopInput.value = '';
    
    // Don't send the form.
    return false;
  };
  
}

// Update the list of shop items.
function refreshshops() {  
  shopDB.fetchshops(function(shops) {
    var shopList = document.getElementById('shop-items');
    shopList.innerHTML = '';

    for(var i = 0; i < shops.length; i++) {
      // Read the shop items backwards (most recent first).
      var shop = shops[(shops.length - 1 - i)];

      var li = document.createElement('li');
      li.id = 'shop-' + shop.timestamp;
      var checkbox = document.createElement('input');
      checkbox.type = "checkbox";
      checkbox.className = "shop-checkbox";
      checkbox.setAttribute("data-id", shop.timestamp);

      li.appendChild(checkbox);

      var span = document.createElement('span');
      span.innerHTML = shop.text;

      li.appendChild(span);

      shopList.appendChild(li);

      // Setup an event listener for the checkbox.
      checkbox.addEventListener('click', function(e) {
        var id = parseInt(e.target.getAttribute('data-id'));

        shopDB.deleteshop(id, refreshshops);
      });
    }

  });
}




