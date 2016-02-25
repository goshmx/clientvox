var rutas = Backbone.Router.extend({
  titulo : function(pos){
    pos = pos || "Inicio";
    document.title = "Título de la Web -- " + pos;
  },
  routes : {
    '' : 'cargaVista',
    'asignar-vista' : 'cargaVista',
    'limpiar' : 'limpiar',
    'formularioX' : 'mostrarFormulario'
  },
  cargaVista: function(){
    this.titulo("Cargando Vista");
    var datos = {
      usuario : "Un Nombre Aquí"
    };
    myApp.render("#contenedor",myApp.vistas.principal,datos);
  },
  limpiar: function(){
    this.titulo("Contenedor limpio");
    $('#contenedor').html("");
  },
  mostrarFormulario: function(){
    this.titulo("Mostrando Formulario");
    myApp.render("#contenedor",myApp.vistas.formulario);
  }
});