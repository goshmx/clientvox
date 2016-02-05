/*jshint -W061 */
$.ajaxSettings.cache = false;

var App = function(opciones){
    var p = this;
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
    var formulario = (vista.match(/form/))? true : false ;
    datos = datos || {};
    $(destino).html(Mustache.render(vista,datos));
    if ( formulario ) {
        $('.formulario-envio').submit(function(e){
            e.preventDefault();
            var formulario = $(this);
            var accion = formulario.attr('action');
            var metodo = formulario.attr('method').length > 0 ? formulario.attr('method') : 'get' ;
            var registro = $.unserialize(formulario.serialize());
            var esquema = formulario.attr('data-esquema');
            var errores = SchemaInspector.validate(app.esquemas[esquema],registro).format();
            var errExp = /@\.(.*):./g;
            var invalidos = errExp.matches(errores);
            if( invalidos.length > 0 ) {
                this.consola(invalidos);
                $.each(invalidos,function(indice, valor){
                    var nombre = valor[1];
                    // Rutina para colorear campos con errores
                    formulario.find('input[name="'+nombre+'"]').css('border','1px red solid');
                });
            }else{
                $.ajax({
                    type: metodo,
                    url: accion,
                    data: registro
                }).done(function(x){
                    var cb = app.esquemas[esquema].cb || {};
                    eval(cb.ok || '');
                }).fail(function( xhrObj , mensaje ){
                    var cb = app.esquemas[esquema].cb || {};
                    eval(cb.error || '');
                });
            }
            console.log(errores) ;
            console.log(registro);
        });
    }
};