const video = document.getElementById("video");
let imageData;
let face_ids;
Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri("./modelos"),
    faceapi.nets.faceLandmark68Net.loadFromUri("./modelos"),
    faceapi.nets.faceRecognitionNet.loadFromUri("./modelos"),
    faceapi.nets.faceExpressionNet.loadFromUri("./modelos"),
    faceapi.nets.ageGenderNet.loadFromUri("./modelos")
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
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            faceapi.draw.drawDetections(canvas, resizedDetections);


            imageData = canvas.toDataURL('image/png');


            Compararfaceid();
        }, 100);
    });
});


var Compararfaceid = async () => {
    try {
        const ListUsuarios = await $.get("./controllers/usuario.controllers.php?op=todos");
        const usuarios = JSON.parse(ListUsuarios);
        face_ids = usuarios.map(usuario => usuario.face_id);

        for (const id of face_ids) {
            const tensor1 = await faceapi.fetchImage(imageData);
            const tensor2 = await faceapi.fetchImage('data:image/png;base64,' + id);

            const detection1 = await faceapi.detectSingleFace(tensor1).withFaceLandmarks().withFaceDescriptor();
            const detection2 = await faceapi.detectSingleFace(tensor2).withFaceLandmarks().withFaceDescriptor();

            if (!detection1 || !detection2) {
                console.error("No se pudieron detectar los rostros en una o ambas imágenes.");
                continue; // Continuar con la siguiente iteración
            }

            const faceMatcher = new faceapi.FaceMatcher([detection1.descriptor]);
            const mejorMatch = faceMatcher.findBestMatch(detection2.descriptor);
            console.log(mejorMatch);

            if (mejorMatch._label === "unknown") {
                alert("Los rostros son diferentes.");
            } else {
                alert("Los rostros son iguales.");
            }
        }
    } catch (error) {
        console.error("Ocurrió un error:", error);
    }
};


// // Función para iniciar la autenticación facial
// async function compararRostros() {
//     nuevaImagenBase64 = await capturarRostro();

//     // Convertir las imágenes base64 en tensores


//     // Detectar los rostros en ambas imágenes
//     const detection1 = await faceapi.detectSingleFace(tensor1).withFaceLandmarks().withFaceDescriptor();
//     const detection2 = await faceapi.detectSingleFace(tensor2).withFaceLandmarks().withFaceDescriptor();

//     if (!detection1 || !detection2) {
//         return "No se pudieron detectar los rostros en una o ambas imágenes.";
//     }

//     // Crear faceMatcher con el descriptor del rostro almacenado
//     const faceMatcher = new faceapi.FaceMatcher([detection1.descriptor]);

//     // Encontrar el mejor match en la nueva imagen
//     const mejorMatch = faceMatcher.findBestMatch(detection2.descriptor);

//     // Retornar el mensaje indicando si los rostros son iguales o no
//     console.log(mejorMatch);
//     if (mejorMatch._label === "unknown") {
//         alert("Los rostros son diferentes.")
//     } else {
//         alert("Los rostros son iguales.")
//     }
// }