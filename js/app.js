App = Ember.Application.create();

App.Book = Ember.Object.extend({});

App.BookCoverComponent = Ember.Component.extend({
    click: function() {
        this.sendAction('action', this.get('book'));
    }
});

App.Router.map(function() {});

App.IndexRoute = Ember.Route.extend({});

App.IndexController = Ember.Controller.extend({
    search: '',

    matchedBooks: Ember.A(),

    bookshelf: Ember.A(),

    query: function() {
        var that = this,
            query = this.get('search');

        $.getJSON(['http://turbine-staging-eu.herokuapp.com/books.json?q=', query].join(''), function(books) {
            that.set('matchedBooks', Ember.A());

            $(books).each(function(index, bookJSON) {
                var book = App.Book.create(bookJSON);

                that.get('matchedBooks').addObject(book);
            });
        });
    },

    onSearchQueryUpdate: function() {
        // make sure not to kill API server
        Ember.run.debounce(this, this.query, 200);
    }.observes('search'),

    actions: {
        addToBookshelf: function(book) {
            this.get('bookshelf').addObject(book);
        },

        removeFromBookshelf: function(book) {
            this.get('bookshelf').removeObject(book);
        }
    }
});
