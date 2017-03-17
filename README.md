# Clientvox
Clientvox es un core de librerías que permiten desarrollar de forma mucho más rápida aplicaciones web basadas en Backbone.js

Las librerias con las trabaja son:

- Backbone
- Handlebars
- Parsley.js
- Datatables
- Jquery.serializeJSON
- Backbone.subroute

Todas son cargadas por clientvox via bower install...

    bower install --save clientvox

#### Descripción de funciones.
##### Integración con Backbone
Integración de la lógica del  framework Backbone.
##### Rutas
Sistema de Ruteo y subruteo para separar la aplicación en módulos utilizando [Backbone.subroutes], ademas de funciones definidas para paso de parametros y "atras".
##### Validación de formularios.
Utilizando [parsley.js] para realizar validación de formularios en el HTML.
##### Sistema de plantillas handlebars
Uso de vistas renderizadas con [handlebars].
##### Visualización de información en datatables
Integración de funciones para inicializar datatables de forma sencilla.
##### Archivo de configuración único.
Un archivo para controlar el comportamiento de la App, con banderas para habilitar el debug, urls, carpetas etc.

### Inicialización
1. Inicializar los scripts y sus dependencias.
2. Insertar archivos js, adicionales.
3. Insertar las rutas y subrutas que utilizará la aplicación.
4. Insertar el archivo de inicialización del sistema.


#### Archivo de Inicialización
Es una objecto js, descrito como el siguiente ejemplo:

```javascript
    var myApp = new App({
        debug: true, //Habilita el modo debug de la app
        appname: "Aplicacion Demo", //Habilita el modo debug de la app
        url:{
            app: 'http://localhost:8888/', //Url de la app
            api: 'http://localhost:8888/', //Url del la api
            vistas: '/js/vistas/', //Carpeta de vistas
            esquemas: '/js/esquemas/' //Carpeta de esquemas
        },
        loader: "loader", // ID del div que muestra el mensaje de carga si no se define es loader por defecto
        rutas: new rutas(), // Carga el archivo de rutas de Backbone
        carga: ["vistas",'esquemas',"catalogos"], // Opcional si no se especifica se intentan cargas los 3 elementos
        vistas: {
            'principal' : '{vistas}principal.hbs',
            'admin': '{vistas}admin/index.hbs'
        },
        esquemas: {
        },
        catalogos: {
            categorias : '{esquemas}formulario.json'
        }
    });

    myApp.consola(window.location,'debug');
    if(window.location.hostname === 'site.testing'){ //Se activa para trabajar en entornos de debug
        myApp.url.app = 'http://localhost:8000/';
        myApp.url.api = 'http://localhost:8000/';
    }
```

#### Método sender
Clientvox incorpora un sender que puede enlazarse a un elemento dom, vía jquery o bien usarse de forma independiente, y esta preparado para trabajar con módelos de Backbone, envios ajax y como un evento submit de html.

Utiliza como paradigma el método REST para trabajar con los diferentes envíos de http:
- Get: Consulta de registro.
- Post: Nuevo registro.
- Put: Actualizacion de registro.
- Delete: Eliminación de un registro.

```javascript
    */ El parametro puede ser un objeto o el selector(form) de Jquery a enlazar */
    //Ejemplo myApp.sender.init($('.formulario'));
    //Ejemplo myApp.sender.init({backbone: true, model:'user', method: 'post'});
    myApp.sender.init(param);
```

##### Parámetros
El Objeto que debe mandarse como referencia es el siguiente:
```javascript
    param: {
        "attr":{}, //Atributos adicionales que pueden enviar al modelo.
        "key": false, //ID que servirá como referencia.
        "backbone": false, //Indicamos que usaremos backbone.
        "model": false, //Nombre del modelo de backbone
        "ajax": false, //Indicamos que usaremos Ajax
        "serialize": false, //Datos serializados como cadena
        "serializeJson": false, //Datos serializados como objeto
        "method": 'get', // Metodo a utilizar en el REST
        "action": false, // URL de la petición Ajax
        "formData": false, // Datos enviados como formData(archivos)
        "callback": false, //Evento de realizarse exitosamente el envío
        "callbackError": false //Evento de error del envío
    },
```
Nota: Los campos del objeto no son todos obligatorios.

Pueden solo utilizarse los que vayamos a requerir para situaciones especificas:

- Petición get de un usuario via backbone:

```javascript
    myApp.sender.init({
        backbone:true,
        model:'user',
        method: 'get',
        key:2,
        callback: function(respuesta){
            console.log(respuesta);
        }
    });
```

- Envío de datos por post vía ajax(nuevo registro) via serializeJson:

```javascript
    myApp.sender.init({
        attr: {
            dataOne: 1,
            dataTwo: 'Two'
        }
        ajax: true,
        action: 'http://localhost/usuario',
        serializeJson: true,
        method: 'post',
        callback: function(respuesta,attr){
            console.log(respuesta);
            console.log(attr.dataOne);
        },
        callbackError: function(error){
            console.log('Ha ocurrido un error');
        }
    });
```

##### Vía HTML
El sender puede ser inicializado y enlazado a un form y leer sus propiedades directamente del HTML. En el siguiente ejemplo se estan agregando los atributos para hacer un POST a una URL via AJAX, y al terminar llamar al método **metodoExito**.

```html
    <form class="form-validate" ajax action="http://localhost/usuario" method="post" serializejson callback="metodoExito">
        <input type="text" name="username" required>
        <input type="hidden" name="password" required>
        <button>Enviar<button>
    </form>
```

O bien si solo queremos hacer uso de la validación, solo será necesario agregar la clase:
```html
    <form class="form-validate">
        <input type="text" name="username" required>
        <input type="hidden" name="password" required>
        <button>Enviar<button>
    </form>
```

#### Método render
Permite renderizar una plantilla cargada en un elemento DOM de Jquery proporcionado, extendiendo Handlebars para tal propósito, ademas cada vista renderizada, tiene la capacidad de cargar vistas dentro de las mismas.

El método de renderizado es variable, seleccionando una vista en memoria, una vista dentro del HTML via selector de Jquery, o bien, solo ejecutar realizar una petición y un callback.

Permite ingresar datos como objeto o consultar una URL mediante una petición http GET vía AJAX.

```javascript
    /*
    * Donde #div es el elementoDOM de Jquery donde se insertará la plantilla
    * myApp.vistas.users es la plantilla previamente cargada(.hbs).
    * datos Objeto con datos a renderizar en la plantilla.
    */
    myApp.render($("#div"),myApp.vistas.users, datos);
```

Ejemplo renderizando una plantilla .hbs que internamente tiene 2 plantillas más:
```hbs
<h1>Vista principal</h1>
<p>{{usuario}}</p>

<div class="render-tpl" urlSource="http://swapi.co/api/films/" vista="myApp.vistas.subplantilla" callback="testFuction"></div>

<div class="render-tpl" urlSource="http://swapi.co/api/films/" callback="testFuction"></div>
```

Los parametros para ejecutar el renderizado dentro de las rutas o controladores de la aplicación son:
```javascript
def = {
        destino:false, //Definido por un div via ID. ej. $(#div)
        vista: false, //Vista tomada de la memoria interna de la app. ej. myApp.vistas.admin
        datos: false, //Estructura de datos en json que se envian a la vista
        posicion: false, //La posicion del div generado prepend | append .
        urlSource: false, //Si la vista puede realizar una consulta via AJAX a un recurso http por GET
        vistaInline:false,//Vista tomada directamente del HTML de la plantilla ej. #vista-tpl
        callback:false, //La función que se ejecutará en caso de ejecutar correctamente la petición de urlSource
        onError:false //
    };
```
Asimismo, cada vista renderizada, busca internamente por:
- Otras vistas
- Datatables
- Formularios para validación

Nota: Es posible cambiar el titulo del sitio, cada plantilla busca en el primer elemento de render, si llega a encontra el atributo **data-title** lo asignará en el title del sitio.


#### Métodos rutas.
Dentro de la rutas se han implementado algunas funciones para facilitar el trabajo con el manejo de las mismas.

##### Back()
Permite regresar hacia la ruta anterior a la actual.

```javascript
    /*Regresar un paso en la historia del navegador*/
    myApp.rutas.back();
```

##### Navigate()
Permite redireccionar a una vista especificada, con la diferencia que permite el envío de parametros que se pasan directamente a la ruta.

```javascript
    myApp.rutas.navigate('admin/user/edit',{params:{id:2}});
```

En la función de rutas simplemente se asignan los valores como se muestra:

```javascript
    usuariosEditar: function(){
        var data = this.param();
    }
```

##### Subrutas
Las subrutas esta definidas extendiendo un plugin de Backbone [Backbone.subroutes] que permite instanciar directamente a un objeto y ejecutarlo en tu router principal.

Se genera un archivo de subruta donde se genera el codigo para dicha Subruta, ejemplo:

```javascript
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
        }
    });
```

En nuestro archivo de rutas, simplemente lo instanciamos.

```javascript
    /*Archivo de Rutas principal*/
    routes : {
        'ejemplo/*subroute'  : "invocaEjemploRoute"
    },
    invocaEjemploRoute: function(subroute) {
            EjemploRouter = new EjemploRouter("ejemplo/");
    },
```

#### Datatables
Clientvox incorpora una función que se enlaza al DOM via Jquery para trabajar con Datatables de forma que los atributos sean leidos de los atributos de HTML.

... Pendiente de documentar.

### Versión
1.0.1

### Tech
Clientvox utiliza las siguientes tecnologias para funcionar:

* [Backbone] - gives structure to web applications
* [Backbone.subroutes] - extends the functionality of Backbone.router
* [serializeJSON] - gives structure to web applications
* [Handlebars] - provides the power to let you build semantic templates
* [Parsley.js] - Validate forms, without writing a single line of javascript
* [Datatables] - add advanced interaction controls to any HTML table
* [node.js] - evented I/O for the backend
* [Express] -  node.js network app framework
* [Gulp] - the streaming build system
* [jQuery] - Libreria para interartuar con el DOM.



### Todos

 - Hacer pruebas
 - Perfeccionar el uso de la función de datatables
 - Agregar documentación al código
 - Hacer un ejemplo más detallado

License
----

MIT

**Así habló el maestro programador:**
> **“Después de tres días sin programar, la vida pierde sentido”**

   [PlDb]: <https://github.com/joemccann/dillinger/tree/master/plugins/dropbox/README.md>
   [PlGh]:  <https://github.com/joemccann/dillinger/tree/master/plugins/github/README.md>
   [PlGd]: <https://github.com/joemccann/dillinger/tree/master/plugins/googledrive/README.md>
   [PlOd]: <https://github.com/joemccann/dillinger/tree/master/plugins/onedrive/README.md>

   [Backbone]: <https://github.com/jashkenas/backbone>
   [parsley.js]: <http://parsleyjs.org>
   [Backbone.subroutes]: <https://github.com/BackboneSubroute/backbone.subroute>
   [handlebars]: <http://handlebarsjs.com>
   [Datatables]: <https://github.com/DataTables/DataTables>
   [serializeJSON]: <https://github.com/marioizquierdo/jquery.serializeJSON>
   [node.js]: <http://nodejs.org>
   [jQuery]: <http://jquery.com>
   [express]: <http://expressjs.com>
   [Gulp]: <http://gulpjs.com>



