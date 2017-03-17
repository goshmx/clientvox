var myApp = new App({
    debug: true,
    appname: "Aplicacion Demo",
    url:{
        app: 'http://localhost:3000/',
        api: 'http://localhost:3000/',
        vistas: '/js/vistas/',
        esquemas: '/js/esquemas/'
    },
    loader: "loader", // ID del div que muestra el mensaje de carga si no se define es loader por defecto
    rutas: new rutas(), // Carga el archivo de rutas de Backbone
    carga: ["vistas",'esquemas',"catalogos"], // Opcional si no se especifica se intentan cargas los 3 elementos
    vistas: {
        'principal' : '{vistas}principal.hbs',
        'admin': '{vistas}admin/index.hbs',
        'subplantilla': '{vistas}subplantilla.hbs',
        'tablaView': '{vistas}tablas.hbs'
    },
    esquemas: {
    },
    catalogos: {
        categorias : '{esquemas}formulario.json'
    }
});

myApp.consola(window.location,'debug');
if(window.location.hostname === 'site.testing'){
    myApp.url.app = 'http://localhost:8000/';
    myApp.url.api = 'http://localhost:8000/';
}