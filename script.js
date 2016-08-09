var itemsdb = new PouchDB('Items')

$(document).ready(function () {
  var listDiv = $('#list')
  var input = $('input.item')

  function itemTemplate (id, content) {
    return '<div id="' + id + '" class="list-item pure-g"><p class="pure-u-1-3">' + content + '</p> ' +
      '<p class="delete pure-u-2-3" href="#" data-id="' + id + '"> Delete </p></div>'
  }

  // add a list of items to UI
  function addAllItemsToUI (items) {
    if (!items.length) {
      listDiv.append('<p class="no-item"> No items yet. Add one. </p>')
      return
    }

    items.forEach(function (item) {
      addItemToUI(item.doc)
    })
  }

  // adds an item to DB
  function addItemToDb (content) {
    itemsdb.put({
      _id: new Date().valueOf().toString(),
      content: content
    }).then(console.log)
      .catch(console.log)
  }

  // removes an item from db
  function removeItemFromDB (id) {
    itemsdb.get(id)
      .then(function (doc) {
        return itemsdb.remove(doc)
      })
      .then(console.log)
      .catch(console.log)
  }

  // add single item to UI
  function addItemToUI (item) {
    listDiv.append(itemTemplate(item._id, item.content))
    attachEventHandler()
  }

  $('button.add').on('click', function (e) {
    var content = input.val()
    addItemToDb(content)
    input.val('')
  })

  function attachEventHandler () {
    $('.delete').on('click', function (e) {
      e.preventDefault()
      var id = $(e.target).attr('data-id')
      removeItemFromDB(id)
    })
  }

  // remove an item from UI
  function removeItemFromUI (id) {
    var selector = '#' + id
    var node = $(selector)
    node.remove()
  }

  itemsdb.changes({
    since: 'now',
    live: true,
    include_docs: true
  }).on('change', function (change) {
    // change.id contains the doc id, change.doc contains the doc
    if (change.deleted) {
      console.log('deleted from db')
      removeItemFromUI(change.id)
    } else {
      $('.no-item').remove()
      addItemToUI(change.doc)
    }
  }).on('error', function (err) {
    console.log('ERROR', err)
  })

  // function to initialize application
  function start () {
    attachEventHandler()

    // first time data load
    itemsdb.allDocs({include_docs: true})
      .then(function (items) {
        console.log(items)
        addAllItemsToUI(items.rows)
      })
      .catch(function (err) {
        console.error('Error getting all items', err)
      })
  }

  start()
})
