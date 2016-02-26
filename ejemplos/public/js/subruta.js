EjemploRouter = Backbone.SubRoute.extend({
    routes: {

        /* matches http://locahost:8888/ejemplo */
        ""               : "indexRouter",

        /* matches http://locahost:8888/ejemplo/test2 */
        "test2"         : "testRouter",


    },
    indexRouter: function() {

        console.log("Entro  a http://locahost:8888/ejemplo");
    },
    testRouter: function() {
        console.log("Entro  a http://locahost:8888/ejemplo/test2");
        console.log(myApp.rutas.param());
    }
});
