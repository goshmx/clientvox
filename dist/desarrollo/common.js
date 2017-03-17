/*jshint -W061 */
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
    };
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
  var divDom = div;
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
    div.DataTable(configuracion);
    div.on( 'xhr.dt', function ( e, settings, processing ) {
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
 * loadHTML
 *
 * @description :: Función para renderizar una plantilla en formato de handlebars.
 * @param  {tpl} string :: Cadena con el HTML para renderizar.
 * @param  {data} json :: Archivo json para evaluarlo con la cadena HTML.
 * #returns {string} El resultado de la evaluación por Handlebars.
 *
 */

function loadHTML(tpl,data){
    var template = Handlebars.compile(tpl);
    if(isDefined(data)){
        return template(data);
    }
    else{
        return template;
    }
}

function putHTML(destinoDom,html,posicion){
    if(posicion == 'append'){
        destinoDom.appendTo(destino);
    }else{
        if(posicion == 'prepend'){
            destinoDom.prependTo(destino);
        }
        else{
            destinoDom.html('');
            destinoDom.html(html);
        }
    }
}

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
        }
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
