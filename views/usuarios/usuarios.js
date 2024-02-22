function init() {
  $("#form_usuarios").on("submit", (e) => {
    GuardarEditar(e);
  });
}

$().ready(() => {
  CargaLista();
});


var CargaLista = () => {
  var html = "";
  $.get(
    "../../controllers/usuario.controllers.php?op=todos",
    (ListUsuarios) => {
      ListUsuarios = JSON.parse(ListUsuarios);
      $.each(ListUsuarios, (index, usuario) => {
        html += `<tr>
            <td>${index + 1}</td>
            <td>${usuario.Nombres}</td>
            <td>${usuario.Apellidos}</td>
            <td>${usuario.Rol}</td>
            <td>${usuario.Nombre}</td>
<td>
<button class='btn btn-primary' click='uno(${usuario.idUsuarios
          })'>Editar</button>
<button class='btn btn-warning' click='eliminar(${usuario.idUsuarios
          })'>Editar</button>
            `;
      });
      $("#ListaUsuarios").html(html);
    }
  );
};

const video = document.getElementById("video");
let imageData;

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri("../../modelos"),
  faceapi.nets.faceLandmark68Net.loadFromUri("../../modelos"),
  faceapi.nets.faceRecognitionNet.loadFromUri("../../modelos"),
  faceapi.nets.faceExpressionNet.loadFromUri("../../modelos"),
  faceapi.nets.ageGenderNet.loadFromUri("../../modelos"),
  faceapi.nets.faceLandmark68Net.loadFromUri('../../modelos'),
  faceapi.nets.faceRecognitionNet.loadFromUri('../../modelos')
]).then(() => {
  navigator.mediaDevices.getUserMedia({ video: true })
    .then((mediaStream) => {
      video.srcObject = mediaStream;
    })
    .catch((error) => {
      alert("Error al acceder a la cámara web");
    });
});

document.addEventListener("DOMContentLoaded", () => {
  video.addEventListener("play", async () => {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    canvas.width = video.width;
    canvas.height = video.height;
    
    const displaySize = { width: canvas.width, height: canvas.height };
    faceapi.matchDimensions(canvas, displaySize);
    setInterval(async () => {
      const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions());
      const resizedDetections = faceapi.resizeResults(detections, displaySize);
      context.drawImage(video,0,0, canvas.width,canvas.height);
      faceapi.draw.drawDetections(canvas, resizedDetections);

      
      
      imageData = canvas.toDataURL('image/png');

    }, 100);
  });
});


var GuardarEditar = (e) => {
  e.preventDefault();
  var DatosFormularioUsuario = new FormData($("#form_usuarios")[0]);
  var accion = "../../controllers/usuario.controllers.php?op=insertar";
  DatosFormularioUsuario.append('face_id', imageData);
  console.log(imageData);

  for (var pair of DatosFormularioUsuario.entries()) {
    console.log(pair[0] + ", " + pair[1]);
  }

  /**
   * if(SucursalId >0){editar   accion='ruta para editar'}
   * else
   * { accion = ruta para insertar}
   */
  $.ajax({
    url: accion,
    type: "post",
    data: DatosFormularioUsuario,
    processData: false,
    contentType: false,
    cache: false,
    success: (respuesta) => {
      console.log(respuesta);
      respuesta = JSON.parse(respuesta);
      if (respuesta == "ok") {
        alert("Se guardo con éxito");
        CargaLista();
        LimpiarCajas();
      } else {
        alert("no tu pendejada");
      }
    },
  });
};

var uno = () => { };

var sucursales = () => {
  return new Promise((resolve, reject) => {
    var html = `<option value="0">Seleccione una opción</option>`;
    $.post(
      "../../controllers/sucursal.controllers.php?op=todos",
      async (ListaSucursales) => {
        ListaSucursales = JSON.parse(ListaSucursales);
        $.each(ListaSucursales, (index, sucursal) => {
          html += `<option value="${sucursal.SucursalId}">${sucursal.Nombre}</option>`;
        });
        await $("#SucursalId").html(html);
        resolve();
      }
    ).fail((error) => {
      reject(error);
    });
  });
};

var roles = () => {
  return new Promise((resolve, reject) => {
    var html = `<option value="0">Seleccione una opción</option>`;
    $.post(
      "../../controllers/rol.controllers.php?op=todos",
      async (ListaRoles) => {
        ListaRoles = JSON.parse(ListaRoles);
        $.each(ListaRoles, (index, rol) => {
          html += `<option value="${rol.idRoles}">${rol.Rol}</option>`;
        });
        await $("#RolId").html(html);
        resolve();
      }
    ).fail((error) => {
      reject(error);
    });
  });
};

var eliminar = () => { };

var LimpiarCajas = () => {
  (document.getElementById("Nombres").value = ""),
    (document.getElementById("Apellidos").value = ""),
    (document.getElementById("Correo").value = ""),
    (document.getElementById("contrasenia").value = ""),
    $("#ModalUsuarios").modal("hide");
};
init();


