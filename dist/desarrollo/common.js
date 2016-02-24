/**
 * readURL
 *
 * @description :: Función para leer campos de tipo file, y generar su "Vista Previa"
 *
 */
function readURL(input) {
  if (input.files && input.files[0]) {
    var reader = new FileReader();
    reader.onload = function (e) {
      $(input).parents('.file-preview').find('img').attr('src', e.target.result);
      $(input).parents('.file-preview').find('.file-name').val($(input).val().split('\\').pop());
    }
    reader.readAsDataURL(input.files[0]);
  }
}



/**
 * generaTabla
 *
 * @description :: Función para Generar DataTables
 *                 Cada propiedad es leida desde los atributos de HTML5 de la tabla.
 * @param {String} div :: El div donde se ejecutará el datatable.
 * @param {Object} srcData :: Un json con los datos a renderizar en la tabla.
 * @param {Object} template :: Objeto con la plantilla a renderizar.
 *
 * @todo Implementar el uso de ServerSide para la páginación.
 *
 *
 */
function generaTabla (div, srcData, template){
  var divDom = $(div);
  var urlRest = divDom.attr('data-urlRest');
  var srcRest = divDom.attr('data-srcRest');
  var srcTemplate = divDom.attr('data-srcTemplate');
  var paging = divDom.attr('paging');
  var ordering = divDom.attr('ordering');
  var info = divDom.attr('info');
  var searching = divDom.attr('searching');

  if ($.fn.dataTable) { //Definimos que si el plugin de datatable existe, se busca una tabla.
    $.fn.dataTable.ext.errMode = 'none';
    var configuracion = {
      "responsive": true,
      'destroy': true,
      'error': function ( xhr, textStatus, error ) { return false;},
      "language": myApp.catalogos.datatbleLang,
      "columnDefs": [ { "targets": [1, 2], "orderable": false }],
      "dom": '<"row" <"col-md-6"l><"col-md-6"f>><"row" <"col-md-12"<"td-content"rt>>><"row" <"col-md-6"i><"col-md-6"p>>',
      'paging':   (isDefined(paging)?true:false),
      'ordering': (isDefined(ordering)?true:false),
      'info':     (isDefined(info)?true:false),
      'searching': (isDefined(searching)?true:false)
    };
    if(isDefined(srcData)){
      configuracion.data = srcData;
    }else{
      if(isDefined(urlRest)){
        myApp.consola(div+' tiene urlRest y es: '+urlRest,'debug');
        configuracion.ajax ={
          url: myApp.url.api+urlRest,
          dataSrc:(typeof urlRest == 'undefined')?'':srcRest
        };
      }
    }
    if(isDefined(srcTemplate)){
      if(isDefined(myApp.vistas[srcTemplate])){
        configuracion.columns = eval(myApp.vistas[srcTemplate]);
      }
      else{
        myApp.consola('El template '+srcTemplate+' no esta definido','error');
      }
    }else{
      if(isDefined(template)){
        configuracion.columns = template;
      }
    }
    $(div).DataTable(configuracion);
    $(div).on( 'xhr.dt', function ( e, settings, processing ) {
      myApp.consola('DataTable consultando a: '+settings.ajax.url,'debug');
    }).on( 'error.dt', function ( e, settings, techNote, message ) {
      myApp.consola('Error de datatable reportado:'+message,'error');
      return false;
    });
  }
  else{
    myApp.consola('No esta definido el plugin de datatables','error');
  }
}
/**
 * formSubmit
 *
 * @param div
 *
 */

var dataSubmit = {
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

    if ((divDom.find('input[type="file"]').length>0) && (isDefined(divDom.attr('backbone')) == false) && (isDefined(divDom.attr('ajax')) == false)) {
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
    switch (dataSubmit.method){
      /*Metodo POST nuevo registro*/
      case 'post':
        if(dataSubmit.serializeJson){
          var instancia = new myModel[dataSubmit.model](dataSubmit.serializeJson);
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
          var instancia = new myModel[dataSubmit.model]({id:dataSubmit.key});
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
          var instancia = new myModel[dataSubmit.model]({id:dataSubmit.key});
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
          var instancia = new myModel[dataSubmit.model]({id: dataSubmit.key});
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


/**
 * isDefined
 *
 * @description :: Función para determinar si un elemento dato esta definido en el DOM del Documento. *
 * @param {*} variable :: Variable que se desea validar
 * @returns {Boolean} Si la variable esta definida o no.
 *
 */
function isDefined(variable){
  if(typeof variable != 'undefined'){
    return true;
  }
  else{
    return false;
  }
}


/*Intento fallido de trabajar con Promises*/
function response(datos, attrs) {
  return new Promise(function(resolve, reject) {
    if (datos) {
      resolve({datos: datos, attrs:attrs});
      return datos;
    }
    else {
      reject(Error("It broke"));
    }
  }).then(function(result){return result;});
};


function testCallback(data, arguments){
  myApp.consola(data,'debug');
  myApp.consola(arguments,'debug');
  myApp.consola('Testing callback de funcion','debug');
}





/**
 * Attrs
 *
 *
 */
(function($) {
  // Attrs
  $.fn.attrs = function(attrs) {
    var t = $(this);
    if (attrs) {
      // Set attributes
      t.each(function(i, e) {
        var j = $(e);
        for (var attr in attrs) {
          j.attr(attr, attrs[attr]);
        };
      });
      return t;
    } else {
      // Get attributes
      var a = {},
        r = t.get(0);
      if (r) {
        r = r.attributes;
        for (var i in r) {
          var p = r[i];
          if (typeof p.nodeValue !== 'undefined') a[p.nodeName] = p.nodeValue;
        }
      }
      return a;
    }
  };
})(jQuery);

/**
 * serializefiles
 *
 *
 */
(function($) {
  $.fn.serializefiles = function() {
    var obj = $(this);
    var formData = new FormData();
    $.each($(obj).find("input[type='file']"), function(i, tag) {
      $.each($(tag)[0].files, function(i, file) {
        formData.append(tag.name, file);
      });
    });
    var params = $(obj).serializeArray();
    $.each(params, function (i, val) {
      formData.append(val.name, val.value);
    });
    return formData;
  };
})(jQuery);
