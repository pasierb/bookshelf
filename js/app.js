App = Ember.Application.create();

// Routes --------------------------------------------------

App.IndexRoute = Ember.Route.extend({
    setupController: function(controller, model) {
        var bookshelfController = this.controllerFor('bookshelf'),
            storedBookshelf = Ember.A($.jStorage.get('bookshelf'));

        storedBookshelf = storedBookshelf.map(function(bookJSON) {
            return App.Book.create(bookJSON);
        });

        bookshelfController.set('content', storedBookshelf);

        return this._super(controller, model);
    },

    renderTemplate: function() {
        this.render('search', {
            controller: 'search'
        });

        this.render('bookshelf', {
            into: 'search',
            outlet: 'bookshelf',
            controller: 'bookshelf'
        })
    }
});

// Controllers ---------------------------------------------

App.SearchController = Ember.ArrayController.extend({
    query: function() {
        var that = this,
            queryString = this.get('searchQuery');

        $.getJSON(['http://turbine-staging-eu.herokuapp.com/books.json?q=', this.get('searchQuery')].join(''), function(books) {
            that.clear();

            $(books).each(function(index, bookJSON) {
                that.addObject(App.Book.create(bookJSON));
            });
        });
    },

    onSearchQueryUpdate: function() {
        Ember.run.debounce(this, this.query, 200); // make sure not to kill API server
    }.observes('searchQuery')
});

App.BookshelfController = Ember.ArrayController.extend({
    arrayContentDidChange: function(startIndex, removeAmount, addAmount) {
        $.jStorage.set('bookshelf', this.get('content'));

        return this._super(startIndex, removeAmount, addAmount);
    },

    actions: {
        add: function(book) {
            var collection = this.get('content');

            collection.addObject(book);

            console.log(collection); // task requirement!
        },

        reorder: function(book, newOrder) {
            var content = this.get('content'),
                swapedBook = content.findBy('order', newOrder);

            console.log(book);
            console.log(newOrder);
            console.log(swapedBook);


            swapedBook.set('order', book.get('order'));
            book.set('order', newOrder);

            this.arrayContentDidChange();
        }
    }
});

// Models ----------------------------------------------------

App.Book = Ember.Object.extend({});

// Components ------------------------------------------------

App.BookCoverComponent = Ember.Component.extend({
    dragStart: function(event) {
        var dataTransfer = event.dataTransfer;

        dataTransfer.setData('action', this.get('action'));
        dataTransfer.setData('bookJSON', JSON.stringify(this.get('book')));
    }
});

// Views -----------------------------------------------------

App.BookshelfView = Ember.View.extend({
    templateName: 'bookshelf',

    dragOver: function(event) {
        event.preventDefault();
        return false;
    },

    drop: function(event) {
        var book = App.Book.create(JSON.parse(event.dataTransfer.getData('bookJSON')));

        console.log(event);

        this.get('controller').send(event.dataTransfer.getData('action'), book);
    }
});
