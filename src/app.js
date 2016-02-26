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
            case 'error':
                return console.error(mensaje);
            case 'info':
                return console.info(mensaje);
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
    $(destino).html('');
    $(destino).html(html);
    var titulo = $(destino).children().data('title');
    document.title = myApp.appname+" - " + (isDefined(titulo)?titulo:'Inicio');
    if ( formulario ) {
        $('.form-validate').parsley();
        app.sender.init('.form-validate');
    }
    generaTabla('.data-tbl'); /*Asignacion de datatables por default*/
};

App.prototype.sender = {
    default: {
        "attr":{},
        "key": false,
        "backbone": false,
        "model": false,
        "ajax": false,
        "serialize": false,
        "serializeJson": false,
        "method": 'get',
        "action": false,
        "formData": false,
        "callback": false,
        "callbackError": false
    },
    init: function(div){
        myApp.consola('inicializacion de dataSubmit','debug');
        if(typeof div != 'undefined'){
            if(typeof div === 'string'){
                if ($(div).length) { this.form(div); }
                else{  }
            }
            else{ if(typeof div === 'object'){ this.object(div); }}
        }
        else{
            myApp.consola('No esta definido el objeto o div para ejecutar','error');
        }
    },
    form: function(div){
        myApp.consola('Seleccion de Form de dataSubmit','debug');
        var funcion = this;
        var divDom = $(div);
        var attrs = divDom.attrs();

        if ((divDom.find('input[type="file"]').length>0) && (isDefined(divDom.attr('backbone')) === false) && (isDefined(divDom.attr('ajax')) === false)) {
            if(isDefined(divDom.attr('enctype'))){
                if(divDom.attr('enctype') != 'multipart/form-data'){
                    myApp.consola('Hay inputs tipo archivo en el form, no olvides agregar "enctype="multipart/form-data" a tu form para hacer el envio','debug');
                }
            }
            else{
                myApp.consola('Hay inputs tipo archivo en el form, no olvides agregar "enctype="multipart/form-data" a tu form para hacer el envio','debug');
            }
        }

        divDom.submit(function(){
            var dataSubmit = {};

            dataSubmit.attrs = attrs;
            dataSubmit.callback = (isDefined(divDom.attr('callback'))?eval(divDom.attr('callback')):false);
            dataSubmit.callbackError = (isDefined(divDom.attr('callbackError'))?eval(divDom.attr('callbackError')):false);
            dataSubmit.action = (isDefined(divDom.attr('action'))?(divDom.attr('action')):false);
            dataSubmit.key = (isDefined(divDom.attr('key'))?(divDom.attr('key')):false);
            dataSubmit.backbone = isDefined(divDom.attr('backbone'));
            dataSubmit.model = (isDefined(divDom.attr('model')))?((isDefined(myModel[divDom.attr('model')]))?divDom.attr('model'):false):false;
            dataSubmit.ajax = isDefined(divDom.attr('ajax'));
            dataSubmit.method = (isDefined(divDom.attr('method'))?(divDom.attr('method').toLowerCase()):'get');
            dataSubmit.formData = (isDefined(divDom.attr('formdata'))?(divDom.serializefiles()):false);
            dataSubmit.serialize = (isDefined(divDom.attr('serialize'))?(divDom.serialize()):false);

            if ($.fn.serializeJSON){
                if(isDefined(divDom.attr('serializejson'))){
                    dataSubmit.serializeJson = divDom.serializeJSON();
                }
                else{
                    dataSubmit.serializeJson = false;
                }
            }
            else{
                myApp.consola('SerializeJSON no instalado, recomendamos instalarlo via bower.', 'debug');
                dataSubmit.serializeJson = false;
            }

            myApp.consola(dataSubmit,'debug');

            var form = divDom.parsley().validate();
            if(form){
                if((dataSubmit.backbone) && (dataSubmit.model)){
                    funcion.SendBackbone(dataSubmit);
                }else{
                    if((dataSubmit.ajax) && (dataSubmit.action)){
                        funcion.SendAjax(dataSubmit);
                    }
                    else{
                        return true;
                    }
                }
            }
            return false;
        });
    },
    object: function(json){
        myApp.consola('Seleccion de objecto de dataSubmit','debug');
        var funcion = this;
        var dataSubmit = $.extend({}, this.default, json);
        myApp.consola(dataSubmit,'debug');
        if((dataSubmit.backbone) && (dataSubmit.model)){
            funcion.SendBackbone(dataSubmit);
        }else{
            if((dataSubmit.ajax) && (dataSubmit.action)){
                funcion.SendAjax(dataSubmit);
            }
            else{
                return false;
            }
        }
    },
    SendBackbone: function(dataSubmit){
        myApp.consola('Evento canalizado a un Backbone');
        var instancia;
        switch (dataSubmit.method){
            /*Metodo POST nuevo registro*/
            case 'post':
                if(dataSubmit.serializeJson){
                    instancia = new myModel[dataSubmit.model](dataSubmit.serializeJson);
                    instancia.save({}, {
                        success: function (model, response, options) {
                            myApp.consola('Registro guardado en backbone','debug');
                            myApp.consola(response,'debug');
                            if(dataSubmit.callback){
                                dataSubmit.callback(response, dataSubmit.attrs);
                            }
                        },
                        error: function (model, xhr, options) {
                            myApp.consola(model,'error');
                            myApp.consola(xhr,'error');
                            if(dataSubmit.callbackError){
                                dataSubmit.callbackError(xhr, dataSubmit.attrs);
                            }
                        }
                    });
                }
                else{
                    myApp.consola('Envio de POST sin datos, si el modelo esta definido se usaran los datos "default."','debug');
                }
                break;
            /*Metodo GET consulta de registro*/
            case 'get':
                if(dataSubmit.key){
                    instancia = new myModel[dataSubmit.model]({id:dataSubmit.key});
                    instancia.fetch({
                        success: function (response) {
                            myApp.consola('Registro encontrado en backbone','debug');
                            myApp.consola(response.attributes,'debug');
                            if(dataSubmit.callback){
                                dataSubmit.callback(response.attributes, dataSubmit.attrs);
                            }
                        },
                        error: function (model, xhr, options) {
                            myApp.consola(model,'error');
                            myApp.consola(xhr,'error');
                            if(dataSubmit.callbackError){
                                dataSubmit.callbackError(xhr, dataSubmit.attrs);
                            }
                        }
                    });
                }
                else{
                    myApp.consola('Envio de GET "key" requerido', 'error');
                }
                break;
            /*Metodo PUT actualizar registro*/
            case 'put':
                if(dataSubmit.key){
                    instancia = new myModel[dataSubmit.model]({id:dataSubmit.key});
                    instancia.fetch({
                        success: function (response) {
                            myApp.consola('Registro encontrado en backbone','debug');
                            instancia.set(dataSubmit.serializeJson);
                            instancia.save({}, {
                                success: function (model, response, options) {
                                    myApp.consola('Registro actualizado en backbone','debug');
                                    myApp.consola(response,'debug');
                                    if(dataSubmit.callback){
                                        dataSubmit.callback(response, dataSubmit.attrs);
                                    }
                                },
                                error: function (model, xhr, options) {
                                    myApp.consola(model, 'error');
                                    myApp.consola(xhr, 'error');
                                    if (dataSubmit.callbackError) {
                                        dataSubmit.callbackError(xhr, dataSubmit.attrs);
                                    }
                                }
                            });
                        },
                        error: function (model, xhr, options) {
                            myApp.consola(model,'error');
                            myApp.consola(xhr,'error');
                            if(dataSubmit.callbackError){
                                dataSubmit.callbackError(xhr, dataSubmit.attrs);
                            }
                        }
                    });
                }
                else{
                    myApp.consola('Envio de PUT "key" requerido', 'error');
                }
                break;
            /*Metodo DELETE Eliminar registro*/
            case 'delete':
                if(dataSubmit.key) {
                    instancia = new myModel[dataSubmit.model]({id: dataSubmit.key});
                    instancia.destroy({
                        success: function (model, response, options) {
                            myApp.consola('Registro eliminado en backbone','debug');
                            myApp.consola(response,'debug');
                            if(dataSubmit.callback){
                                dataSubmit.callback(response, dataSubmit.attrs);
                            }
                        },
                        error: function (model, xhr, options) {
                            myApp.consola(model, 'error');
                            myApp.consola(xhr, 'error');
                            if (dataSubmit.callbackError) {
                                dataSubmit.callbackError(xhr, dataSubmit.attrs);
                            }
                        }
                    });
                }
                else{
                    myApp.consola('Envio de DELETE "key" requerido', 'error');
                }
                break;
        }
        return false;
    },
    SendAjax: function(dataSubmit){
        myApp.consola('Evento canalizado a un ajax','debug');
        var opcionesAjax ={
            type: dataSubmit.method,
            url: dataSubmit.action,
            dataType: "json"
        };
        if(dataSubmit.formData){
            opcionesAjax.data = dataSubmit.formData;
            opcionesAjax.processData = false;
            opcionesAjax.contentType = false;
        }
        else{
            if(dataSubmit.serializeJson){
                opcionesAjax.data = JSON.stringify(dataSubmit.serializeJson);
            }
            else{
                if(dataSubmit.serialize){
                    opcionesAjax.data = dataSubmit.serialize;
                }
            }
        }
        myApp.consola(opcionesAjax,'debug');
        myApp.consola('Peticion AJAX: '+opcionesAjax.type,'debug');
        myApp.consola('Peticion url: '+opcionesAjax.url,'debug');
        if(isDefined(opcionesAjax.data)){myApp.consola('Peticion parametros: '+opcionesAjax.data);}
        $.ajax(opcionesAjax)
            .done(function(response) {
                myApp.consola('------Respuesta Exitosa-----','debug');
                myApp.consola(response,'debug');
                if(dataSubmit.callback){
                    dataSubmit.callback(response, dataSubmit.attrs);
                }
            })
            .fail(function( jqXHR, textStatus ) {
                myApp.consola("Fallo en la peticion: " + textStatus,'error');
                if(dataSubmit.callbackError){
                    dataSubmit.callbackError(jqXHR, dataSubmit.attrs);
                }
            });
        return false;
    }
};
