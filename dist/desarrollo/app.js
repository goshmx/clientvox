/*jshint -W061 */
$.ajaxSettings.cache = false;

var App = function(opciones){
    var p = this;
    p.appname = opciones.appname;
    p.debug = opciones.debug;
    p.rutas = opciones.rutas;
    p.loader = opciones.loader || 'loader';
    p.url = opciones.url || {};
    p.pre = opciones.pre || function(){};
    p.carga = opciones.carga || ['vistas','esquemas','catalogos'];
    p.carga.forEach(function(elemento){
        p[elemento] = opciones[elemento] || {};
    });
    p.init(p);
    return this;
};

App.prototype.consola = function(mensaje,tipo){
    if(this.debug){
        switch(tipo) {
            case 'debug':
                return console.debug(mensaje);
                break;
            case 'error':
                return console.error(mensaje);
                break;
            case 'info':
                return console.info(mensaje);
                break;
            default:
                return console.log(mensaje);
        }
    }
};

App.prototype.init = function(aplicacion){
    app = this;
    app.consola('Inicializando App','debug');
    var actual = 0;
    var total = aplicacion.carga.map(function(a){return Object.keys(aplicacion[a]).length;}).reduce(function(prev,cur){return cur + prev;},0);
    this.consola('Total de elementos a cargar: ' +total,'debug');

    var cargaElementos = function(tipo,elementos){
        app.consola('========== Cargando ' + tipo + ' ==========','debug');
        var llaves = Object.keys(elementos);
        var destino = $('#'+aplicacion.loader+' .txt');
        llaves.forEach(function(llave,index){
            var url = elementos[llave];
            var intercambiables = url.match(/{\w+}/g);
            if ( intercambiables !== null ) {
                intercambiables.forEach(function(a,b){
                    var l = a.replace('{','');
                    l = l.replace('}','');
                    url = url.replace(a,aplicacion.url[l]);
                });
            }
            app.consola('Cargando ' + llave + '- desde '  + url,'debug');
            $.ajax(url).done(function(d){
                actual++;
                var porcentaje = parseInt((actual/total)*100);
                $('#'+aplicacion.loader+' .porcentaje').html(porcentaje + '%');
                $('#'+aplicacion.loader+' .progress .progress-bar').animate({width:porcentaje+'%'},50);
                elementos[llave] = d;
                if (porcentaje === 100) {
                    app.consola('========== Finalizando la carga de elementos ==========','debug');
                    $('#'+aplicacion.loader).remove();
                    Backbone.history.start();
                }
            }).fail(function(){
                app.consola(this,'error');
                app.consola('Error al cargar ' + this.url,'error');
                $('#'+aplicacion.loader+' .txt').html('Problema cargando... Reintentando...');
                $('#'+aplicacion.loader+' .porcentaje').html('');
                setTimeout(function(){
                    location.reload();
                },10000);
            });
        });
    };

    aplicacion.carga.forEach(function(llave, indice){
        cargaElementos(llave,aplicacion[llave]);
    });
};

App.prototype.render = function( destino, vista, datos ){
    var app = this;
    datos = datos || {};
    var template = Handlebars.compile(vista);
    var html = template(datos);
    var formulario = (vista.match(/form/))? true : false ;
    $(destino).html(html);
    if ( formulario ) {
        $('.form-validate').parsley();
    }
};