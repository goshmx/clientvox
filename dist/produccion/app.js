$.ajaxSettings.cache=!1;var App=function(a){var r=this;return r.rutas=a.rutas,r.loader=a.loader||"loader",r.url=a.url||{},r.pre=a.pre||function(){},r.carga=a.carga||["vistas","esquemas","catalogos"],r.carga.forEach(function(e){r[e]=a[e]||{}}),r.init(r),this};App.prototype.init=function(a){var r=0,e=a.carga.map(function(r){return Object.keys(a[r]).length}).reduce(function(a,r){return r+a},0),o=function(o,t){{var n=Object.keys(t);$("#"+a.loader+" .txt")}n.forEach(function(o){var n=t[o],i=n.match(/{\w+}/g);null!==i&&i.forEach(function(r){var e=r.replace("{","");e=e.replace("}",""),n=n.replace(r,a.url[e])}),$.ajax(n).done(function(n){r++;var i=parseInt(r/e*100);$("#"+a.loader+" .porcentaje").html(i+"%"),t[o]=n,100===i&&($("#"+a.loader).remove(),Backbone.history.start())}).fail(function(){$("#"+a.loader+" .txt").html("Problema cargando... Reintentando..."),$("#"+a.loader+" .porcentaje").html(""),setTimeout(function(){location.reload()},1e4)})})};a.carga.forEach(function(r){o(r,a[r])})},App.prototype.render=function(destino,vista,datos){var app=this,formulario=vista.match(/form/)?!0:!1;datos=datos||{},$(destino).html(Mustache.render(vista,datos)),formulario&&$(".formulario-envio").submit(function(e){e.preventDefault();var formulario=$(this),accion=formulario.attr("action"),metodo=formulario.attr("method").length>0?formulario.attr("method"):"get",registro=$.unserialize(formulario.serialize()),esquema=formulario.attr("data-esquema"),errores=SchemaInspector.validate(app.esquemas[esquema],registro).format(),errExp=/@\.(.*):./g,invalidos=errExp.matches(errores);invalidos.length>0?$.each(invalidos,function(a,r){var e=r[1];formulario.find("input[name='"+e+"']").css("border","1px red solid")}):$.ajax({type:metodo,url:accion,data:registro}).done(function(x){var cb=app.esquemas[esquema].cb||{};eval(cb.ok||"")}).fail(function(xhrObj,mensaje){var cb=app.esquemas[esquema].cb||{};eval(cb.error||"")})})};